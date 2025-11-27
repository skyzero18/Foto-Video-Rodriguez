const express = require("express");
const Categoria = require("../Models/Category");

const router = express.Router();

// Obtener solo categorías activas
router.get("/", async (req, res) => {
  try {
    const categorias = await Categoria.find({ Activo: true });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo categorías" });
  }
});

module.exports = router;
