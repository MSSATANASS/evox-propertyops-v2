# HighLevel como capa comercial de los productos Evox

## Propósito y alcance

HighLevel se usará como CRM de adquisición y seguimiento comercial para los tres productos fuera del nicho inmobiliario. El sistema ya dispone de una ubicación autorizada en Mérida y un pipeline de marketing con las etapas **New Lead**, **Contacted**, **Qualified**, **Proposal Sent**, **Negotiation** y **Closed**. Estas etapas servirán para registrar el avance de conversaciones comerciales; no representan aprobación de contratos, pagos ni prestación efectiva de servicios.

| Flujo | Operación en HighLevel | Control obligatorio |
|---|---|---|
| Captación | Crear o actualizar un contacto cuando la persona entregue sus datos o autorice el registro. | No importar contactos masivamente ni inferir teléfonos o correos. |
| Clasificación | Agregar etiqueta por producto y nicho después de una revisión humana. | Un tag no autoriza mensajes ni cambia decisiones operativas. |
| Pipeline | Crear oportunidad y moverla de etapa con evidencia de la conversación. | El cambio a `Closed` requiere confirmación humana explícita. |
| Seguimiento | Preparar tareas o borradores de mensajes para contacto posterior. | No se envían SMS, correo, WhatsApp ni publicaciones sin confirmación previa. |
| Agenda | Consultar disponibilidad y proponer reuniones. | Nunca reservar ni reprogramar una cita sin la aprobación de las partes. |

## Regla de separación

Cada producto mantiene su base operativa propia. HighLevel solo almacena el mínimo necesario para la relación comercial: identidad y datos de contacto aportados por el prospecto, origen, producto de interés, etapa y notas de seguimiento. La evidencia operativa, cotizaciones, aprobaciones, auditoría de servicio y cualquier decisión crítica permanecen en la aplicación correspondiente.

> Una oportunidad comercial no es una autorización operativa. Ningún workflow de HighLevel debe aprobar pagos, aceptar cotizaciones, liberar entregas, decidir incidencias ni cerrar procesos internos.

## Formulario mínimo de captación

| Campo | Tipo | Obligatorio | Regla de uso |
|---|---|---:|---|
| Nombre | Texto | Sí | Se captura tal como lo proporciona la persona. |
| Negocio o empresa | Texto | No | Identifica al prospecto comercial sin enriquecerlo desde terceros. |
| Teléfono o correo | Contacto | Uno de los dos | Se usa solo para el seguimiento autorizado por la persona. |
| Producto de interés | Lista cerrada | Sí | Se selecciona entre los tres proyectos definidos para evitar etiquetas ambiguas. |
| Ciudad o zona | Texto | No | Se usa para priorización local; no sustituye una dirección operativa. |
| Origen | Lista cerrada | Sí | Ejemplos: referencia, formulario, evento, mensaje entrante o prospección autorizada. |
| Consentimiento de seguimiento | Casilla con fecha | Sí | Debe quedar registrado antes de enviar comunicaciones proactivas. |
| Nota de diagnóstico | Texto | No | Resume el dolor reportado sin incorporar información sensible no necesaria. |

El formulario no solicita datos financieros, documentos de identidad, credenciales, información médica ni acceso a cuentas. Si se integra en un sitio, debe explicar el propósito comercial y enlazar a un aviso de privacidad antes del envío.

## Automatizaciones permitidas y prohibidas

| Categoría | Permitida | Prohibida |
|---|---|---|
| Registro | Duplicar la etiqueta de producto y crear una tarea interna de revisar un nuevo lead. | Crear contactos desde listas no consentidas o enriquecer datos personales sin autorización. |
| Pipeline | Sugerir la etapa `New Lead` y recordar una revisión interna pendiente. | Mover a `Qualified`, `Proposal Sent`, `Negotiation` o `Closed` sin intervención humana. |
| Comunicación | Preparar un borrador de respuesta para revisión. | Enviar SMS, correo, WhatsApp, llamadas, publicaciones o campañas sin confirmación inmediata. |
| Agenda | Mostrar espacios disponibles al operador. | Reservar, cancelar o reprogramar una cita automáticamente. |
| Operación | Vincular de forma manual el ID de oportunidad con el producto correspondiente. | Aprobar pagos, aceptar términos, liberar servicios, certificar entregas o decidir incidencias. |

## Convención inicial

| Producto no inmobiliario | Etiqueta comercial propuesta | Resultado esperado del primer contacto |
|---|---|---|
| Por seleccionar tras investigación | `evox:<producto-1>` | Diagnóstico de proceso de quince minutos. |
| Por seleccionar tras investigación | `evox:<producto-2>` | Demostración del flujo operativo. |
| Por seleccionar tras investigación | `evox:<producto-3>` | Validar dolor, persona responsable y siguiente paso. |

No se han creado contactos, oportunidades, mensajes ni automatizaciones durante esta preparación. Antes de ejecutar cualquiera de esas acciones se solicitará una instrucción concreta y, para los canales de comunicación, una confirmación inmediata.
