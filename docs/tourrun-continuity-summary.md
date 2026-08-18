# Resumen de continuidad: Evox TourRun

## Estado de implementación

TourRun está integrado dentro de Evox PropertyOps como módulo de operaciones para tours y experiencias. La ruta es `/tourrun`; el acceso aparece en la navegación de la suite del dashboard. El módulo usa datos aislados por `ownerId`, eventos de auditoría append-only y procedimientos tRPC protegidos.

| Capa | Estado | Evidencia |
|---|---|---|
| Base de datos | Implementada y migrada | Tablas `tour_guides`, `tour_departures`, `tour_stops`, `tour_participants`, `tour_incidents`, `tour_evidence` y `tour_events`; migración `0008_smart_blue_marvel.sql` aplicada. |
| Reglas | Implementadas | Transiciones explícitas: `draft → ready → in_progress → completed`; cancelación permitida con motivo. |
| Control humano | Implementado | Cada transición exige frase escrita `CONFIRMAR <ESTADO>`; preparar exige guía y parada; completar bloquea incidencias abiertas. |
| Backend | Implementado | `server/tourRunDb.ts`, `server/tourRunRules.ts`, `server/routers/tourRun.ts`; router registrado como `tourRun`. |
| Interfaz | Implementada | `client/src/pages/TourRun.tsx`, con creación de guía y salida, itinerario, participantes, evidencia, incidencias y cambio manual de estado. |
| Pruebas | Aprobadas | `pnpm check` sin errores y `pnpm test` con 29 pruebas aprobadas en 10 archivos. |

## Verificación autenticada realizada

En sesión autenticada se crearon, con autorización del usuario, dos registros explícitamente marcados como prueba:

| Tipo | Valor |
|---|---|
| Guía | `Prueba TourRun — Guía de verificación` |
| Salida | `Prueba TourRun — Salida de verificación` |
| Ruta | `Mérida · recorrido de verificación` |
| Estado actual | `draft` |

Los registros se confirmaron mediante respuestas tRPC `200`, eventos auditables y la visualización del tablero. La comprobación de parada, participante, evidencia, incidencia, resolución y transición manual quedó pendiente porque el puente del navegador del usuario agotó el tiempo de espera tres veces después de crear la salida.

## Archivos principales

| Archivo | Propósito |
|---|---|
| `drizzle/schema.ts` | Tablas y tipos de TourRun. |
| `drizzle/0008_smart_blue_marvel.sql` | Migración aplicada. |
| `server/tourRunRules.ts` | Reglas deterministas y confirmaciones humanas. |
| `server/tourRunDb.ts` | Consultas aisladas y auditoría. |
| `server/routers/tourRun.ts` | Contrato tRPC validado con Zod. |
| `client/src/pages/TourRun.tsx` | Interfaz funcional. |
| `server/tourRunRules.test.ts` | Validación de transiciones y bloqueos. |
| `server/tourRunRouter.test.ts` | Aislamiento por usuario y confirmación escrita. |
| `docs/tourrun-authenticated-verification.md` | Bitácora de verificación en navegador. |

## Siguiente acción segura

Cuando el navegador responda, abrir `/tourrun`, seleccionar la salida de prueba y completar en este orden: añadir una parada, un participante, una evidencia, una incidencia; resolver la incidencia; escribir `CONFIRMAR READY`, luego `CONFIRMAR IN_PROGRESS` y finalmente `CONFIRMAR COMPLETED`. No crear pagos, boletos, reservas reales ni datos de contacto de terceros.
