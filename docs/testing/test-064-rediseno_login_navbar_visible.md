# test-064 — Rediseño de /login con navbar visible y layout sin scroll

## Datos de prueba
> Recursos creados vía API para poder ejecutar estos casos.
> Deben eliminarse al cerrar la ronda de pruebas.

| Recurso | Endpoint de creación | Identificador | Eliminado |
|---------|-----------------------|----------------|-----------|
| Usuario de prueba, rol `researcher`, `mustChangePassword=false` — `test-spec64-login@sosagro.co` / `TestSpec64!` | `POST /api/auth/register` | `f2dd2ba3-1870-4a08-8bcb-4d2b65e83adc` | ✅ |
| Usuario de prueba, sin rol asignado, `mustChangePassword=true` — `test-spec64-mustchange@sosagro.co` / `TestSpec64Temp!` | `POST /api/users` (con JWT de admin) | `1aea4e09-91c3-4dcd-8964-7fa01b0d3587` | ✅ |

**Entorno de pruebas:** desarrollo (`http://localhost:3001` frontend / `http://localhost:3000` backend)
**Fecha de la ronda:** 2026-08-03

> Ambos usuarios se crean con contraseñas de prueba no reutilizadas en ningún
> otro entorno. El segundo usuario no tiene rol asignado (`role: null`): es
> intencional, TC-064-08 solo ejercita el flujo `mustChangePassword` (la
> redirección a `/change-password` ocurre antes de cualquier lógica de rol).

## Casos de prueba

### TC-064-01 — Navbar visible y funcional en /login
**Precondición:** ninguna (usuario no autenticado).
**Pasos:**
1. Navegar a `/login`.
2. Observar la parte superior de la pantalla.
3. Hacer clic en el logo del navbar.
4. Volver a `/login` y probar los links de sección del navbar (si aplica sin estar en la landing).
**Resultado esperado:** el navbar global es visible desde el primer render, con logo, links y `ThemeToggle`. El logo lleva a `/`.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-064-02 — Sin scroll en desktop
**Precondición:** ventana de navegador ≥1024px de ancho, altura estándar (~900px).
**Pasos:**
1. Navegar a `/login`.
2. Intentar hacer scroll vertical y horizontal con mouse/trackpad.
3. Redimensionar la ventana a una altura baja (~700px) y repetir.
**Resultado esperado:** no aparece barra de scroll ni es posible desplazar el contenido en ninguna altura probada; el panel de marca y el panel de formulario se ajustan al espacio disponible bajo el navbar.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-064-03 — Layout mobile sin scroll
**Precondición:** viewport <768px (o dispositivo móvil real).
**Pasos:**
1. Navegar a `/login`.
2. Confirmar que el panel de marca (verde, estadísticas) no se muestra.
3. Confirmar que el formulario completo es visible y usable sin scroll de página (el teclado virtual al enfocar un input puede generar scroll temporal del navegador — no cuenta como falla).
**Resultado esperado:** solo el panel de formulario es visible, ocupando toda la pantalla, sin scroll de página en reposo.
**Estado:** ✅ Aprobado
**Hallazgos:** Sin observaciones.

### TC-064-04 — Estadísticas del panel de marca coinciden con la landing
**Precondición:** viewport desktop.
**Pasos:**
1. Anotar los tres valores mostrados en el panel de marca de `/login`.
2. Navegar a `/` y ubicar la sección de estadísticas del hero.
3. Comparar los valores.
**Resultado esperado:** los valores y etiquetas coinciden exactamente entre `/login` y la landing (mismos números, sin cifras distintas hardcodeadas).
**Estado:** ✅ Aprobado
**Hallazgos:** Ninguno reportado.

### TC-064-05 — Toggle mostrar/ocultar contraseña
**Precondición:** ninguna.
**Pasos:**
1. En `/login`, escribir una contraseña en el campo correspondiente.
2. Activar el control de "mostrar" contraseña.
3. Confirmar que el texto se muestra en claro y el valor no cambia.
4. Activar "ocultar" y confirmar que vuelve a ocultarse.
**Resultado esperado:** el toggle alterna la visibilidad sin perder el valor escrito ni enviar el formulario.
**Estado:** ✅ Aprobado
**Hallazgos:** Ninguno reportado.

### TC-064-06 — Login exitoso conserva la lógica actual
**Precondición:** usuario de prueba válido, `mustChangePassword=false`.
**Datos de prueba usados:** `test-spec64-login@sosagro.co` / `TestSpec64!` (rol `researcher`)
**Pasos:**
1. Ingresar el correo y contraseña del usuario de prueba.
2. Enviar el formulario.
**Resultado esperado:** redirección a la ruta por defecto según el rol del usuario (`defaultRouteForRole`), igual que antes del rediseño.
**Estado:** ✅ Aprobado
**Hallazgos:** Ninguno reportado.

### TC-064-07 — Credenciales inválidas muestran el mismo mensaje de error
**Precondición:** ninguna.
**Pasos:**
1. Ingresar un correo válido con una contraseña incorrecta.
2. Enviar el formulario.
**Resultado esperado:** se muestra "Credenciales inválidas. Verifica tu correo y contraseña." sin recargar la página ni perder el layout sin scroll.
**Estado:** ✅ Aprobado
**Hallazgos:** Ninguno reportado.

