const mongoose = require("mongoose");

const FacturaSchema = new mongoose.Schema({
  "Nombre y apellido": { type: String, required: true },
  "Direccion": { type: String, required: true },
  "Metodo de pago": { type: String, required: true },
  "Producto": { type: String, required: true },
  "Monto": { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Factura", FacturaSchema);
