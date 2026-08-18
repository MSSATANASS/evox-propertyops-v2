# Contratos MVP para los tres proyectos no inmobiliarios

## Principios compartidos

Los tres productos usarán una base full-stack independiente con autenticación, aislamiento por propietario, historial append-only y estados explícitos. Ninguno requiere IA, procesamiento automático de pagos ni ejecución autónoma de acciones críticas para aportar valor en su primer corte.

| Principio | Implementación mínima |
|---|---|
| Aislamiento | Todas las tablas llevan `ownerId`; ninguna consulta acepta un ID de propietario proporcionado por el cliente. |
| Auditoría | Los eventos relevantes registran actor, entidad, acción, metadatos mínimos y hora UTC. |
| Evidencia | Las notas y URLs se vinculan a la entidad operativa; los archivos futuros se almacenarán fuera de la base de datos. |
| Decisión humana | Los cambios críticos requieren confirmación escrita y guardan el usuario que tomó la decisión. |
| HighLevel | Solo enlaza el identificador de oportunidad cuando el prospecto ha dado consentimiento; no es fuente de verdad operativa. |

## Evox TourRun

| Elemento | Contrato MVP |
|---|---|
| Entidades | `tour_departures`, `tour_stops`, `tour_participants`, `tour_guides`, `tour_incidents`, `tour_evidence`, `tour_events`. |
| Estados de salida | `draft`, `ready`, `in_progress`, `completed`, `cancelled`. |
| Flujo | El operador crea una salida, asigna guía y paradas, registra participantes autorizados y evidencia de campo. |
| Acción crítica | Pasar a `ready`, `completed` o `cancelled` exige confirmación humana con motivo cuando aplica. |
| Límites | No emite boletos, no cobra, no confirma disponibilidad de terceros ni reemplaza requisitos turísticos o de transporte. |

## Evox TallerTrack

| Elemento | Contrato MVP |
|---|---|
| Entidades | `workshop_vehicles`, `work_orders`, `work_diagnostics`, `work_estimates`, `work_evidence`, `work_deliveries`, `work_events`. |
| Estados de orden | `intake`, `diagnosing`, `awaiting_authorization`, `in_service`, `ready_for_delivery`, `delivered`, `cancelled`. |
| Flujo | El taller registra ingreso, síntoma, diagnóstico, evidencia y presupuesto con sus propios datos. |
| Acción crítica | Autorizar trabajo, aceptar presupuesto y entregar vehículo requieren confirmación humana escrita y actor auditado. |
| Límites | No realiza cobros, no certifica seguridad del vehículo ni diagnostica automáticamente. |

## Evox ColmenaLedger

| Elemento | Contrato MVP |
|---|---|
| Entidades | `apiaries`, `hive_visits`, `honey_harvests`, `honey_lots`, `lot_transfers`, `lot_evidence`, `apiary_events`. |
| Estados de lote | `draft`, `recorded`, `held`, `released`, `delivered`. |
| Flujo | El productor captura visita de apiario, cosecha, lote, cantidades declaradas, traslado y evidencia. |
| Acción crítica | Liberar o marcar como entregado un lote exige confirmación escrita y motivo cuando se retiene. |
| Límites | No mide ni certifica pureza, inocuidad, origen, cumplimiento normativo ni precio; esos atributos permanecen bajo responsabilidad humana y de los procesos aplicables. |

## Criterio de primera implementación

**TourRun** se construirá primero porque concentra un ciclo operativo completo con pocas entidades, muestra coordinación visible para un prospecto turístico y aprovecha el pipeline comercial de HighLevel sin tener que tocar pagos o datos sensibles. TallerTrack seguirá como prueba de un flujo de autorización escrita; ColmenaLedger cerrará el conjunto con trazabilidad declarativa y límites explícitos de certificación.
