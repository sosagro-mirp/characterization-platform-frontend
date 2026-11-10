import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Spec 85 — la evidencia se sirve por URL firmada desde el endpoint S3 de R2
 * (`https://<bucket>.<cuenta>.r2.cloudflarestorage.com`). La CSP debe permitir
 * ese origen en `img-src` y `media-src` para que el visor muestre la foto y
 * reproduzca audio/video; sin él, el navegador los bloquea y solo funciona la
 * descarga (hallazgo de TC-085-011 en producción).
 */

const MEDIA_ORIGIN =
  "https://sosagro-media.0000000000000000000000000000000.r2.cloudflarestorage.com";

async function loadCsp(mediaOrigin: string | undefined): Promise<Map<string, string>> {
  vi.resetModules();
  if (mediaOrigin === undefined) {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_ORIGIN", "");
  } else {
    vi.stubEnv("NEXT_PUBLIC_MEDIA_ORIGIN", mediaOrigin);
  }
  const { default: nextConfig } = await import("./next.config");
  const rules = await nextConfig.headers!();
  const csp = rules[0].headers.find((h) => h.key === "Content-Security-Policy")!.value;
  return new Map(
    csp.split(";").map((d) => {
      const [name, ...sources] = d.trim().split(/\s+/);
      return [name, sources.join(" ")] as const;
    }),
  );
}

describe("e2e-085 — CSP para la evidencia multimedia", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("permite el origen de R2 en img-src y media-src", async () => {
    const csp = await loadCsp(MEDIA_ORIGIN);
    expect(csp.get("img-src")).toContain(MEDIA_ORIGIN);
    expect(csp.get("media-src")).toContain(MEDIA_ORIGIN);
  });

  it("normaliza la barra final del origen", async () => {
    const csp = await loadCsp(`${MEDIA_ORIGIN}/`);
    expect(csp.get("media-src")!.split(" ")).toContain(MEDIA_ORIGIN);
  });

  it("no abre el origen de R2 a scripts ni a conexiones", async () => {
    const csp = await loadCsp(MEDIA_ORIGIN);
    expect(csp.get("script-src")).not.toContain(MEDIA_ORIGIN);
    expect(csp.get("connect-src")).not.toContain(MEDIA_ORIGIN);
  });

  it("sin la variable, media-src queda en 'self' y no se cuelan valores vacíos", async () => {
    const csp = await loadCsp(undefined);
    expect(csp.get("media-src")).toBe("'self' blob:");
    expect(csp.get("img-src")).toBe("'self' data: blob:");
  });
});
