const express = require("express");
const router = express.Router();
const Factura = require("../Models/Factura");
const Producto = require("../Models/Product");
// Create
router.post("/", async (req, res) => {
  try {
    const productoId = req.body.productoId;

    if (!productoId) {
      return res.status(400).json({ error: "Falta productoId" });
    }

    // Buscar producto exacto en la colección Productos
    const producto = await Producto.findById(productoId);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Crear factura insertando el nombre REAL del producto
    const factura = new Factura({
      "Nombre y apellido": req.body["Nombre y apellido"],
      "Direccion": req.body["Direccion"],
      "Metodo de pago": req.body["Metodo de pago"],
      "Producto": producto.Nombre, // ← usa el campo EXACTO del modelo
      "Monto": req.body["Monto"]
    });

    await factura.save();

    res.json(factura);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get by ID
router.get("/:id", async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id);
    if (!factura) return res.status(404).json({ error: "Not found" });
    res.json(factura);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const update = {
      "Nombre y apellido": req.body["Nombre y apellido"],
      "Direccion": req.body["Direccion"],
      "Metodo de pago": req.body["Metodo de pago"],
      "Producto": req.body["Producto"],
      "Monto": req.body["Monto"]
    };
    const factura = await Factura.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(factura);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete
router.delete("/:id", async (req, res) => {
  try {
    await Factura.findByIdAndDelete(req.params.id);
    res.json({ msg: "Factura deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
