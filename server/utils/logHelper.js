const mongoose = require("mongoose");
const Log = require("../Models/Log");

function buildLogPayloadFrom(req, base = {}) {
  const rawUser = req.body.usuarios ?? req.body.Usuario ?? (req.user && (req.user._id || req.user.id)) ?? null;
  const doc = { ...base };

  if (rawUser) {
    const s = String(rawUser);
    if (mongoose.Types.ObjectId.isValid(s)) {
      doc.Usuario = s;
      doc.UsuarioTexto = "";
      console.debug("LOGHELPER - using Usuario(ObjectId):", s);
    } else {
      doc.UsuarioTexto = s;
      doc.Usuario = undefined;
      console.debug("LOGHELPER - using UsuarioTexto(string):", s);
    }
  } else {
    doc.UsuarioTexto = "sin-usuario";
    doc.Usuario = undefined;
    console.debug("LOGHELPER - no user provided, UsuarioTexto='sin-usuario'");
  }

  return doc;
}

async function createLogFromReq(req, base = {}) {
  try {
    const payload = buildLogPayloadFrom(req, base);
    console.debug("LOGHELPER - creating log payload:", payload);
    const nuevo = await Log.create(payload);
    return nuevo;
  } catch (err) {
    console.error("LOGHELPER - error creating log:", err);
    throw err;
  }
}

module.exports = { buildLogPayloadFrom, createLogFromReq };