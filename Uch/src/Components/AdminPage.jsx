import { useState, useEffect } from "react";
import "./admin.css";

function AdminPanel() {
  // Datos del producto
  const [producto, setProducto] = useState({
    nombre: "",
    precio: "",
    categoria: "",
    imagen: "",
    descripcion: "",
  });

  // Lista de categorías desde el backend
  const [categorias, setCategorias] = useState([]);

  // Logs
  const [logs, setLogs] = useState("");

  // Cargar categorías al iniciar
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const res = await fetch("http://localhost:4000/categorias");
        const data = await res.json();
        setCategorias(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };

    cargarCategorias();
  }, []);

  // Capturar cambios
  const handleChange = (e) => {
    setProducto({
      ...producto,
      [e.target.name]: e.target.value,
    });
  };

  // Guardar producto
  const guardar = async () => {
    try {
      const res = await fetch("http://localhost:4000/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });

      const data = await res.json();

      if (data.ok) {
        setLogs((prev) =>
          prev +
          `\n[${new Date().toLocaleString()}] Producto creado: ${data.producto.nombre}, ID: ${data.producto._id}`
        );

        alert("Producto creado correctamente");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error en la conexión con el servidor");
    }
  };

  // Crear categoría nueva
  const crearCategoria = async () => {
    const nombre = prompt("Nombre de la nueva categoría:");
    if (!nombre) return;

    try {
      const res = await fetch("http://localhost:4000/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      const data = await res.json();

      if (data.ok) {
        setCategorias([...categorias, data.categoria]);

        setLogs((prev) =>
          prev + `\n[${new Date().toLocaleString()}] Categoría creada: ${nombre}`
        );

        alert("Categoría creada");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la categoría");
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
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              name="categoria"
              value={producto.categoria}
              onChange={handleChange}
            >
              <option value="">Seleccione...</option>

              {categorias.map((cat) => (
                <option key={cat._id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>

            <button onClick={crearCategoria}>+</button>
          </div>

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

          <button onClick={guardar}>Guardar Producto</button>
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
