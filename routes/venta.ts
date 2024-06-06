import { Request, Response, Router } from "express";
var venta_controller = require('../controllers/venta_controller')
const ventaRoutes = Router();
//Lista Venta
ventaRoutes.get('/lista',venta_controller.venta_lista);
//Crear Venta
ventaRoutes.get('/create',venta_controller.venta_create);
//Eliminar Venta
ventaRoutes.post('/delete',venta_controller.venta_delete);
//Obtener Detalle venta
ventaRoutes.get('/:id',venta_controller.venta_detalle);
//Modificar Cliente
ventaRoutes.post('/api/:id/capturista',venta_controller.modificar_cliente);
//Agregar Productos
ventaRoutes.post('/:id/agregar_producto', venta_controller.venta_add_productos)
//Eliminar producto venta
ventaRoutes.post('/:id/:idproducto/eliminar', venta_controller.venta_eliminar_producto )
//Generar reporte
ventaRoutes.get('/productos/reporte/:inicio/:fin', venta_controller.venta_reportes_productos )
//Agregar Descuento
ventaRoutes.post('/:id/descuento', venta_controller.venta_descuento_post )





export default ventaRoutes;