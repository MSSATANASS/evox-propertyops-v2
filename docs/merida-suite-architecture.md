# Arquitectura de la suite Evox para Mérida

## Decisión técnica

Los tres productos se implementarán como módulos independientes dentro de la aplicación Evox existente, con rutas `/turnover`, `/vendors` y `/obra`. Comparten Manus OAuth, MySQL/Drizzle, tRPC, el lenguaje visual oscuro y el aislamiento por usuario. No comparten registros operativos salvo que una integración futura y explícita lo justifique.

| Módulo | Tablas del MVP | Ruta | Evento crítico que requiere acción humana |
|---|---|---|---|
| TurnoverOps | `turnover_units`, `turnovers`, `turnover_checklist_items`, `turnover_evidence`, `turnover_incidents` | `/turnover` | Liberar una unidad después de revisar manualmente los pendientes. |
| VendorOps | `service_vendors`, `service_requests`, `vendor_quotes`, `quote_evidence` | `/vendors` | Aceptar o rechazar una cotización con texto de confirmación. |
| ObraBitácora | `work_projects`, `work_logs`, `work_incidents`, `work_evidence` | `/obra` | Cerrar manualmente una jornada o registrar un cambio de alcance. |
| Auditoría común | `evox_module_events` | Todas | Insertar un evento append-only con actor, módulo, entidad, acción y timestamp. |

## Contratos de seguridad

1. Todas las tablas incluyen `ownerId` y cada lectura o mutación se filtra por el usuario autenticado.
2. Ningún módulo hace pagos, presenta permisos municipales, modifica trámites, libera una unidad, acepta una cotización o certifica una obra de forma automática.
3. La evidencia se registra mediante nota o URL; cuando se añada carga de archivos se usará almacenamiento privado, no BLOBs en MySQL.
4. Los estados se limitan con enums y validaciones tRPC. Los cambios relevantes generan eventos append-only.
5. Los datos que se introduzcan en producción provendrán del operador autenticado. No se crearán reseñas, ventas, proveedores o resultados ficticios.

## Orden de construcción

**TurnoverOps** va primero porque ofrece el ciclo más corto y visible: registrar una unidad, abrir un cambio de ocupación, completar checklist, adjuntar evidencia, registrar incidencia y liberar manualmente. Después se construye VendorOps para formalizar proveedores y cotizaciones, y por último ObraBitácora para el seguimiento diario de remodelación.

## Verificación mínima por módulo

| Capa | Prueba requerida |
|---|---|
| Datos | Migración revisada y aplicada sin operaciones destructivas. |
| Servidor | Pruebas Vitest para aislamiento de `ownerId`, transiciones válidas y guardas humanas. |
| Interfaz | Flujo vacío, creación, error y confirmación visible en escritorio y móvil. |
| Auditoría | Crear registros y comprobar que el evento conserva actor, entidad y hora. |
