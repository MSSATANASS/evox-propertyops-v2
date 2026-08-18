# Tienda Shopify conectada a Evox

## Estado de la conexión

Se creó una nueva tienda de desarrollo vinculada al proyecto: `evoxprops-m9yxtilx-acorn-blossom-rnna15sm`. El storefront se expone mediante procedimientos tRPC públicos de comercio y la ruta `/tienda` dentro de Evox, sin exponer tokens de Shopify al navegador.

| Elemento | Estado |
|---|---|
| Tienda de desarrollo | Creada y enlazada al proyecto. |
| Router `commerce` | Registrado en el contrato principal de tRPC. |
| Storefront API | Configurado en el servidor mediante las variables del proyecto. |
| Catálogo | Vacío intencionalmente. |
| Escaparate `/tienda` | Verificado: muestra el estado vacío honesto tras consultar Shopify. |

## Límites operativos

No se crearon productos, precios, descuentos, cobros, reseñas ni datos comerciales de ejemplo. El escaparate comunica que el catálogo estará disponible cuando un operador defina y publique ofertas reales. La pantalla no inicia checkout mientras no exista un producto publicado.

## Próximos pasos bajo control del propietario

La tienda debe reclamarse desde **Configuración → Integraciones → Shopify** del proyecto. Después, el propietario podrá definir productos, precios, inventario y pagos en Shopify. Cualquier producto que se publique debe corresponder a una oferta real y a condiciones comerciales autorizadas.
