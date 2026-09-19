import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/apiClient";
import {
  SIGNED_URL_SAFETY_MARGIN_MS,
  createSignedMediaUrlCache,
  normalizeMediaUrlError,
  type SignedMediaUrl,
} from "./mediaSignedUrl";

/**
 * Spec 85 — Fase 4, criterio 6: el visor resuelve la evidencia por URL firmada
 * bajo demanda y la renueva sin recargar la página.
 *
 * ESTAS PRUEBAS NACEN EN ROJO: `lib/media/mediaSignedUrl.ts` no existe todavía.
 *
 * Contrato que asume esta suite (la implementación debe respetarlo):
 *
 *   createSignedMediaUrlCache({
 *     fetch: (attachmentId: string) => Promise<SignedMediaUrl>,
 *     safetyMarginMs?: number,   // default: SIGNED_URL_SAFETY_MARGIN_MS
 *     now?: () => number,        // inyectable para poder probar el vencimiento
 *   }) => {
 *     resolve(attachmentId): Promise<MediaUrlResult>,
 *     invalidate(attachmentId): void,
 *     clear(): void,
 *   }
 *
 *   MediaUrlResult =
 *     | { ok: true; value: SignedMediaUrl }
 *     | { ok: false; error: { kind: MediaUrlErrorKind; message: string } }
 *
 *   MediaUrlErrorKind = "network" | "not_ready" | "not_found" | "forbidden" | "unknown"
 *
 * El módulo es lógica pura a propósito: `vitest.config.ts` corre en entorno
 * `node`, solo recoge `*.test.ts` y no hay jsdom ni Testing Library (y el
 * spec 85 deja explícito que no se instalan). El componente
 * `MediaAttachmentViewer.tsx` queda reducido a presentación y se valida a mano
 * en `docs/testing/test-085-privacidad-multimedia-datos-sensibles.md`.
 *
 * Por qué el resultado es un objeto `{ ok }` y no una excepción: el visor
 * necesita pintar un estado de error con botón «Volver a cargar», no atrapar
 * un throw en cada render.
 */

const ATTACHMENT_ID = "11111111-1111-4111-8111-111111111111";
const OTRO_ATTACHMENT_ID = "22222222-2222-4222-8222-222222222222";

const T0 = Date.UTC(2026, 8, 18, 12, 0, 0);

function signed(overrides: Partial<SignedMediaUrl> = {}): SignedMediaUrl {
  return {
    attachmentId: ATTACHMENT_ID,
    url: "https://r2.example/evidencia.jpg?X-Amz-Signature=uno",
    expiresAt: new Date(T0 + 900_000).toISOString(),
    mimeType: "image/jpeg",
    originalFilename: "evidencia.jpg",
    ...overrides,
  };
}

/** Reloj controlable: el margen de seguridad se prueba moviendo el tiempo. */
function clock(start = T0) {
  let current = start;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
  };
}

// ─── caché por attachmentId ─────────────────────────────────────────────────

describe("createSignedMediaUrlCache — caché por attachmentId", () => {
  it("dos llamadas seguidas no disparan dos peticiones", async () => {
    const fetch = vi.fn(async () => signed());
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    const primera = await cache.resolve(ATTACHMENT_ID);
    const segunda = await cache.resolve(ATTACHMENT_ID);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(primera).toEqual(segunda);
    expect(primera.ok).toBe(true);
  });

  it("devuelve la URL, el mimeType y el nombre original del backend", async () => {
    const fetch = vi.fn(async () => signed());
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    const result = await cache.resolve(ATTACHMENT_ID);

    expect(result).toEqual({
      ok: true,
      value: {
        attachmentId: ATTACHMENT_ID,
        url: "https://r2.example/evidencia.jpg?X-Amz-Signature=uno",
        expiresAt: new Date(T0 + 900_000).toISOString(),
        mimeType: "image/jpeg",
        originalFilename: "evidencia.jpg",
      },
    });
  });

  it("cachea por adjunto: dos adjuntos distintos piden por separado", async () => {
    const fetch = vi.fn(async (id: string) => signed({ attachmentId: id }));
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    await cache.resolve(ATTACHMENT_ID);
    await cache.resolve(OTRO_ATTACHMENT_ID);
    await cache.resolve(ATTACHMENT_ID);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls.map(([id]) => id)).toEqual([
      ATTACHMENT_ID,
      OTRO_ATTACHMENT_ID,
    ]);
  });

  it("dos llamadas concurrentes comparten una sola petición (R4: throttler 60 req/min)", async () => {
    const fetch = vi.fn(
      () =>
        new Promise<SignedMediaUrl>((resolve) =>
          setTimeout(() => resolve(signed()), 5),
        ),
    );
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    const [a, b] = await Promise.all([
      cache.resolve(ATTACHMENT_ID),
      cache.resolve(ATTACHMENT_ID),
    ]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
  });
});

// ─── margen de seguridad ────────────────────────────────────────────────────

