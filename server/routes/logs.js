const express = require("express");
const router = express.Router();
const Log = require("../Models/Log");

// GET logs con paginación
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const logs = await Log.find()
      .sort({ Fecha: -1 }) // Más recientes primero
      .skip(skip)
      .limit(limit);

    const total = await Log.countDocuments();

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      logs
    });
  } catch (error) {
    console.error("Error obteniendo logs:", error);
    res.status(500).json({ error: "Error al obtener logs" });
  }
});

module.exports = router;
