import { useState, useEffect } from "react";
import "../Components/admin.css";

function AdminPanel() {
  const [accion, setAccion] = useState("crear");
  const [entidad, setEntidad] = useState("producto");

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  const [categoriaId, setCategoriaId] = useState("");
  const [productoId, setProductoId] = useState("");

  const [form, setForm] = useState({
    Nombre: "",
    Descripcion: "",
    Precio: "",
    Categoria: "",
    Imagen: ""
  });

  const [nuevoNombreCategoria, setNuevoNombreCategoria] = useState("");

  // ----------------------------
  // Cargar datos iniciales
  // ----------------------------
  const cargarCategorias = async () => {
    const res = await fetch("http://localhost:4000/categorias");
    const data = await res.json();
    setCategorias(data);
  };

  const cargarProductos = async () => {
    const res = await fetch("http://localhost:4000/productos");
    const data = await res.json();
    setProductos(data);
  };

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  // ----------------------------
  // Manejar inputs
  // ----------------------------
  const actualizarForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ============================================================
  // ==================== PRODUCTOS =============================
  // ============================================================

  // CREAR PRODUCTO
  const agregarProducto = async () => {
    await fetch("http://localhost:4000/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.Nombre,
        descripcion: form.Descripcion,
        precio: form.Precio,
        categoria: form.Categoria,
        imagen: form.Imagen,
      }),
    });

    alert("Producto creado");
    cargarProductos();
  };

  // EDITAR PRODUCTO
  const editarProducto = async () => {
    if (!productoId) return alert("Seleccione un producto");

    await fetch(`http://localhost:4000/productos/${productoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Producto editado");
    cargarProductos();
  };

  // ELIMINAR PRODUCTO (Set Activo = false)
  const desactivarProducto = async () => {
    if (!productoId) return alert("Seleccione un producto");

    await fetch(`http://localhost:4000/productos/${productoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Activo: false }),
    });

    alert("Producto eliminado");
    cargarProductos();
  };

  // ============================================================
  // ==================== CATEGORÍAS =============================
  // ============================================================

  // CREAR CATEGORÍA
  const crearCategoria = async () => {
    if (!nuevoNombreCategoria) return alert("Ingrese un nombre");

    await fetch("http://localhost:4000/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Nombre: nuevoNombreCategoria }),
    });

    alert("Categoría creada");
    setNuevoNombreCategoria("");
    cargarCategorias();
  };

  // EDITAR CATEGORÍA
  const editarCategoria = async () => {
    if (!categoriaId) return alert("Seleccione una categoría");
    if (!nuevoNombreCategoria) return alert("Ingrese nuevo nombre");

    await fetch(`http://localhost:4000/categorias/${categoriaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Nombre: nuevoNombreCategoria }),
    });

    alert("Categoría actualizada");
    setNuevoNombreCategoria("");
    cargarCategorias();
  };

  // ELIMINAR CATEGORÍA (Set Activo = false)
  const borrarCategoria = async () => {
    if (!categoriaId) return alert("Seleccione una categoría");

    await fetch(`http://localhost:4000/categorias/${categoriaId}`, {
      method: "DELETE",
    });

    alert("Categoría eliminada");
    setCategoriaId("");
    cargarCategorias();
  };

  // ============================================================
  // ==================== RENDER ================================
  // ============================================================

  return (
    <div style={{ padding: "20px" }}>
      <h2>Panel Administrativo</h2>

      {/* COMBO 1 - ACCIÓN */}
      <label>Acción:</label>
      <select value={accion} onChange={(e) => setAccion(e.target.value)}>
        <option value="crear">Crear</option>
        <option value="editar">Editar</option>
        <option value="borrar">Eliminar</option>
      </select>

      <br /><br />

      {/* COMBO 2 - ENTIDAD */}
      <label>Entidad:</label>
      <select value={entidad} onChange={(e) => setEntidad(e.target.value)}>
        <option value="producto">Producto</option>
        <option value="categoria">Categoría</option>
      </select>

      <br /><br />

      {/* ===================================================== */}
      {/* ===============        CATEGORÍAS     =============== */}
      {/* ===================================================== */}

      {entidad === "categoria" && (
        <div>
          {/* EDITAR / BORRAR → elegir categoría */}
          {(accion === "editar" || accion === "borrar") && (
            <>
              <label>Seleccionar categoría:</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Seleccione...</option>
                {categorias.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.Nombre}
                  </option>
                ))}
              </select>
              <br /><br />
            </>
          )}

          {/* SOLO EDITAR o CREAR → pedir nuevo nombre */}
          {(accion === "editar" || accion === "crear") && (
            <div>
              <label>Nombre:</label>
              <input
                type="text"
                value={nuevoNombreCategoria}
                onChange={(e) => setNuevoNombreCategoria(e.target.value)}
                placeholder="Nombre de la categoría"
              />
            </div>
          )}

          <br />

          {/* BOTONES */}
          {accion === "crear" && <button onClick={crearCategoria}>Crear categoría</button>}
          {accion === "editar" && <button onClick={editarCategoria}>Editar categoría</button>}
          {accion === "borrar" && <button onClick={borrarCategoria}>Eliminar categoría</button>}
        </div>
      )}

      {/* ===================================================== */}
      {/* ===============        PRODUCTOS      =============== */}
      {/* ===================================================== */}

      {entidad === "producto" && (
        <div>
          {/* EDITAR / ELIMINAR → pedir ID */}
          {(accion === "editar" || accion === "borrar") && (
            <>
              <label>Seleccionar producto:</label>
              <select
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
              >
                <option value="">Seleccione...</option>
                {productos.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.Nombre}
                  </option>
                ))}
              </select>
              <br /><br />
            </>
          )}

          {/* FORMULARIO DE PRODUCTOS */}
          {(accion === "crear" || accion === "editar") && (
            <div>
              <input
                name="Nombre"
                placeholder="Nombre"
                value={form.Nombre}
                onChange={actualizarForm}
              />

              <input
                name="Descripcion"
                placeholder="Descripción"
                value={form.Descripcion}
                onChange={actualizarForm}
              />

              <input
                name="Precio"
                type="number"
                placeholder="Precio"
                value={form.Precio}
                onChange={actualizarForm}
              />

              <select
                name="Categoria"
                value={form.Categoria}
                onChange={actualizarForm}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.Nombre}
                  </option>
                ))}
              </select>


              <input
                name="Imagen"
                placeholder="URL de imagen"
                value={form.Imagen}
                onChange={actualizarForm}
              />
            </div>
          )}

          <br />

          {/* BOTONES */}
          {accion === "crear" && <button onClick={agregarProducto}>Agregar producto</button>}
          {accion === "editar" && <button onClick={editarProducto}>Editar producto</button>}
          {accion === "borrar" && <button onClick={desactivarProducto}>Eliminar producto</button>}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
