require("dotenv").config({ path: "./Mongo.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productos = require("./routes/productos"); 
const categoriasRoute = require("./routes/categorias");
const usuarioRoutes= require("./routes/usuarioRoutes");
const logsRoutes= require("./routes/logs");
const app = express();
const facturasRoutes = require("./routes/facturas");

app.use(cors());
app.use(express.json());


const mongoURI =
  process.env.USE_ATLAS === "true"
    ? process.env.MONGO_URI_ATLAS
    : process.env.MONGO_URI_LOCAL;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB conectado a:", process.env.USE_ATLAS === "true" ? "ATLAS" : "LOCAL"))
  .catch((err) => console.log("Error MongoDB:", err));

app.use("/productos", productos); // ← RUTA AGREGADA
app.use("/categorias", categoriasRoute);
app.use("/usuarios", usuarioRoutes);
app.use("/logs", logsRoutes);
app.use("/facturas", facturasRoutes);

app.listen(4000, () => console.log("Servidor en http://localhost:4000"));
