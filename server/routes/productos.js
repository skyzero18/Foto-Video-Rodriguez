const express = require("express");
const Producto = require("../Models/Product");
const Log = require("../Models/Log");
const { createLogFromReq } = require("../utils/logHelper");
const router = express.Router();

// OBTENER TODOS
router.get("/", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OBTENER POR ID
router.get("/:id", async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({ ok: false, error: "Producto no encontrado" });
    }

    res.json({ ok: true, producto });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// CREAR PRODUCTO + LOG
router.post("/", async (req, res) => {
  try {
    const nuevo = await Producto.create({
      Nombre: req.body.Nombre || req.body.nombre,
      Precio: req.body.Precio || req.body.precio,
      Categoria: req.body.Categoria || req.body.categoria,
      Imagen: req.body.Imagen || req.body.imagen,
      Descripcion: req.body.Descripcion || req.body.descripcion,
      Stock: req.body.Stock || 0,
      Activo: true
    });

    try {
      await createLogFromReq(req, {
        Producto: nuevo._id.toString(),
        Accion: `Producto creado: ${nuevo.Nombre}`
      });
    } catch (logErr) {
      console.error("Error creando log (producto crear):", logErr);
    }

    res.json({ ok: true, producto: nuevo });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error al crear el producto" });
  }
});

// EDITAR PRODUCTO + LOG
router.patch("/:id", async (req, res) => {
  try {
    // normalizar posible payload de stock (Stock o stock) y forzar Number
    const updateData = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(req.body, "Stock") || Object.prototype.hasOwnProperty.call(req.body, "stock")) {
      const sval = req.body.Stock ?? req.body.stock;
      updateData.Stock = Number(sval);
    }
    const producto = await Producto.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    // crear log de edición / desactivación
    try {
      await createLogFromReq(req, {
        Producto: producto._id.toString(),
        Accion: (req.body.Activo === false) ? `Producto desactivado: ${producto.Nombre}` : `Producto editado: ${producto.Nombre}`
      });
    } catch (logErr) {
      console.error("Error creando log (producto editar):", logErr);
    }
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH STOCK + LOG
router.patch("/:id/stock", async (req, res) => {
  try {
    const { Stock } = req.body;

    const actualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      { Stock },
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ ok: false, error: "Producto no encontrado" });
    }

    try {
      await createLogFromReq(req, {
        Producto: actualizado._id.toString(),
        Accion: `Stock actualizado a ${Stock} para ${actualizado.Nombre}`
      });
    } catch (logErr) {
      console.error("Error creando log (stock):", logErr);
    }

    res.json({ ok: true, producto: actualizado });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error al actualizar stock" });
  }
});

// ELIMINAR PRODUCTO + LOG
router.delete("/:id", async (req, res) => {
  try {
    const eliminado = await Producto.findByIdAndDelete(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ ok: false, error: "Producto no encontrado" });
    }

    try {
      await createLogFromReq(req, {
        Producto: eliminado._id.toString(),
        Accion: `Producto eliminado: ${eliminado.Nombre}`
      });
    } catch (logErr) {
      console.error("Error creando log (delete):", logErr);
    }

    res.json({ ok: true, mensaje: `Producto eliminado: ${eliminado.Nombre}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error al eliminar el producto" });
  }
});

module.exports = router;
