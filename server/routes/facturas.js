const express = require("express");
const router = express.Router();
const Factura = require("../Models/Factura");
const Producto = require("../Models/Product");

// Listar todas las facturas
router.get("/", async (req, res) => {
  try {
    console.log("📋 Obteniendo todas las facturas...");
    const facturas = await Factura.find().sort({ fecha: -1 });
    console.log(`✅ Se encontraron ${facturas.length} facturas`);
    console.log("Facturas completas:", JSON.stringify(facturas, null, 2));
    res.json({ ok: true, facturas });
  } catch (err) {
    console.error("❌ Error en GET /facturas:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Crear factura
router.post("/", async (req, res) => {
  try {
    console.log("📝 Creando factura con datos:", req.body);
    const productoId = req.body.productoId;
    if (!productoId) {
      return res.status(400).json({ ok: false, error: "productoId es requerido" });
    }

    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({ ok: false, error: "Producto no encontrado" });
    }

    const fechaActual = new Date();
    console.log("🕒 Fecha actual que se guardará:", fechaActual);

    const factura = new Factura({
      "Nombre y apellido": req.body["Nombre y apellido"],
      "Direccion": req.body["Direccion"],
      "Metodo de pago": req.body["Metodo de pago"],
      "Producto": producto.Nombre,
      "Monto": req.body["Monto"],
      fecha: fechaActual
    });

    console.log("💾 Factura antes de guardar:", JSON.stringify(factura, null, 2));
    await factura.save();
    console.log("✅ Factura guardada exitosamente:", JSON.stringify(factura, null, 2));
    res.json({ ok: true, factura });
  } catch (err) {
    console.error("❌ Error en POST /facturas:", err);
    res.status(500).json({ ok: false, error: "Error al crear la factura" });
  }
});

// Filtrar por día
router.get("/filtrar", async (req, res) => {
  try {
    console.log("🔍 Parámetros recibidos:", req.query);
    const { dia, mes, ano } = req.query;
    
    if (!dia || !mes || !ano) {
      console.log("⚠️ Faltan parámetros");
      return res.status(400).json({ ok: false, error: "Faltan parámetros dia, mes o ano" });
    }

    const d = String(dia).padStart(2, "0");
    const m = String(mes).padStart(2, "0");

    // Ajustar el rango para incluir todo el día en cualquier zona horaria
    // Expandir el rango 24 horas antes y después
    const inicio = new Date(`${ano}-${m}-${d}T00:00:00.000Z`);
    inicio.setHours(inicio.getHours() - 24); // Retroceder 24 horas
    
    const fin = new Date(`${ano}-${m}-${d}T23:59:59.999Z`);
    fin.setHours(fin.getHours() + 24); // Avanzar 24 horas

    console.log("📅 Rango de fechas construido (con margen):");
    console.log("   Inicio:", inicio);
    console.log("   Fin:", fin);

    // Primero, veamos TODAS las facturas con sus fechas
    const todasFacturas = await Factura.find();
    console.log(`📊 Total de facturas en BD: ${todasFacturas.length}`);
    todasFacturas.forEach((f, idx) => {
      console.log(`   Factura ${idx + 1}: fecha=${f.fecha}, _id=${f._id}`);
    });

    // Ahora aplicamos el filtro
    const facturas = await Factura.find({ 
      fecha: { $gte: inicio, $lte: fin } 
    }).sort({ fecha: -1 });

    console.log(`✅ Facturas filtradas: ${facturas.length}`);
    if (facturas.length > 0) {
      console.log("Facturas encontradas:", JSON.stringify(facturas, null, 2));
    } else {
      console.log("⚠️ No se encontraron facturas en ese rango");
    }

    res.json({ ok: true, facturas });
  } catch (err) {
    console.error("❌ Error en GET /facturas/filtrar:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Obtener por ID
router.get("/:id", async (req, res) => {
  try {
    console.log("🔍 Buscando factura con ID:", req.params.id);
    const factura = await Factura.findById(req.params.id);
    if (!factura) {
      console.log("⚠️ Factura no encontrada");
      return res.status(404).json({ ok: false, error: "Factura no encontrada" });
    }
    console.log("✅ Factura encontrada:", JSON.stringify(factura, null, 2));
    res.json({ ok: true, factura });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
