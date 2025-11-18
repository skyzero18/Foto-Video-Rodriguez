const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../Models/User");

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    const hashed = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      contraseña: hashed,
      rol,
      materias: []
    });

    await nuevoUsuario.save();
    res.json({ message: "Usuario creado correctamente" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    const user = await Usuario.findOne({ correo });
    if (!user) return res.status(400).json({ error: "Usuario no existe" });

    const coincide = await bcrypt.compare(contraseña, user.contraseña);
    if (!coincide) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      "claveSecreta123",
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        materias: user.materias
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
