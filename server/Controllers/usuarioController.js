const express = require("express");
const bcrypt = require("bcrypt");
const Usuario = require("../Models/Usuario");


const registrarUsuario = async (req, res) => {
  try {
    const { Nombre, Correo, contraseña } = req.body;

    if (!Nombre || !Correo || !contraseña) {
      return res.status(400).json({ msg: "Faltan datos" });
    }

    const existe = await Usuario.findOne({ Correo });
    if (existe) {
      return res.status(400).json({ msg: "El correo ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaCifrada = await bcrypt.hash(contraseña, salt);

    const nuevoUsuario = new Usuario({
      Nombre,
      Correo,
      contraseña: contraseñaCifrada,
      Activo: true,
    });

    await nuevoUsuario.save();
    res.json({ msg: "Usuario registrado correctamente" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { Correo, contraseña } = req.body;

    if (!Correo || !contraseña) {
      return res.status(400).json({ msg: "Faltan datos" });
    }

    const usuario = await Usuario.findOne({ Correo });

    if (!usuario) {
      return res.status(400).json({ msg: "Usuario no existe" });
    }

    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!coincide) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    if (!usuario.Activo) {
      return res.status(403).json({ msg: "Cuenta desactivada" });
    }

    res.json({
      msg: "Login exitoso",
      usuario: {
        id: usuario._id,
        Nombre: usuario.Nombre,
        Correo: usuario.Correo
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};
module.exports = { registrarUsuario, loginUsuario };
