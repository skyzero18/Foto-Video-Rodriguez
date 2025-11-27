import { useState } from "react";
import "./admin.css";

function AdminPanel() {
  const [producto, setProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: "",
    descripcion: "",
  });

  const [logs, setLogs] = useState("");

  const handleChange = (e) => {
    setProducto({
      ...producto,
      [e.target.name]: e.target.value,
    });
  };

  const guardar = async () => {
    try {
      const res = await fetch("http://localhost:4000/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });

      const data = await res.json();

      if (data.ok) {
        setLogs(
          (prev) =>
            prev +
            `\n[${new Date().toLocaleString()}] Producto creado ID: ${data.producto._id}`
        );

        alert("Producto creado correctamente");
      } else {
        alert("Error al crear producto");
      }
    } catch (err) {
      console.error(err);
      alert("Error en la conexión con el servidor");
    }
  };

  return (
    <div className="admin-container">

      <h1 className="admin-title">Panel de Administración</h1>

      <div className="admin-box">

        <div className="admin-form">
          <h2>Crear / Editar Producto</h2>

          <label>Nombre del producto</label>
          <input
            name="nombre"
            value={producto.nombre}
            onChange={handleChange}
            placeholder="Escribe el nombre"
          />

          <label>Precio</label>
          <input
            name="precio"
            type="number"
            value={producto.precio}
            onChange={handleChange}
            placeholder="Ej: 59999"
          />

          <label>Categoría</label>
          <select name="categoria" value={producto.categoria} onChange={handleChange}>
            <option value="">Seleccione...</option>
            <option value="oficina">Oficina</option>
            <option value="gamer">Gamer</option>
            <option value="hogar">Hogar</option>
          </select>

          <label>URL Imagen</label>
          <input
            name="imagen"
            value={producto.imagen}
            onChange={handleChange}
            placeholder="https://..."
          />

          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={producto.descripcion}
            onChange={handleChange}
            placeholder="Detalles del producto..."
          />

          <button onClick={guardar}>Guardar Cambios</button>
        </div>

        <div className="admin-logs">
          <h2>Logs del Sistema</h2>
          <textarea
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Aquí se registrarán las acciones del admin..."
          />
        </div>

      </div>
    </div>
  );
}

export default AdminPanel;
