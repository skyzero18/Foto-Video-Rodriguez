const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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

// Crear factura (múltiples productos) con validación de stock y descuento SIN transacción
router.post("/", async (req, res) => {
  try {
    const items = req.body.productos;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: "Se requiere al menos un producto" });
    }

    // Normaliza cantidades
    const solicitados = items.map(it => ({
      productoId: it.productoId,
      cantidad: Math.max(1, parseInt(it.cantidad || 1))
    }));

    // Traer productos
    const ids = solicitados.map(i => i.productoId);
    const productosDb = await Producto.find({ _id: { $in: ids } });
    const mapProd = new Map(productosDb.map(p => [String(p._id), p]));

    // Validaciones de existencia/estado/stock
    const faltantes = [];
    for (const it of solicitados) {
      const p = mapProd.get(String(it.productoId));
      if (!p) {
        faltantes.push({ productoId: it.productoId, motivo: "No existe" });
        continue;
      }
      const disponible = typeof p.Stock === "number" ? p.Stock : 0;
      if (p.Activo === false) {
        faltantes.push({ productoId: p._id, nombre: p.Nombre, motivo: "Inactivo" });
      } else if (disponible < it.cantidad) {
        faltantes.push({
          productoId: p._id,
          nombre: p.Nombre,
          solicitado: it.cantidad,
          disponible
        });
      }
    }
    if (faltantes.length) {
      return res.status(400).json({ ok: false, error: "Stock insuficiente", faltantes });
    }

    // Descuento de stock con verificación atómica por ítem y rollback si falla alguno
    const decrementados = [];
    for (const it of solicitados) {
      const upd = await Producto.updateOne(
        { _id: it.productoId, Stock: { $gte: it.cantidad } }, // condición
        { $inc: { Stock: -it.cantidad } }
      );
      if (!upd.modifiedCount) {
        // rollback de lo ya descontado
        for (const done of decrementados) {
          await Producto.updateOne({ _id: done.productoId }, { $inc: { Stock: done.cantidad } });
        }
        const p = mapProd.get(String(it.productoId));
        return res.status(409).json({
          ok: false,
          error: `Stock insuficiente durante actualización${p ? ` para ${p.Nombre}` : ""}`,
          code: "STOCK_RACE"
        });
      }
      decrementados.push(it);
    }

    // Construir detalle y total
    let productosFactura = [];
    let total = 0;
    for (const it of solicitados) {
      const p = mapProd.get(String(it.productoId));
      const precio = Number(p.Precio) || 0;
      const subtotal = precio * it.cantidad;
      total += subtotal;
      productosFactura.push({
        productoId: p._id,
        nombre: p.Nombre,
        cantidad: it.cantidad,
        precioUnitario: precio,
        subtotal
      });
    }

    // Guardar factura
    const factura = new Factura({
      "Nombre y apellido": req.body["Nombre y apellido"],
      "Direccion": req.body["Direccion"],
      "Metodo de pago": req.body["Metodo de pago"],
      productos: productosFactura,
      "Monto": total,
      fecha: new Date()
    });

    const guardada = await factura.save();
    return res.status(201).json({ ok: true, factura: guardada });
  } catch (err) {
    console.error("❌ Error en POST /facturas:", err);
    return res.status(500).json({ ok: false, error: "Error al crear la factura" });
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
