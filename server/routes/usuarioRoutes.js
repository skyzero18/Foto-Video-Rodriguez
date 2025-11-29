const express = require("express");
const Usuario = require("../Models/Usuario");
const bcrypt = require("bcryptjs");

const router = express.Router();

// -----------------------------------------------
// 📌 REGISTRO DE USUARIO (con clave maestra)
// -----------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { Nombre, Correo, contraseña, claveRegistro } = req.body;

    if (!Nombre || !Correo || !contraseña || !claveRegistro) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    // 🔐 Clave maestra requerida para registrarse
    const CLAVE_MAESTRA = "pruebas";

    if (claveRegistro !== CLAVE_MAESTRA) {
      return res.status(403).json({ mensaje: "Clave de registro incorrecta" });
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


// -----------------------------------------------
// 📌 LOGIN DE USUARIO
// -----------------------------------------------
const loginUsuario = async (req, res) => {
  try {
    const { Correo, contraseña } = req.body;

    if (!Correo || !contraseña) {
      return res.status(400).json({ mensaje: "Faltan datos" });
    }

    const usuario = await Usuario.findOne({ Correo });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const passwordCorrecta = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!passwordCorrecta) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    return res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario._id,
        Nombre: usuario.Nombre,
        Correo: usuario.Correo
      }
    });

  } catch (error) {
    console.error("Error LOGIN:", error);
    return res.status(500).json({ error: "Error en el login" });
  }
};

router.post("/login", loginUsuario);

module.exports = router;
