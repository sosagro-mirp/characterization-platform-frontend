import { ApiError } from "@/lib/apiClient";

/**
 * Spec 85 (Fase 4): caché en memoria de URLs firmadas de lectura de evidencia.
 *
 * Lógica pura a propósito: el entorno de Vitest es `node` y no hay jsdom, así
 * que el visor queda reducido a presentación y todo lo probable vive aquí.
 */

/** Se renueva la URL si faltan menos de 30 s para su `expiresAt`. */
export const SIGNED_URL_SAFETY_MARGIN_MS = 30_000;

export interface SignedMediaUrl {
  attachmentId: string;
  url: string;
  expiresAt: string;
  mimeType: string;
  originalFilename: string | null;
}

export type MediaUrlErrorKind =
  | "network"
  | "not_ready"
  | "not_found"
  | "forbidden"
  | "unknown";

export interface MediaUrlError {
  kind: MediaUrlErrorKind;
  message: string;
}

export type MediaUrlResult =
  | { ok: true; value: SignedMediaUrl }
  | { ok: false; error: MediaUrlError };

const MESSAGES: Record<MediaUrlErrorKind, string> = {
  network:
    "No pudimos conectar con el servidor para cargar la evidencia. Revisa tu conexión e inténtalo de nuevo.",
  not_ready:
    "El archivo todavía no terminó de subirse. Si la encuesta se hizo sin conexión, aparecerá cuando se sincronice.",
  not_found: "Esta evidencia ya no existe en el sistema.",
  forbidden: "Tu usuario no tiene permiso para ver esta evidencia.",
  unknown: "No pudimos cargar la evidencia. Inténtalo de nuevo en un momento.",
};

export function normalizeMediaUrlError(error: unknown): MediaUrlError {
  let kind: MediaUrlErrorKind = "unknown";

  if (error instanceof ApiError) {
    if (error.status === 409) kind = "not_ready";
    else if (error.status === 404) kind = "not_found";
    else if (error.status === 403) kind = "forbidden";
  } else if (error instanceof TypeError) {
    // `fetch` rechaza con TypeError cuando no hay red.
    kind = "network";
  }

  return { kind, message: MESSAGES[kind] };
}

interface CacheOptions {
  fetch: (attachmentId: string) => Promise<SignedMediaUrl>;
  safetyMarginMs?: number;
  now?: () => number;
}

export interface SignedMediaUrlCache {
  resolve(attachmentId: string): Promise<MediaUrlResult>;
  invalidate(attachmentId: string): void;
  clear(): void;
}

export function createSignedMediaUrlCache({
  fetch,
  safetyMarginMs = SIGNED_URL_SAFETY_MARGIN_MS,
  now = Date.now,
}: CacheOptions): SignedMediaUrlCache {
  const cached = new Map<string, SignedMediaUrl>();
  const inFlight = new Map<string, Promise<MediaUrlResult>>();

  const isFresh = (value: SignedMediaUrl): boolean => {
    const expiresAt = Date.parse(value.expiresAt);
    return Number.isFinite(expiresAt) && expiresAt - now() > safetyMarginMs;
  };

  async function request(attachmentId: string): Promise<MediaUrlResult> {
    try {
      // Diferido a un microtask: garantiza que `inFlight.set` ocurra antes del `finally`
      // aunque `fetch` lance de forma síncrona.
      const value = await Promise.resolve().then(() => fetch(attachmentId));
      cached.set(attachmentId, value);
      return { ok: true, value };
    } catch (error) {
      // Los fallos no se cachean: «Volver a cargar» debe reintentar de verdad.
      return { ok: false, error: normalizeMediaUrlError(error) };
    } finally {
      inFlight.delete(attachmentId);
    }
  }

  return {
    resolve(attachmentId) {
      const hit = cached.get(attachmentId);
      if (hit && isFresh(hit)) return Promise.resolve({ ok: true, value: hit });

      const pending = inFlight.get(attachmentId);
      if (pending) return pending;

      const started = request(attachmentId);
      inFlight.set(attachmentId, started);
      return started;
    },
    invalidate(attachmentId) {
      cached.delete(attachmentId);
    },
    clear() {
      cached.clear();
    },
  };
}
