# Evox VendorOps

VendorOps reúne proveedores, solicitudes de servicio y cotizaciones para administradores de inmuebles y equipos de mantenimiento en Mérida. Los datos se crean únicamente a partir de entradas del operador autenticado; el módulo no fabrica proveedores, costos, reputación ni disponibilidad.

| Flujo | Estado inicial | Control humano obligatorio |
|---|---|---|
| Proveedor | Activo | El operador registra y conserva el expediente. |
| Solicitud | Borrador o visita pendiente | El operador define el alcance, ubicación y proveedor asignado. |
| Cotización | Pendiente | El operador incorpora descripción, monto y evidencia opcional. |
| Decisión | Aceptada o rechazada | Requiere escribir `ACEPTAR` o `RECHAZAR`; la acción y el usuario se registran en la auditoría. |

Cada tabla lleva `ownerId` y cada procedimiento tRPC usa el usuario autenticado. La aceptación de una cotización cambia la solicitud a programada, pero no ejecuta pagos, contrata al proveedor, aprueba gastos de PropertyOps ni modifica información fuera de la aplicación.

La interfaz se verificó en estado vacío; TypeScript completó sin errores y Vitest aprobó 24 pruebas, incluidas las reglas y el contrato de propietario de VendorOps.
