
import { Request, Response} from "express";
import {body,validationResult} from 'express-validator'
var Venta = require('../models/venta.model');
var Producto = require('../models/producto.model');

//Obtener Listas
exports.venta_lista = async (req: Request, res: Response) => {
    try {
        const results = await Venta.find({}).sort({secuencia:1}).exec();
        if (results.length === 0) {
            return res.status(404).json({error: 'No se encontraron ventas'});
        }
        res.json(results);
    } catch (error: any) {
        res.json(error);
    }
}

exports.venta_create = async(req: Request, res: Response)=>{
    Venta.findOne().sort({ secuencia: -1 }).exec()
    .then((result: any) => {
        let secuencia = result ? result.secuencia + 1 : 1;

        let venta = new Venta({
            secuencia: secuencia,
            productos: []
        });

        return venta.save();
    })
    .then((ventaGuardada: any) => {
        res.json(ventaGuardada);
    })
    .catch((err: any) => {
        res.json(err);
    });
}

exports.venta_detalle = async (req: Request, res: Response) => {
    try {
        const results = await Venta.findById(req.params.id)
            .populate('productos.producto')
            .exec();
    
        if (!results) {
            const error = new Error('Venta not found');
            return res.json(error);
        }
    
        res.json(results);
    } catch (error) {
        res.json(error);
    }
}

exports.modificar_cliente = (req: Request, res: Response) => {
    var id = req.params.id;
    var capturista = req.body.capturista;
    
    Venta.updateOne({ _id: id }, { $set: { capturista: capturista } })
        .then(() => {
            return Venta.findById(id)
                .populate('productos.producto')
                .exec();
        })
        .then((ventaEncontrada:any) => {
            if (!ventaEncontrada) {
                var error = new Error('Venta not found');
                return res.json(error);
            }
            res.json(ventaEncontrada);
        })
        .catch((err:any) => {
            res.json(err);
        });
    
    }

exports.venta_descuento_post = async (req: Request, res: Response) => {
    var id = req.params.id;
    var descuento = req.body.descuento; 
    let resultadoDescuento = {
        exitoso: false,
        resultado: {}
    }
    try{
      const resultfind = await Venta.findById(id).exec();
      if (!resultfind) {
        const error = new Error('Producto no encontrado');
        resultadoDescuento.resultado = error
        return res.json(resultadoDescuento);
      }

      let nuevoTotal = resultfind.subtotal - descuento;
      console.log("nuevototal",nuevoTotal);
      
      const resultDescuento = await Venta.updateOne({_id: id},{ $set: {descuento: descuento, total: nuevoTotal}}).exec();
      console.log(resultDescuento);
            
   
      resultadoDescuento.exitoso = true;
      resultadoDescuento.resultado = {msg: "Se aplico el descuento"}
      res.json(resultadoDescuento);
   
    }catch(error){
         res.json(resultadoDescuento);
    }
}

exports.venta_delete = async (req: Request, res: Response, next: any) => {  
    try {
        const result = await Venta.findByIdAndDelete(req.body.idventa).exec();
        res.json({msg: "Se elimino la venta"});
    } catch (error) {
        res.json(error);

    }
}