### TC-064-08 — Flujo mustChangePassword se conserva
**Precondición:** usuario de prueba con `mustChangePassword=true`.
**Datos de prueba usados:** `test-spec64-mustchange@sosagro.co` / `TestSpec64Temp!`
**Pasos:**
1. Iniciar sesión con ese usuario.
**Resultado esperado:** redirección a `/change-password`, igual que el comportamiento actual.
**Estado:** ✅ Aprobado
**Hallazgos:** Ninguno reportado.

### TC-064-09 — Mensaje "cuenta creada" y parámetro `from`
**Precondición:** ninguna.
**Datos de prueba usados:** `test-spec64-login@sosagro.co` / `TestSpec64!` (rol `researcher`, tiene acceso a `/admin/*`)
**Pasos:**
1. Navegar a `/login?registered=true` y confirmar el mensaje de cuenta creada.
2. Navegar a `/login?from=/admin/campaigns`, iniciar sesión con `test-spec64-login@sosagro.co`.
**Resultado esperado:** el mensaje de "cuenta creada" se muestra correctamente en el nuevo layout; tras el login, la redirección respeta `from` (termina en `/admin/campaigns`, no en `/admin/instruments`).
**Estado:** ✅ Aprobado
**Hallazgos:** Ninguno reportado.

### TC-064-10 — Modo oscuro
**Precondición:** ninguna.
**Pasos:**
1. En `/login`, activar el `ThemeToggle` del navbar hacia modo oscuro.
2. Observar el panel de marca y el panel de formulario.
3. Volver a modo claro.
**Resultado esperado:** ambos paneles cambian de paleta de forma consistente con el resto del sitio (acentos amarillos en oscuro, verdes en claro), manteniendo contraste legible.
**Estado:** ❌ Fallido → ✅ Aprobado tras corrección
**Hallazgos:** Primera pasada: (1) el panel de marca se mantenía verde fijo en modo oscuro — el usuario esperaba tonos amarillo/ámbar, igual que el resto de acentos interactivos del sitio; (2) el título "Bienvenido de vuelta" se veía muy opaco/casi ilegible en modo oscuro (`text-brand-dark`, verde fijo, sobre fondo oscuro reactivo). Ambos corregidos en el mismo turno (ver spec 64, Fase 4): panel de marca ahora usa `dark:bg-[#3f2d05]` + textos `dark:text-yellow-*`; título cambiado a `text-text-primary` (reactivo). Reprobado por el usuario tras la corrección: aprobado.

### TC-064-11 — Enlaces "Crea tu cuenta" y ausencia de SSO/recordar sesión/olvidé contraseña
**Precondición:** ninguna.
**Pasos:**
1. Confirmar que el link "Crea tu cuenta" navega a `/register`.
2. Confirmar que **no** aparecen: botón de SSO, checkbox "mantener sesión iniciada" ni link "¿Olvidaste tu contraseña?".
**Resultado esperado:** solo el link a `/register` está presente entre los elementos opcionales del mockup; los tres elementos fuera de alcance no se muestran.
**Estado:** ✅ Aprobado
**Hallazgos:** Ninguno reportado.

### TC-064-12 — /register: navbar visible y mismo lenguaje visual
**Precondición:** ninguna.
**Pasos:**
1. Navegar a `/register`.
2. Confirmar que el `Navbar` global es visible.
3. Confirmar que el panel de marca (izquierda, desktop) y el panel de formulario (derecha) siguen el mismo lenguaje visual que `/login` (colores, tipografía, inputs de borde inferior).
4. Alternar el `ThemeToggle` a modo oscuro y confirmar que el panel de marca pasa a tonos ámbar/amarillo, igual que en `/login`.
**Resultado esperado:** `/register` es visualmente consistente con `/login` (navbar, paneles, modo oscuro), a diferencia del diseño anterior (pantalla verde sólida sin navbar).
**Estado:** ✅ Aprobado
**Hallazgos:** Ninguno reportado.

### TC-064-13 — /register: scroll permitido, sin romper el registro
**Precondición:** ninguna.
**Pasos:**
1. En `/register`, redimensionar la ventana a una altura baja (~700px) o probar en mobile.
2. Confirmar que, si el contenido no entra, aparece scroll normal (a diferencia de `/login`, que no debe tener scroll).
3. Completar el formulario con nombre, apellido, correo, contraseña y código de validación inválido y enviarlo.
**Resultado esperado:** el formulario se puede completar y desplazar sin problemas de layout; con un código de validación incorrecto se muestra "Código de validación incorrecto." igual que antes del rediseño.
**Estado:** ✅ Aprobado
**Hallazgos:** Ninguno reportado.

## Resumen de la ronda
- Aprobados: 13 — Fallidos: 0 (TC-064-10 falló en la primera pasada y quedó aprobado tras corregirse en el mismo turno) — Pendientes: 0
- Hallazgos escalados a `spec/backlog.md`: ninguno (los dos hallazgos de TC-064-10 se corrigieron directamente dentro del scope de este spec, no se escalaron)
- Ampliación de alcance detectada durante la ronda: TC-064-11 motivó extender el rediseño a `/register` (Fase 5) — ver spec 64
- Ajustes visuales adicionales post-ronda (confirmados directamente por el usuario, sin `TC` formal): centrado vertical del contenido del panel de marca (título+párrafo) manteniendo el bloque inferior anclado al fondo; reubicación del badge desde el panel de marca hacia el panel de formulario (reemplazando el texto `// iniciar sesión` / `// crear cuenta` por un badge sin `//`). Aplicado en `/login` y `/register`. Confirmación final del usuario: "Todo bien".
- Limpieza de datos de prueba: ✅ Completada (ambos usuarios eliminados vía `DELETE /api/users/:id`, verificado con `404` posterior)
