# Mapas — assets externos

## `colombia.geo.json`

GeoJSON de Colombia dividido por departamentos, consumido por
`components/landing/territories/ColombiaMap.tsx` mediante `react-simple-maps`.

### Origen y atribución

- **Fuente**: [santigrgrisales/col_departments.geojson](https://github.com/santigrgrisales/col_departments.geojson)
- **Licencia**: revisar repositorio fuente; archivo derivado de límites
  administrativos públicos del DANE (Marco Geoestadístico Nacional).
- **Procesamiento**: el archivo original (~36 MB) se simplificó al 1% de
  vértices con [`mapshaper`](https://github.com/mbloch/mapshaper) para reducir
  el tamaño del bundle:

  ```sh
  mapshaper colombia.geo.json -simplify 1% -o force colombia.geo.json
  ```

  Resultado: ~32 KB sin pérdida visual significativa a la escala de la landing.

### Esquema de propiedades

Cada `feature` lleva:

- `DeCodigo` — código DANE de 2 dígitos (`"05"` Antioquia, `"18"` Caquetá,
  `"27"` Chocó, `"44"` La Guajira, `"50"` Meta, `"54"` Norte de Santander).
- `DeNombre` — nombre oficial del departamento.

`ColombiaMap.tsx` usa `DeCodigo` para resaltar los seis departamentos del
proyecto comparándolo contra `lib/landing-content/territories.ts`.
