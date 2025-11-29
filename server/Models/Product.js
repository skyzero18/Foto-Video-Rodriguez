const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  Nombre: { type: String, required: true },
  Descripcion: { type: String, default: "" },
  Precio: { type: Number, required: true },
  Activo: { type: Boolean, default: true },
  Categoria: { type: String, default: "" },
  Imagen: { type: String, default: "" },
  Stock: { type: Number, default: 0 } // <--- NUEVO CAMPO
});

// Exportamos el modelo
module.exports = mongoose.model("Producto", ProductSchema, "Productos");
