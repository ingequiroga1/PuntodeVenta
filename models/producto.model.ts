import { Schema,model } from "mongoose";
import format from 'format-number'

var ProductoSchema = new Schema(
    {
      clave: {type: String, require: true},
      articulo: {type: Number},
      descripcion: {type: String, required: true, max: 100},
      precio: {type: Number},
      linea: {type: String, required: false},
      existencia: {type: Number},
      marca:{type: String}
    }
  );

ProductoSchema
.virtual('url')
.get(function () {
  return '/producto/' + this._id;
});

ProductoSchema
.virtual('precio_formateado')
.get(function () {
  return this.precio ? format({prefix:'$'})(Number(this.precio)) : '0';
});

ProductoSchema
.virtual('descripcion_art')
.get(function () {
  return '@' + this.articulo + '|'+this.descripcion;
});

// ProductoSchema
// .virtual('descripcion_precio')
// .get(function () {
//   return '@' + this.articulo + '|' + this.descripcion + '     :' + this.precio_formateado;
// });

module.exports = model('Producto', ProductoSchema);
