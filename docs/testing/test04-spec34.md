# Test Manual — Spec 34: Historial de respuestas por encuestado

**Fecha:** 2026-06-21
**Rama:** `feature/spec34-farmer-survey-history`
**Componentes:** Backend (endpoint GET /api/surveys/:id/responses) + Frontend (pestaña Encuestas en perfil del agricultor)
**Prerequisito:** Backend y frontend corriendo localmente. Base de datos con al menos un agricultor que tenga encuestas respondidas.

---

## Preparación

1. Iniciar backend: `pnpm start:dev` en `backend/`
2. Iniciar frontend: `pnpm dev` en `frontend/`
3. Login como ADMIN o RESEARCHER en `http://localhost:3001`
4. Asegurarse de tener al menos un agricultor con encuestas en la base de datos (usar el seed o crear uno desde la app móvil/web)

---

## TC-01 — Navegación a la pestaña Encuestas

**Objetivo:** Verificar que la página del agricultor muestra las dos pestañas correctamente.

**Pasos:**
1. Ir a `/admin/farmers`
2. Buscar un agricultor y hacer clic en su nombre
3. Observar la página de perfil

**Resultado esperado:**
- La página muestra el nombre del agricultor como título
- Se ven dos pestañas: "Datos" y "Encuestas"
- La pestaña "Datos" está activa por defecto (borde verde en la pestaña activa)
- El formulario de edición del agricultor es visible y funciona igual que antes

---

## TC-02 — Cambio de pestaña

**Objetivo:** Verificar que al hacer clic en "Encuestas" se cambia la vista correctamente.

**Pasos:**
1. Desde el perfil de un agricultor, hacer clic en la pestaña "Encuestas"

**Resultado esperado:**
- El formulario de edición desaparece
- Aparece el listado de encuestas (o estado vacío si no hay)
- La pestaña "Encuestas" queda activa (borde verde)
- Al hacer clic en "Datos" se vuelve al formulario sin perder los datos cargados

---

## TC-03 — Agricultor sin encuestas

**Objetivo:** Verificar el estado vacío.

**Pasos:**
1. Ir al perfil de un agricultor que no tenga encuestas registradas
2. Hacer clic en la pestaña "Encuestas"

**Resultado esperado:**
- Se muestra el mensaje: "Este agricultor no tiene encuestas registradas."
- No hay errores en consola

---

## TC-04 — Listado de encuestas

**Objetivo:** Verificar que las encuestas del agricultor se cargan y muestran correctamente.

**Pasos:**
1. Ir al perfil de un agricultor con encuestas
2. Hacer clic en "Encuestas"

**Resultado esperado:**
- Se muestra una lista de filas, una por encuesta
- Cada fila muestra:
  - Badge de estado: "Sincronizada" (fondo verde) o "Pendiente" (fondo amarillo)
  - Nombre del instrumento (ej. "S1 — Identificación del encuestado")
  - Fecha de creación formateada en español (ej. "15 jun. 2026")
  - Indicador de expansión (▼)
- Las filas están ordenadas

---

## TC-05 — Expandir una encuesta para ver respuestas

**Objetivo:** Verificar la carga de respuestas bajo demanda.

**Pasos:**
1. En la pestaña "Encuestas", hacer clic en una fila de encuesta
2. Observar el comportamiento de carga

**Resultado esperado:**
- La fila se expande y muestra "Cargando respuestas…" momentáneamente
- Las respuestas aparecen agrupadas por sección (nombre de sección en mayúsculas pequeñas)
- Cada respuesta muestra: texto de la pregunta (gris) + valor de la respuesta (negro, negrita)
- El indicador cambia a ▲

---

## TC-06 — Formato de respuestas por tipo de pregunta

**Objetivo:** Verificar que cada tipo de pregunta se muestra correctamente.

**Pasos:**
1. Expandir una encuesta que tenga variedad de tipos de pregunta

**Resultado esperado por tipo:**

| Tipo | Valor esperado |
|------|---------------|
| `yes_no` (Sí) | "Sí" |
| `yes_no` (No) | "No" |
| `numeric` | Número (ej. "3.5") |
| `open_text` | Texto libre completo |
| `single_choice` | Texto de la opción seleccionada |
| `likert` | Texto de la opción seleccionada |
| `compliance` | Texto de la opción (Sí / No / N/A) |
| `multiple_choice` | Texto de la opción seleccionada |
| Sin respuesta | "—" |

---

## TC-07 — Colapsar encuesta expandida

