/**
 * Bug: al filtrar sin coincidencias la tabla se desmontaba y con ella los
 * inputs de filtro. La tabla debe seguir mostrando los filtros y el mensaje.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductionUnitsTable } from "@/components/admin/production-units/ProductionUnitsTable";

describe("ProductionUnitsTable sin filas", () => {
  it("conserva los inputs de filtro y su valor, y muestra el mensaje vacío", () => {
    const html = renderToStaticMarkup(
      createElement(ProductionUnitsTable, {
        rows: [],
        columns: [],
        columnFilters: { farmers: "zzz" },
        onColumnFilter: () => {},
        onDecide: () => {},
      }),
    );
    expect(html).toContain('aria-label="Filtrar por Productores"');
    expect(html).toContain('value="zzz"');
    expect(html).toContain("Ninguna finca cumple los filtros.");
  });
});
