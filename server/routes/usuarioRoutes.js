const express = require("express");
const Usuario = require("../Models/Usuario");
const bcrypt = require("bcryptjs");

const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const { Nombre, Correo, contraseña } = req.body;

    if (!Nombre || !Correo || !contraseña) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    // Verificar duplicado
    const existe = await Usuario.findOne({ Correo });
    if (existe) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const nuevo = new Usuario({
      Nombre,
      Correo,
      contraseña: hashedPassword,
      Activo: true
    });

    await nuevo.save();
    return res.json({ mensaje: "Usuario creado correctamente", usuario: nuevo });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
});

module.exports = router;
