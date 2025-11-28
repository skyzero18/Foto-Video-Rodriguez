const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  Nombre: { type: String, required: true },
  Correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  Activo: { type: Boolean, default: true }
});


module.exports = mongoose.model("Usuario", UsuarioSchema);
