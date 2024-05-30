import { Request, Response, Router } from "express";
import {Result, check,validationResult} from 'express-validator'
var Producto = require('../models/producto.model');

exports.producto_lista = async (req: Request, res: Response) => {
    try {
        const results = await Producto.find({}).sort({articulo:1}).exec();
        if (results.length === 0) {
            return res.status(404).json({error: 'No se encontraron productos'});
        }
        res.json(results);
    } catch (error: any) {
        res.json(error);
    }
}

exports.producto_create = [
    check('clave').notEmpty().withMessage('El campo clave es obligatorio').trim(),
    check('articulo').notEmpty().isNumeric().trim(),
    check('descripcion').isLength({min:1}).trim(),
    check('precio').isNumeric().trim(),
    check('existencia').isNumeric().trim(),
    async ( req: Request, res: Response, next: any) => {
        const resuladosVal:Result = validationResult(req);
        const errors = validationResult(req);
        var nuevoProducto = new Producto ({
            clave: req.body.clave,
            articulo: req.body.articulo,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            linea:req.body.linea,
            existencia:req.body.existencia,
            marca: req.body.marca 
        });

         if (!errors.isEmpty()) {
            res.send({ errors: errors.array() });
             return;
         } else {
          const results =  await Producto.findOne({clave: nuevoProducto.clave}).exec()
          if (results) {
            return res.status(404).json({msg:'Clave de producto ya existe'});
          }
          else{
             const resu = await nuevoProducto.save();
             console.log(resu);
             res.json({msg: 'Se creo el producto'});
          }
         }
}];

exports.producto_getUltimoArticulo = async (req: Request, res: Response) => {
    try{
        const ultimo = await Producto.findOne().sort({articulo: -1}).select('articulo').exec();
        res.json({lastId: ultimo.articulo});
    }
    catch(err){
        res.json(err)
    }
}


exports.producto_getDetalleProducto = async (req: Request, res: Response) => {
    let resultadoProducto = {
        exitoso: false,
        resultado: {}
    }
    try {
        const results = await Producto.findById(req.params.id)
            .exec();
    
        if (!results) {
            const error = new Error('Producto no encontrado');
            resultadoProducto.resultado = error
            return res.json(resultadoProducto);
        }
        
        resultadoProducto.resultado = results
        resultadoProducto.exitoso = true
        res.json(resultadoProducto);
    } catch (error) {
        res.json(resultadoProducto);
    }
}

exports.producto_updateProducto = async (req: Request, res: Response) => {
    let resultadoUpdate = {
        exitoso: false,
        resultado: {}
    }
    try {
        const results = await Producto.findById(req.body.id).exec()

        if (!results) {
            const error = new Error('Producto no encontrado');
            resultadoUpdate.resultado = error
            return res.json(resultadoUpdate);
        }else{
            const resultUpdate = await Producto.updateOne({_id: req.body.id},{$set: {clave: req.body.clave,descripcion: req.body.descripcion,
                precio: req.body.precio,linea: req.body.linea,existencia: req.body.existencia, marca: req.body.marca}})
            
            resultadoUpdate.exitoso = true
            resultadoUpdate.resultado = resultUpdate    
            console.log(resultadoUpdate);
            res.json(resultadoUpdate)
        }
    } catch (error) {
        res.json(resultadoUpdate);
    }
}

exports.producto_updateExistenciaProducto = async (req: Request, res: Response) => {
    let resultadoUpdate = {
        exitoso: false,
        resultado: {}
    }

    let idArticulo = req.body.articulo
    try {
        const results = await Producto.findOne({articulo: idArticulo}).exec()
        
        if (!results) {
            const error = new Error('Producto no encontrado');
            resultadoUpdate.resultado = error
            return res.json(resultadoUpdate);
        }else{
            let descontar = 1 
            let existenciaActualizada
            if (req.body.tipo == descontar) {
                existenciaActualizada = results.existencia - req.body.cantidad
            }
            else{
                existenciaActualizada = results.existencia + req.body.cantidad 
            }
            
             const resultUpdate = await Producto.updateOne({articulo: req.body.articulo},{$set: {existencia: existenciaActualizada}})
             resultadoUpdate.exitoso = true
             resultadoUpdate.resultado = resultUpdate    
             res.json(resultadoUpdate)
        }
    } catch (error) {
        res.json(resultadoUpdate);
    }
}

