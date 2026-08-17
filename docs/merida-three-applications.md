# Tres aplicaciones Evox para operaciones reales en Mérida

## Decisión de producto

Las tres aplicaciones se construirán como productos funcionales de la **suite Evox**, con rutas y datos separados, pero con la misma base de autenticación, aislamiento por usuario, historial verificable y decisiones humanas. Esta elección permite publicar demostraciones independientes sin repetir infraestructura ni mezclar datos entre aplicaciones.

> La investigación disponible identifica flujos operativos existentes, no una disposición de pago demostrada. Cada aplicación deberá validarse mediante conversaciones y pilotos locales antes de presentarse como negocio validado. [1] [2] [3] [4]

| Orden | Aplicación | Comprador inicial | Problema operativo | Resultado verificable |
|---:|---|---|---|---|
| 1 | **Evox TurnoverOps** | Administradores de villas, rentas vacacionales y pequeños hospedajes | Entre una salida y una entrada, limpieza, inventario, incidencias y liberación se dispersan entre mensajes y fotos. | Cada cambio de ocupación tiene checklist, responsable, evidencias, incidencias y liberación humana. |
| 2 | **Evox VendorOps** | Administradores de inmuebles y coordinadores de mantenimiento | Proveedores, cotizaciones, visitas y comprobantes se pierden entre conversaciones sin una fuente de verdad. | Cada solicitud tiene proveedor, alcance, cotización, evidencia de servicio y una decisión manual registrada. |
| 3 | **Evox ObraBitácora** | Remodeladores, arquitectos y propietarios que supervisan obra menor | Los avances, incidencias y cambios de una remodelación se documentan tarde o no quedan vinculados al proyecto. | Cada jornada tiene avance, evidencia, incidencia y siguiente paso; la herramienta no sustituye permisos, peritajes ni trámites oficiales. |

## Límites obligatorios compartidos

| Principio | Aplicación práctica |
|---|---|
| Datos aislados | Cada consulta y mutación exige el usuario autenticado dueño del registro. |
| Evidencia antes que narrativa | Fotos, notas y URLs se vinculan a una entidad y a una fecha; no se usan conclusiones automáticas como evidencia. |
| Decisión humana | Ninguna IA o automatización libera una unidad, acepta una cotización, aprueba un gasto o certifica una obra. |
| Historial auditable | Los cambios operativos relevantes se registran como eventos append-only. |
| Sin datos ficticios como realidad | Las pantallas vacías guían al operador para capturar datos reales; las demostraciones de portafolio se etiquetan como tales. |
| Alcance local honesto | Las fuentes de Mérida sirven para elegir el flujo; no se hacen promesas de ocupación, renta, plusvalía, permisos ni ingresos. |

## Arquitectura de entrega

Las aplicaciones usarán la misma pila de Evox: React, TypeScript, tRPC, Drizzle, MySQL y Manus OAuth. Cada una tendrá un módulo con tablas, procedimientos protegidos, interfaz, pruebas y una ruta de navegación propia. La funcionalidad no dependerá de modelos de IA ni de servicios externos para demostrar valor.

## Alcance del primer corte de cada aplicación

| Aplicación | Entidades mínimas | Acción crítica humana |
|---|---|---|
| TurnoverOps | Unidad, cambio de ocupación, checklist, evidencia, incidencia | Liberar la unidad después de revisar el checklist. |
| VendorOps | Proveedor, solicitud, cotización, evidencia, decisión | Aceptar o rechazar una cotización con confirmación explícita. |
| ObraBitácora | Proyecto de obra, jornada, avance, incidencia, evidencia | Cerrar una jornada o registrar una modificación de alcance. |

## Referencias

[1]: https://www.pm23yucatan.com/ "PM23 — administración, mantenimiento y operación de estancias en Mérida"
[2]: https://www.inegi.org.mx/temas/vivienda/ "INEGI — información de vivienda"
[3]: https://www.observaturyucatan.org.mx/indicadores "Observatorio Turístico de Yucatán — indicadores para Mérida"
[4]: https://portalciudadano.merida.gob.mx/TramitesEnLinea/detalle-tramite/128 "Ayuntamiento de Mérida — constancia de terminación de obra"
