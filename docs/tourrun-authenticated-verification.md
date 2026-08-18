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

## Verificación de la versión publicada

La versión publicada se actualizó correctamente después de la propagación del despliegue: el dashboard muestra el acceso **TourRun** y la navegación interna carga el módulo con la salida de prueba. Una carga directa de `/tourrun` mostró una página `404` antes de que se cargara la versión nueva; el acceso mediante el enlace interno funcionó y confirmó que el cliente puede resolver la ruta una vez entregado el bundle actualizado. La verificación continuará desde la salida de prueba, donde ya se capturó una parada pendiente de guardar.

La verificación publicada continuó con éxito en My Browser: se guardaron la parada **“Parada de verificación”**, el participante **“Grupo de verificación”** con una persona, y la evidencia **“Evidencia de verificación registrada en producción”**. El tablero actualizó los conteos y visualizó los tres registros dentro de la salida de prueba.

También se registró la incidencia de prueba **“Incidencia de verificación para resolver manualmente”**. El contador de incidencias abiertas aumentó a uno y el cierre permaneció sujeto al bloqueo declarado. Después se utilizó el control **Resolver** y el registro cambió a `resolved`; el contador de incidencias abiertas volvió a cero.

Con guía asignado, una parada registrada e incidencias abiertas en cero, se escribió **`CONFIRMAR READY`** y se activó el control de decisión humana. La salida pasó de `draft` a `ready`; la interfaz confirmó la acción y solo entonces ofreció la siguiente transición `in_progress` con una nueva confirmación escrita.

## Pantalla temporal de acceso

TourRun ahora presenta una pantalla de acceso temporal cuando no existe sesión. Se comprobó en una sesión de navegador sin autenticar que el formulario requiere un correo con formato válido y la confirmación explícita de uso por un operador autorizado antes de habilitar el botón **“Continuar con acceso seguro”**. El correo no se persiste ni genera una cuenta local; el botón conserva la redirección al inicio de sesión seguro existente.
