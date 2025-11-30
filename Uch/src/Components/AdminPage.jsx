import { useState, useEffect, useContext } from "react";
import styles from "./AdminPage.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

function AdminPanel() {
   
  const [accion, setAccion] = useState("crear");
  const [entidad, setEntidad] = useState("producto");
  const { id } = useParams();

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();
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
  const [factura, setFactura] = useState({
    nombre: "",
    direccion: "",
    metodoPago: "",
    productoId: "",
    monto: ""
  });

  const { logout } = useContext(AuthContext);

  const crearFactura = async () => {
    const res = await fetch("http://localhost:4000/facturas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "Nombre y apellido": factura.nombre,
        "Direccion": factura.direccion,
        "Metodo de pago": factura.metodoPago,
        "productoId": factura.productoId,
        "Monto": factura.monto
      })
    });

    const data = await res.json();

      if (data.error) return alert(data.error);

      alert("Factura generada correctamente");
    };
    
    const cargarCategorias = async () => {
      const res = await fetch("http://localhost:4000/categorias");
      const data = await res.json();
      setCategorias(data);
    };

    const cargarProductos = async () => {
      const res = await fetch("http://localhost:4000/productos");
      const data = await res.json();
      setProductos(data);
      return data;
    };

    useEffect(() => {
    cargarCategorias();
    cargarProductos().then((dataProductos) => {
      if (id) {
        setAccion("editar");
        setEntidad("producto");
        setProductoId(id);

        const producto = dataProductos.find(p => p._id === id);
        if (producto) {
          setForm({
            Nombre: producto.Nombre,
            Descripcion: producto.Descripcion,
            Precio: producto.Precio,
            Categoria: producto.Categoria,
            Imagen: producto.Imagen
          });
        }
      }
    });
    cargarLogs(1);
  }, []);

    const actualizarForm = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ============================================================
    // ==================== PRODUCTOS =============================
    // ============================================================

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

    const editarProducto = async () => {
      if (!productoId) return alert("Seleccione un producto");

      await fetch(`http://localhost:4000/productos/${productoId}`, {
        method: "PATCH", // ← Cambiar de PUT a PATCH
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      alert("Producto editado");
      cargarProductos();
    };

    const desactivarProducto = async () => {
      if (!productoId) return alert("Seleccione un producto");

      await fetch(`http://localhost:4000/productos/${productoId}`, {
        method: "PATCH", // ← Cambiar de PUT a PATCH
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Activo: false }),
      });

      alert("Producto eliminado");
      cargarProductos();
    };

  // ============================================================
  // ==================== CATEGORÍAS ============================
  // ============================================================

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

  const editarCategoria = async () => {
    if (!categoriaId) return alert("Seleccione una categoría");
    if (!nuevoNombreCategoria) return alert("Ingrese nuevo nombre");

    await fetch(`http://localhost:4000/categorias/${categoriaId}`, {
      method: "PATCH", // ← Cambiar de PUT a PATCH
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Nombre: nuevoNombreCategoria }),
    });

    alert("Categoría actualizada");
    setNuevoNombreCategoria("");
    cargarCategorias();
  };

  const borrarCategoria = async () => {
    if (!categoriaId) return alert("Seleccione una categoría");

    await fetch(`http://localhost:4000/categorias/${categoriaId}`, {
      method: "DELETE",
    });

    alert("Categoría eliminada");
    setCategoriaId("");
    cargarCategorias();
  };

  // ====================== LOGS ================================

  const [logs, setLogs] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargarLogs = async (page = 1) => {
    try {
      const res = await fetch(`http://localhost:4000/logs?page=${page}&limit=10`);
      const data = await res.json();

      setLogs(data.logs);
      setTotalPaginas(data.totalPages);
      setPagina(page);
    } catch (err) {
      console.error("Error cargando logs:", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Render

  return (
    <>
      <header className={styles["ml-header"]}>
        <img src="\public\96919ec3-2b35-4e8c-b4cb-ab67f08d736d.jpg" alt="s" style={{ width: "140px", height: "auto" }} />
      
        <nav className={styles["ml-nav"]}>
          <button
            onClick={() => navigate("/main")}
            style={{
              background: "#fff",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "10px"
            }}
          >
            Inicio
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "#d32f2f",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Cerrar Sesión
          </button>
        </nav>
      </header>

      <div className={styles["admin-container"]}>
      
        <div className={styles["admin-grid"]}>

          <div className={styles["card"]}>
            <h2>Panel Administrativo</h2>

            {/* COMBO ACCION */}
            <label>Acción:</label>
            <select value={accion} onChange={(e) => setAccion(e.target.value)}>
              <option value="crear">Crear</option>
              <option value="editar">Editar</option>
              <option value="borrar">Eliminar</option>
            </select>

            <br /><br />

            {/* COMBO ENTIDAD */}
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
                {/* Combobox para seleccionar categoría al editar o borrar */}
                {(accion === "editar" || accion === "borrar") && (
                  <>
                    <label>Seleccionar categoría:</label>
                    <select
                      value={categoriaId}
                      onChange={(e) => {
                        const idSeleccionado = e.target.value;
                        setCategoriaId(idSeleccionado);

                        // Auto-completa el input con el nombre de la categoría seleccionada
                        const cat = categorias.find(c => c._id === idSeleccionado);
                        setNuevoNombreCategoria(cat ? cat.Nombre : "");
                      }}
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

                {/* Input para editar categoría solo se usa si es editar */}
                {accion === "editar" && categoriaId && (
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

                {/* Input para crear categoría */}
                {accion === "crear" && (
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

                {/* Botones según la acción */}
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
                {(accion === "crear" || accion === "editar") && (
                  <div>
                    <input
                      type="text"
                      placeholder="ID del producto"
                      value={productoId}
                      onChange={(e) => setProductoId(e.target.value)}
                    />

                    <input name="Nombre" placeholder="Nombre" value={form.Nombre} onChange={actualizarForm} />
                    <input name="Descripcion" placeholder="Descripción" value={form.Descripcion} onChange={actualizarForm} />
                    <input name="Precio" type="number" placeholder="Precio" value={form.Precio} onChange={actualizarForm} />

                    <select name="Categoria" value={form.Categoria} onChange={actualizarForm}>
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.Nombre}
                        </option>
                      ))}
                    </select>

                    <input name="Imagen" placeholder="URL de imagen" value={form.Imagen} onChange={actualizarForm} />
                    <input
                      type="number"
                      placeholder="Stock"
                      name="Stock"
                      value={form.Stock || ""}
                      onChange={actualizarForm}
                    />
                  </div>
                )}

                <br />

                {accion === "crear" && <button onClick={agregarProducto}>Agregar producto</button>}
                {accion === "editar" && <button onClick={editarProducto}>Editar producto</button>}
                {accion === "borrar" && <button onClick={desactivarProducto}>Eliminar producto</button>}
              </div>
            )}
          </div>

          <div className={styles["card"]}>
            {/* ===================================================== */}
            {/* ===================== FACTURAS ======================= */}
            {/* ===================================================== */}

            <h2>Generar Factura</h2>

            <div className={styles["form-section"]}>
              <input
                type="text"
                placeholder="Nombre y apellido"
                onChange={(e) => setFactura({ ...factura, nombre: e.target.value })}
              />

              <input
                type="text"
                placeholder="Dirección"
                onChange={(e) => setFactura({ ...factura, direccion: e.target.value })}
              />

              <input
                type="text"
                placeholder="Método de pago"
                onChange={(e) => setFactura({ ...factura, metodoPago: e.target.value })}
              />

              <input
                type="text"
                placeholder="ID del producto"
                onChange={(e) => setFactura({ ...factura, productoId: e.target.value })}
              />

              <input
                type="number"
                placeholder="Monto"
                onChange={(e) => setFactura({ ...factura, monto: e.target.value })}
              />

              <br />
              <button onClick={crearFactura}>Generar Factura</button>
            </div>
          </div>

          <div className={styles["card"]}>
            {/* ======================= LOGS ========================= */}

            <h2>Logs del sistema</h2>
            <div className={styles["logs-container"]}>
              {logs.length === 0 ? (
                <p>No hay logs disponibles...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={styles["log-item"]}>
                    <div className={styles["log-accion"]}>
                      {log.Accion}
                    </div>
                    {log.Producto && (
                      <div className={styles["log-producto"]}>
                        {log.Producto}
                      </div>
                    )}
                    <div className={styles["log-footer"]}>
                      <span className={styles["log-fecha"]}>
                        {new Date(log.Fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <strong className={styles["log-usuario"]}>{log.Usuario}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className={styles["pagination"]}>
              <button
                onClick={() => cargarLogs(pagina - 1)}
                disabled={pagina <= 1}
              >
                ◀ Anterior
              </button>

              <span>
                Página {pagina} de {totalPaginas}
              </span>

              <button
                onClick={() => cargarLogs(pagina + 1)}
                disabled={pagina >= totalPaginas}
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPanel;
