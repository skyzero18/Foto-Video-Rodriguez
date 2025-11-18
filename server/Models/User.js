const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  rol: { type: String, required: true }, // alumno, admin, etc.
  materias: { type: Array, default: [] }
});

module.exports = mongoose.model("Usuarios", usuarioSchema);