**Objetivo:** Verificar el comportamiento de acordeón.

**Pasos:**
1. Expandir una encuesta
2. Hacer clic nuevamente en la misma fila

**Resultado esperado:**
- La fila se colapsa y el contenido de respuestas desaparece
- El indicador vuelve a ▼

---

## TC-08 — Múltiples encuestas expandidas (no simultáneamente)

**Objetivo:** Verificar que solo una encuesta puede estar expandida a la vez.

**Pasos:**
1. Expandir la encuesta A
2. Hacer clic en la encuesta B (sin colapsar A)

**Resultado esperado:**
- La encuesta A se colapsa automáticamente
- La encuesta B se expande y carga sus respuestas
- Solo una fila expandida a la vez

---

## TC-09 — Caché de respuestas (no recargar al re-expandir)

**Objetivo:** Verificar que las respuestas ya cargadas no se vuelven a pedir al backend.

**Pasos:**
1. Expandir la encuesta A — se cargan sus respuestas
2. Colapsar la encuesta A
3. Expandir la encuesta A nuevamente

**Resultado esperado:**
- Las respuestas aparecen inmediatamente (sin "Cargando respuestas…")
- No se hace una segunda llamada a `GET /api/surveys/:id/responses` (verificar en DevTools → Network)

---

## TC-10 — La pestaña Datos sigue funcionando

**Objetivo:** Verificar que el refactor no rompió el formulario de edición.

**Pasos:**
1. Ir al perfil de un agricultor
2. Cambiar el teléfono del agricultor
3. Hacer clic en "Guardar"

**Resultado esperado:**
- Se muestra "Cambios guardados correctamente."
- Al recargar la página, el nuevo teléfono aparece en el formulario

---

## TC-11 — Volver al listado

**Objetivo:** Verificar que el botón "← Volver al listado" funciona desde ambas pestañas.

**Pasos:**
1. Estar en la pestaña "Encuestas"
2. Hacer clic en "← Volver al listado"

**Resultado esperado:**
- Navega a `/admin/farmers` correctamente

---

## TC-12 — Endpoint backend: survey no encontrado

**Objetivo:** Verificar el manejo de errores en el endpoint.

**Pasos:**
1. Llamar directamente a `GET /api/surveys/00000000-0000-0000-0000-000000000000/responses` con token válido

**Resultado esperado:**
- Respuesta `404 Not Found`
- Body: `{ "message": "Survey not found", "statusCode": 404 }`

---

## TC-13 — Endpoint backend: sin autorización

**Objetivo:** Verificar que el endpoint requiere rol ADMIN o RESEARCHER.

**Pasos:**
1. Login como POLLSTER
2. Llamar a `GET /api/surveys/:id/responses`

**Resultado esperado:**
- Respuesta `403 Forbidden`

---

## TC-14 — Endpoint backend: estructura de respuesta

**Objetivo:** Verificar la estructura completa del endpoint.

**Pasos:**
1. Con token de ADMIN, llamar a `GET /api/surveys/:surveyId/responses` con un surveyId real
2. Verificar el body de la respuesta

**Resultado esperado:**
```json
{
  "surveyId": "<uuid>",
  "instrumentName": "S1 — ...",
  "syncedAt": "2026-...",
  "responses": [
    {
      "responseId": "<uuid>",
      "questionId": "<uuid>",
      "questionText": "...",
      "questionType": "numeric",
      "sectionTitle": "...",
      "textValue": null,
      "numericValue": 3.5,
      "booleanValue": null,
      "optionText": null
    }
  ]
}
```
- Las respuestas vienen ordenadas: primero por sección (order ASC), luego por pregunta (order ASC)

---

## TC-15 — Acceso desde búsqueda por nombre

**Objetivo:** Verificar el flujo completo desde la búsqueda.

**Pasos:**
1. Ir a `/admin/farmers`
2. Buscar al agricultor por nombre (parcial)
3. Hacer clic en el resultado
4. Ir a pestaña "Encuestas"
5. Expandir una encuesta

**Resultado esperado:**
- Todo el flujo funciona sin errores
- Las respuestas se muestran correctamente

---

## TC-16 — Acceso desde búsqueda por cédula

**Objetivo:** Verificar el flujo completo desde búsqueda por documento.

**Pasos:**
1. Ir a `/admin/farmers`
2. Buscar al agricultor por número de cédula
3. Repetir pasos 3-5 del TC-15

**Resultado esperado:**
- Mismo resultado que TC-15