exports.venta_add_productos = [
    body('cantidad', 'Cantidad requerida').isNumeric(),
    body('prodescripcion', 'Producto requerido').isLength({min:1}).trim().escape(),
    body('precio','Precio requerido').isNumeric(),
    async(req: Request, res: Response)=>{
    var id = req.params.id;
    const errors = validationResult(req);   
     
     Venta.findById(id)
             .populate('productos.producto')
             .exec().then(
                 (venta:any) =>{
                     var tmpDescripcion = req.body.prodescripcion;
                     var letraInicio = tmpDescripcion.substring(0,1);
                     var iniciodes = tmpDescripcion.indexOf('|');
                     if (iniciodes < 0) {
                         iniciodes = tmpDescripcion.length;
                     }
                     let tprodes = req.body.prodescripcion.substring(iniciodes+1);
                     let tarticulo = req.body.prodescripcion.substring(1, iniciodes);
                     if ((letraInicio=='A' || letraInicio=='@') && !isNaN(tarticulo)) {       
                         Producto.findOne({articulo: tarticulo}).exec()
                             .then((pro:any)=>{
                                 if (!pro ){
                                     var err = [{msg:'Producto No existe'}];
                                     res.json({ title: 'Detalle', venta: venta, producto: tprodes, errors: err, prodes:tmpDescripcion } );
                                 }else{
                                    
                                     var producto = {
                                         producto: pro._id,
                                         cantidad: Math.round(req.body.cantidad),
                                         importe: Math.round(req.body.cantidad * req.body.precio*100)/100, 
                                         medias: Math.round(req.body.cantidad / 6),
                                         descripcion: pro.descripcion
                                     };

                                     if (!errors.isEmpty()) {  
                                              
                                         if (venta==null) { // No results.
                                             var error = new Error('Venta no encontrada');
                                             res.json(error);
                                         }
                                         // Successful, so render.
                                         res.json({ title: 'Detalle', venta: venta, producto: producto, errors:errors, prodes:tmpDescripcion } );
                                     return;
                                     }else{
                                         Venta.find({ '_id': req.params.id}, {'productos': {$elemMatch:{'producto': producto.producto}} })
                                         .exec().then((producto_encontrado:any) => {
                                             if (producto_encontrado[0].productos[0]) {
                                                 var ventaProducto = producto_encontrado[0].productos[0];
                                                 var sumacantidad = producto.cantidad+ventaProducto.cantidad;
                                                 var mensajeError='Ya existe el producto en la venta se agregan ' + producto.cantidad + ' piezas. Total: ' + sumacantidad;
                                                 var errEncontrado = [{msg: mensajeError}];

                                                 var venta_subtotal = venta.subtotal + producto.importe; 
                                                 var venta_total = venta_subtotal - venta.descuento;
                                                 var venta_no_medias = venta.no_medias + producto.medias; 
                                                 var venta_no_piezas = venta.no_piezas + producto.cantidad;
                                                
                                                 producto.cantidad = producto.cantidad+ventaProducto.cantidad;
                                                 producto.importe = producto.importe+ventaProducto.importe;
                                                 producto.medias = producto.medias+ventaProducto.medias;

                                                 Venta.updateOne({_id: venta.id, 'productos.producto': producto.producto}, {$set: {total: venta_total, subtotal: venta_subtotal, no_piezas: venta_no_piezas, no_medias: venta_no_medias, 'productos.$.cantidad': producto.cantidad, 'productos.$.importe': producto.importe, 'productos.$.medias': producto.medias }}) 
                                                 .then(()=>{
                                                     Venta.findById(id)
                                                     .populate('productos.producto').exec().then((venta:any)=>{
                                                         res.json({ title: 'Detalle', venta: venta, errors: errEncontrado, prodescripcion:'' });
                                                     })
                                                 }).catch((err:any)=>{
                                                     res.json(err)
                                                 });           
                                             }else{
                                                 var venta_subtotal = venta.subtotal + producto.importe;
                                                 var venta_total = venta_subtotal - venta.descuento
                                                 var venta_no_medias = venta.no_medias + producto.medias;
                                                 var venta_no_piezas = venta.no_piezas + producto.cantidad;

                                                 Venta.updateOne({_id: id}, { $push: {productos: producto}, $set: {total: venta_total, subtotal: venta_subtotal, no_piezas: venta_no_piezas, no_medias: venta_no_medias}})
                                                 .then(()=>{
                                                     res.json(venta);
                                                 }).catch((err:any)=>{
                                                     res.json(err);
                                                 })
                                             }
                                         }).catch((err:any)=>{
                                             res.json(err);
                                         });
                                     }
                                 }
                             })    
                     }else {
                         var err = [{msg:'Producto No existe'}];
                         res.json({ title: 'Detalle', venta: venta, errors: err, prodes:tmpDescripcion } );
                     }
                 }
             ).catch((err:any) => {
                 if (err) { return res.json(err);}
             })
}]

exports.venta_eliminar_producto = async(req: Request, res: Response, next: any) => {
    var id = req.params.id;
    var idproducto = req.params.idproducto;
    
    try {
        const resultVenta = await Venta.findById(id).exec();
        if (!resultVenta) { // No results.
            return res.status(404).json({ message: 'No se encontró ningúna venta con ese ID' });
        }
       
            const resultProducto = await  Venta.find({ '_id': req.params.id}, {'productos': {$elemMatch:{'producto': idproducto}} })
            .exec() 
            
            if (resultProducto[0].productos.length == 0) 
            { // No results.
            return res.status(404).json({exitoso:false, message: 'No se encontró ningún producto con ese ID' }); 
            }
                // Actualiza los totales de la venta.
            var totalsindesc = resultVenta.total + resultVenta.descuento; //VQuiroga  
            var venta_subtotal = totalsindesc - resultProducto[0].productos[0].importe;//VQuiroga
            var venta_total =  venta_subtotal - resultVenta.descuento;
            var venta_no_piezas = resultVenta.no_piezas  - resultProducto[0].productos[0].cantidad;
            console.log("actualizar totales",venta_subtotal,venta_total,venta_no_piezas);

            const resultUpdate = await Venta.updateOne({_id: id}, { $pull: {productos: {producto:idproducto}}, $set: {total: venta_total, subtotal: venta_subtotal, no_piezas: venta_no_piezas}})
            .exec()
            res.status(200).json({exitoso: true, message: 'Se elimino el producto de la venta'})
            
        
    } catch (error) {
        res.json(error);
    }
}

exports.venta_reportes_productos = async (req: Request, res: Response) => {
    try {
            let start = new Date(req.params.inicio)
            let end = new Date(req.params.fin)
            end.setDate(end.getDate() + 2);
            
            const result = await Venta.aggregate([
                {
                  $match: {
                    fecha: {
                      $gte: start,
                      $lt: end
                    }
                  }
                },
                {
                  $unwind: "$productos"
                },
                {
                  $group: {
                    _id: "$productos.descripcion",
                    totalQuantity: { $sum: "$productos.importe" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    producto: "$_id",
                    totalQuantity: 1
                  }
                }
              ]);
         
        if (!result) {
            const error = new Error('Venta not found');
            return res.json(error);
        }
        res.json(result);
    } catch (error) {
        res.json(error);
    }
}