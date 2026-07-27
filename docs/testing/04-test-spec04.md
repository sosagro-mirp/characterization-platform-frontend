# 04-test-spec04 — Cuatro propuestas de landing + modo oscuro por preferencia del sistema

## Datos de prueba

No se requieren datos vía API — este spec es puramente de presentación
(landing pública) y no toca el backend. Todos los casos se ejecutan
navegando la app en `pnpm dev` (desarrollo).

**Entorno de pruebas:** desarrollo (`pnpm dev`, `http://localhost:3001`)
**Fecha de la ronda:** 2026-07-27

## Casos de prueba

### TC-001 — Landing Original en `/`
**Precondición:** servidor de desarrollo corriendo.
**Pasos:**
1. Navegar a `/`.
2. Verificar que se ven todas las secciones: hero, socios, cadenas
   productivas, territorios (mapa), fases del proyecto, indicador IFCT4C,
   grupos de investigación, CTA de dashboard, formulario de contacto.
3. Completar el formulario de contacto con datos válidos y enviarlo.
4. Usar el filtro de grupos de investigación por área.
**Resultado esperado:** la página carga igual que antes de este spec,
salvo que el formulario ahora muestra una pantalla de confirmación
"¡Gracias por escribirnos!" al enviarse (antes el botón estaba
deshabilitado), y el filtro de grupos por área (Todos/Ciencia de
datos/Control y robótica/Biomédica/Química) funciona y reduce la lista.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-002 — Propuesta Agro en `/agro`
**Precondición:** ninguna.
**Pasos:**
1. Navegar a `/agro`.
2. Recorrer todas las secciones (hero, socios, cadenas, territorios,
   fases, IFCT4C, grupos, contacto).
3. Ver el `<head>` de la página (View Source o herramientas de desarrollo)
   y confirmar la metaetiqueta `robots`.
**Resultado esperado:** estética cálida/editorial (fondo crema, tipografía
serif en títulos), misma información de negocio que `/`. La etiqueta
`<meta name="robots" content="noindex, nofollow">` está presente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-003 — Propuesta Editorial en `/editorial`
**Precondición:** ninguna.
**Pasos:**
1. Navegar a `/editorial` en desktop.
2. Verificar la side-nav fija con índice numerado (01, 02, 03…).
3. Reducir el ancho de la ventana a mobile y verificar el toggle
   "Menú"/"Cerrar".
4. Recorrer todas las secciones.
**Resultado esperado:** estética blanco/negro tipo revista, side-nav
visible y funcional en desktop, colapsada con toggle en mobile, kickers
de sección en verde (`#15803d`) sobre fondo blanco/negro. `noindex`
presente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-004 — Propuesta Plataforma en `/plataforma`
**Precondición:** ninguna.
**Pasos:**
1. Navegar a `/plataforma`.
2. Verificar el hero con fila de estadísticas (4 números).
3. Recorrer todas las secciones.
4. Cambiar la preferencia de tema del sistema operativo (claro ↔ oscuro)
   y confirmar que `/plataforma` **no cambia** — sigue siempre oscura.
**Resultado esperado:** estética dark SaaS con verde lima sobre negro,
consistente sin importar la preferencia del sistema. `noindex` presente.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-005 — Modo oscuro por preferencia del sistema en landing
**Precondición:** ninguna.
**Pasos:**
1. Con el sistema operativo en modo claro, navegar a `/`, `/agro` y
   `/editorial`.
2. Cambiar la preferencia de tema del sistema operativo a oscuro (sin
   recargar la página).
3. Observar si la apariencia cambia automáticamente.
**Resultado esperado:** las 3 rutas cambian de apariencia automáticamente
al modo oscuro sin recargar la página y sin ningún control visible para
cambiarlo manualmente. `/plataforma` no se ve afectada (ver TC-004).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-006 — Modo oscuro por preferencia del sistema en admin panel
**Precondición:** usuario admin o researcher autenticado.
**Pasos:**
1. Iniciar sesión y entrar a cualquier vista de `/admin/*`.
2. Confirmar que ya no existe ningún botón/selector de tema en el
   sidebar (donde antes estaba `ThemeToggle`).
3. Cambiar la preferencia de tema del sistema operativo y observar el
   admin panel.
**Resultado esperado:** no hay ningún control de tema visible. El admin
panel cambia de apariencia automáticamente según la preferencia del
sistema operativo.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-007 — Filtro de grupos de investigación en las 4 propuestas
**Precondición:** ninguna.
**Pasos:**
1. En cada una de las 4 rutas (`/`, `/agro`, `/editorial`, `/plataforma`),
   ir a la sección de grupos de investigación.
2. Probar cada filtro: Todos, Ciencia de datos, Control y robótica,
   Biomédica, Química.
**Resultado esperado:** el filtro reduce/amplía la lista de grupos
correctamente y de forma consistente en las 4 propuestas (mismos grupos
por categoría, distinto markup visual).
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-008 — Mapa de Colombia en las 4 propuestas
**Precondición:** ninguna.
**Pasos:**
1. En cada ruta, pasar el cursor (o tocar en mobile) sobre distintos
   departamentos del mapa.
**Resultado esperado:** el mapa resalta el departamento y muestra su
información (región, municipios, PDET/ZOMAC) en las 4 propuestas, con
la paleta de color propia de cada una.
**Estado:** ⬜ Pendiente
**Hallazgos:**

### TC-009 — Fidelidad visual contra el mockup de referencia
**Precondición:** tener a mano el proyecto de diseño
`claude.ai/design` "SosAgro landing page rediseño".
**Pasos:**
1. Comparar visualmente `/agro`, `/editorial` y `/plataforma` contra
   `SosAgro Landing - Agro.dc.html`, `- Editorial.dc.html` y
   `- Plataforma.dc.html` respectivamente.
**Resultado esperado:** la paleta de color y tipografía deberían
coincidir razonablemente (se corrigió manualmente tras detectar que los
agentes de implementación no tuvieron acceso al MCP de diseño). Puede
haber diferencias menores de espaciado/composición — documentar
cualquier diferencia relevante como hallazgo, no como fallo bloqueante.
**Estado:** ⬜ Pendiente
**Hallazgos:**

## Resumen de la ronda

- Aprobados: _pendiente_ — Fallidos: _pendiente_ — Pendientes: 9
- Hallazgos escalados a `specs/backlog.md`: _pendiente_
