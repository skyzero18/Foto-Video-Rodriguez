const express = require("express");
const Categoria = require("../Models/Category");
const Log = require("../Models/Log");
const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const categorias = await Categoria.find({ Activo: true });
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo categorías" });
  }
});


/* ===========================
    GET - Categoría por ID
=========================== */
router.get("/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);

    if (!categoria || !categoria.Activo) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(categoria);
  } catch (err) {
    res.status(500).json({ error: "Error buscando la categoría" });
  }
});


/* ===========================
    POST - Crear categoría nueva
=========================== */
/* ===========================
    POST - Crear categoría + LOG
=========================== */
router.post("/", async (req, res) => {
  try {
    const { Nombre } = req.body;

    if (!Nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const nuevaCategoria = await Categoria.create({ Nombre });

    // Log automático con nombre
    await Log.create({
      Usuario: "admin",
      Producto: nuevaCategoria._id.toString(),
      Accion: `Categoría creada: ${Nombre}`,
    });

    res.json({ ok: true, categoria: nuevaCategoria });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando categoría" });
  }
});


/* ===========================
    PUT - Editar categoría + LOG
=========================== */
router.put("/:id", async (req, res) => {
  try {
    const { Nombre, Activo } = req.body;

    const categoriaAnterior = await Categoria.findById(req.params.id);
    if (!categoriaAnterior) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const categoriaActualizada = await Categoria.findByIdAndUpdate(
      req.params.id,
      { Nombre, Activo },
      { new: true }
    );

    // Detectar si se eliminó (Activo pasó a false)
    if (categoriaAnterior.Activo && Activo === false) {
      await Log.create({
        Usuario: "admin",
        Producto: categoriaAnterior._id.toString(),
        Accion: `Categoría eliminada: ${categoriaAnterior.Nombre}`,
      });

      return res.json({ ok: true, mensaje: "Categoría eliminada", categoria: categoriaActualizada });
    }

    // Log normal de edición
    await Log.create({
      Usuario: "admin",
      Producto: categoriaActualizada._id.toString(),
      Accion: `Categoría editada: ${categoriaActualizada.Nombre}`,
    });

    res.json({ ok: true, categoria: categoriaActualizada });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando categoría" });
  }
});



/* ===========================
    DELETE - Borrado lógico
=========================== */
router.delete("/:id", async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { Activo: false },
      { new: true }
    );

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json({ mensaje: "Categoría eliminada (lógico)", categoria });

  } catch (err) {
    res.status(500).json({ error: "Error eliminando categoría" });
  }
});

module.exports = router;
