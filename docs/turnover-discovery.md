# Descubrimiento público de referencias en TurnoverOps

## Propósito

TurnoverOps incluye un panel de **descubrimiento asistido** para consultar referencias públicas alrededor de Mérida mediante Google Maps Places. La función ayuda a iniciar una conversación comercial o una revisión operativa con datos verificables, pero no infiere que una ubicación sea propiedad del usuario, que esté disponible para renta o que pueda incorporarse a la operación.

| Acción | Automatización | Control humano |
|---|---|---|
| Buscar por categoría y zona | Sí, consulta pública desde la interfaz. | El operador elige el criterio de búsqueda. |
| Mostrar nombre, dirección, categoría y enlace de fuente | Sí, con resultados entregados por Google Maps Places. | El usuario comprueba la fuente original. |
| Guardar un candidato | No. Requiere pulsar **Guardar para revisar**. | El usuario selecciona cada referencia de forma explícita. |
| Revisar o descartar candidato | No. | El usuario define el estado y conserva el historial. |
| Crear una unidad operativa | No está automatizado por candidatos. | El usuario registra la unidad con datos propios y verificados. |

## Privacidad y límites

La consulta se realiza en el navegador con el servicio de Places ya integrado en el proyecto. El backend recibe resultados únicamente cuando el operador elige guardarlos. Cada candidato lleva `ownerId`, origen, consulta, identificador externo, estado y fecha de revisión; los candidatos se aíslan por usuario autenticado. No se hace scraping oculto, extracción masiva, alta automática, ni se persisten huéspedes, reservas, disponibilidad o datos personales.

## Verificación

La interfaz autenticada se comprobó el 17 de agosto de 2026 con la consulta **“alojamiento Mérida Yucatán”**. El mapa se centró en Mérida y el panel mostró referencias públicas con nombres, direcciones, categoría y enlaces a la fuente. El usuario eligió y guardó **Kuka y Letras**; el panel confirmó el estado `reviewed` y mantuvo el enlace a la fuente. Esta referencia sigue siendo un candidato revisado: no se transformó en una unidad, reserva, cliente ni autorización operativa.

## Referencia

[1]: https://developers.google.com/maps/documentation/javascript/places "Google Maps JavaScript API — Places"