describe("createSignedMediaUrlCache — margen de seguridad antes de expiresAt", () => {
  it("expone un margen de seguridad por defecto mayor que cero", () => {
    expect(SIGNED_URL_SAFETY_MARGIN_MS).toBeGreaterThan(0);
  });

  it("reutiliza la URL cacheada cuando falta mucho para expiresAt", async () => {
    const reloj = clock();
    const fetch = vi.fn(async () => signed());
    const cache = createSignedMediaUrlCache({
      fetch,
      now: reloj.now,
      safetyMarginMs: 30_000,
    });

    await cache.resolve(ATTACHMENT_ID);
    reloj.advance(600_000); // faltan 5 min de los 15: muy por fuera del margen
    const result = await cache.resolve(ATTACHMENT_ID);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ ok: true });
  });

  it("refresca cuando falta menos que el margen para expiresAt", async () => {
    const reloj = clock();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(signed())
      .mockResolvedValueOnce(
        signed({
          url: "https://r2.example/evidencia.jpg?X-Amz-Signature=dos",
          expiresAt: new Date(T0 + 880_000 + 900_000).toISOString(),
        }),
      );
    const cache = createSignedMediaUrlCache({
      fetch,
      now: reloj.now,
      safetyMarginMs: 30_000,
    });

    await cache.resolve(ATTACHMENT_ID);
    reloj.advance(880_000); // quedan 20 s: dentro del margen de 30 s
    const result = await cache.resolve(ATTACHMENT_ID);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      ok: true,
      value: { url: "https://r2.example/evidencia.jpg?X-Amz-Signature=dos" },
    });
  });

  it("refresca una URL ya vencida", async () => {
    const reloj = clock();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(signed())
      .mockResolvedValueOnce(
        signed({ url: "https://r2.example/evidencia.jpg?X-Amz-Signature=tres" }),
      );
    const cache = createSignedMediaUrlCache({
      fetch,
      now: reloj.now,
      safetyMarginMs: 30_000,
    });

    await cache.resolve(ATTACHMENT_ID);
    reloj.advance(1_000_000); // vencida hace rato

    const result = await cache.resolve(ATTACHMENT_ID);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      ok: true,
      value: { url: "https://r2.example/evidencia.jpg?X-Amz-Signature=tres" },
    });
  });
});

// ─── invalidación explícita ─────────────────────────────────────────────────

describe("createSignedMediaUrlCache — invalidación", () => {
  it("invalidate(attachmentId) fuerza una nueva petición de ese adjunto", async () => {
    const fetch = vi.fn(async (id: string) => signed({ attachmentId: id }));
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    await cache.resolve(ATTACHMENT_ID);
    cache.invalidate(ATTACHMENT_ID);
    await cache.resolve(ATTACHMENT_ID);

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("invalidate no afecta a los demás adjuntos cacheados", async () => {
    const fetch = vi.fn(async (id: string) => signed({ attachmentId: id }));
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    await cache.resolve(ATTACHMENT_ID);
    await cache.resolve(OTRO_ATTACHMENT_ID);
    cache.invalidate(ATTACHMENT_ID);
    await cache.resolve(ATTACHMENT_ID);
    await cache.resolve(OTRO_ATTACHMENT_ID);

    expect(fetch.mock.calls.map(([id]) => id)).toEqual([
      ATTACHMENT_ID,
      OTRO_ATTACHMENT_ID,
      ATTACHMENT_ID,
    ]);
  });

  it("clear() vacía toda la caché", async () => {
    const fetch = vi.fn(async (id: string) => signed({ attachmentId: id }));
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    await cache.resolve(ATTACHMENT_ID);
    await cache.resolve(OTRO_ATTACHMENT_ID);
    cache.clear();
    await cache.resolve(ATTACHMENT_ID);
    await cache.resolve(OTRO_ATTACHMENT_ID);

    expect(fetch).toHaveBeenCalledTimes(4);
  });
});

// ─── normalización de errores ───────────────────────────────────────────────

describe("normalización de errores", () => {
  it("un error de red y un 409 producen resultados distinguibles", async () => {
    const red = normalizeMediaUrlError(new TypeError("Failed to fetch"));
    const conflicto = normalizeMediaUrlError(
      new ApiError(409, "Media attachment is not uploaded yet", null),
    );

    expect(red.kind).toBe("network");
    expect(conflicto.kind).toBe("not_ready");
    expect(red.kind).not.toBe(conflicto.kind);
    expect(red.message).not.toBe(conflicto.message);
  });

  it("los mensajes son legibles para un investigador, no crudos del backend", () => {
    const conflicto = normalizeMediaUrlError(
      new ApiError(409, "Media attachment is not uploaded yet", null),
    );

    expect(conflicto.message.length).toBeGreaterThan(10);
    expect(conflicto.message).not.toContain("Media attachment is not uploaded");
    // Español, como el resto de la UI.
    expect(conflicto.message).toMatch(/[áéíóúñ¿]|evidencia|archivo|subi/i);
  });

  it("distingue 404 y 403 del resto", () => {
    expect(normalizeMediaUrlError(new ApiError(404, "Not found", null)).kind).toBe(
      "not_found",
    );
    expect(normalizeMediaUrlError(new ApiError(403, "Forbidden", null)).kind).toBe(
      "forbidden",
    );
    expect(normalizeMediaUrlError(new ApiError(500, "Boom", null)).kind).toBe(
      "unknown",
    );
    expect(normalizeMediaUrlError("algo raro").kind).toBe("unknown");
  });

  it("resolve devuelve { ok: false } con el error normalizado en vez de lanzar", async () => {
    const fetch = vi.fn(async () => {
      throw new ApiError(409, "Media attachment is not uploaded yet", null);
    });
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    const result = await cache.resolve(ATTACHMENT_ID);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ error: { kind: "not_ready" } });
  });

  it("un error de red también se devuelve como resultado, no como excepción", async () => {
    const fetch = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    await expect(cache.resolve(ATTACHMENT_ID)).resolves.toMatchObject({
      ok: false,
      error: { kind: "network" },
    });
  });

  it("no cachea el fallo: el botón «Volver a cargar» vuelve a intentar", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(signed());
    const cache = createSignedMediaUrlCache({ fetch, now: clock().now });

    const fallo = await cache.resolve(ATTACHMENT_ID);
    const reintento = await cache.resolve(ATTACHMENT_ID);

    expect(fallo.ok).toBe(false);
    expect(reintento.ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
