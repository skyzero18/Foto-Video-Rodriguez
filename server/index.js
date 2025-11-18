const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const auth = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la bdd
mongoose.connect("mongodb://localhost:27017/Uch")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

app.use("/auth", auth);

app.listen(4000, () => console.log("Servidor en http://localhost:4000"));
