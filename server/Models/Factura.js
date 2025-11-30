const mongoose = require("mongoose");

const FacturaSchema = new mongoose.Schema({
  "Nombre y apellido": { type: String },
  "Direccion": { type: String },
  "Metodo de pago": { type: String },
  productos: [{
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    nombre: { type: String },
    cantidad: { type: Number, default: 1 },
    precioUnitario: { type: Number },
    subtotal: { type: Number }
  }],
  "Monto": { type: Number },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Factura", FacturaSchema);
