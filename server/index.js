const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productos = require("./routes/productos"); 
const categoriasRoute = require("./routes/categorias");
const usuarioRoutes= require("./routes/usuarioRoutes")
const app = express();

app.use(cors());
app.use(express.json());


mongoose.connect("mongodb://localhost:27017/Rodriguez")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));


app.use("/productos", productos); // ← RUTA AGREGADA
app.use("/categorias", categoriasRoute);
app.use("/usuarios", usuarioRoutes);

app.listen(4000, () => console.log("Servidor en http://localhost:4000"));
