const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const auth = require("./routes/auth");
const productos = require("./routes/productos"); 
const categoriasRoute = require("./routes/categorias");

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la bdd
mongoose.connect("mongodb://localhost:27017/Rodriguez")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// Rutas
app.use("/auth", auth);
app.use("/productos", productos); // ← RUTA AGREGADA
app.use("/categorias", categoriasRoute);

app.listen(4000, () => console.log("Servidor en http://localhost:4000"));
