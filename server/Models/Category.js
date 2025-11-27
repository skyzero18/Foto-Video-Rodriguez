const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  Nombre: { type: String, required: true },
  Activo: { type: Boolean, default: true }
});

module.exports = mongoose.model("Categoria", CategorySchema, "Categorias");
