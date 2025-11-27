const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  Usuario: { type: String, default: "admin" }, 
  Producto: String, // ID o nombre del producto
  Accion: String,
  Fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Logs", LogSchema);
