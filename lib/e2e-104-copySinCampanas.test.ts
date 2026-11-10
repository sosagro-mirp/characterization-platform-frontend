import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Spec 104 (etapa A) — las pantallas de acceso ya no mencionan campañas.
describe("copy de login y registro", () => {
    it.each(["app/login/page.tsx", "app/register/page.tsx"])(
        "%s no menciona campañas ni campaña",
        (file) => {
            const src = readFileSync(resolve(__dirname, "..", file), "utf8");
            expect(src.toLowerCase()).not.toContain("campaña");
        },
    );
});
