# Verificación autenticada de Evox TourRun

## Ejecución

La verificación se ejecuta en la sesión autenticada del propietario, con datos de prueba identificables y autorizados por el usuario. El 18 de agosto de 2026 se comprobó que la ruta `/tourrun` carga el tablero operativo, no la pantalla de acceso, y que permite persistir un guía.

| Paso | Resultado observable |
|---|---|
| Cargar `/tourrun` | Se mostró el tablero autenticado con formularios para guía y salida. |
| Registrar guía | Se guardó **“Prueba TourRun — Guía de verificación”**; la interfaz mostró la confirmación “Guía registrado” y el guía apareció como opción asignable en una salida. |
| Crear salida | Se guardó **“Prueba TourRun — Salida de verificación”** con la ruta **“Mérida · recorrido de verificación”** y el guía asignado. La petición autenticada devolvió `200`, creó la salida en estado `draft` y el tablero actualizado mostró una salida activa y los formularios de parada, participante, evidencia, incidencia y transición humana. |

## Límites conservados durante la prueba

La prueba no registra pagos, boletos, datos de contacto de terceros ni reservas reales. Las transiciones de salida continúan requiriendo confirmación humana escrita y el motivo de una cancelación.

## Límite de la sesión de navegador

Después de persistir la salida, la extensión del navegador del usuario devolvió tres tiempos de espera `504` consecutivos. Por ello no fue posible completar por interfaz los pasos restantes de parada, participante, evidencia, incidencia y transición manual durante esta sesión. Las pruebas Vitest cubren las validaciones de esas transiciones, pero la verificación manual de los pasos pendientes debe retomarse con una sesión de navegador disponible.

La configuración de la tarea confirma que **My Browser** permanece habilitado; el problema observado corresponde a la respuesta temporal de la extensión, no a un conector desactivado. No se modificó su configuración.
