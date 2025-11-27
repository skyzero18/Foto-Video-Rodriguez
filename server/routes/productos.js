const express = require("express");
const Producto = require("../Models/Product");
const Log = require("../Models/Log");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// CREAR PRODUCTO + LOG
router.post("/", async (req, res) => {
  try {
    const nuevo = await Producto.create({
      Nombre: req.body.nombre,
      Precio: req.body.precio,
      Categoria: req.body.categoria,
      Imagen: req.body.imagen,
      Descripcion: req.body.descripcion,
      Activo: true
    });

    // Log automático
    await Log.create({
      Usuario: "admin",
      Producto: nuevo._id.toString(),
      Accion: "Producto creado",
    });

    res.json({ ok: true, producto: nuevo });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Error al crear el producto" });
  }
});
module.exports = router;
