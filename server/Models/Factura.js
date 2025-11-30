const mongoose = require("mongoose");

const FacturaSchema = new mongoose.Schema({
  "Nombre y apellido": { type: String },
  "Direccion": { type: String },
  "Metodo de pago": { type: String },
  "Producto": { type: String },
  "Monto": { type: Number },
  fecha: { type: Date, default: Date.now }  // Este campo está presente
});

module.exports = mongoose.model("Factura", FacturaSchema);
