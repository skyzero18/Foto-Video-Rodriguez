import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import styles from "./AdminPage.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context2/AuthContext";

function AdminPanel() {
   
  const [accion, setAccion] = useState("crear");
  const [entidad, setEntidad] = useState("producto");
  const { id } = useParams();
  const location = useLocation();
  const { logout, usuario } = useContext(AuthContext);
  const [form, setForm] = useState({
    Nombre: "",
    Descripcion: "",
    Precio: "",
    Categoria: "",
    Imagen: "",
    Stock: 0
  });

  // nombre usado al crear/editar categorías en el panel
  const [nuevoNombreCategoria, setNuevoNombreCategoria] = useState("");
  
  // actualizar campo del form garantizando valores definidos
  const actualizarForm = (e) => {
    const name = e.target.name;
    let value = e.target.value;
    if (name === "Stock") {
      // si borran el input dejamos "" -> significa "no cambiar" en edición parcial
      value = value === "" ? "" : Number(value);
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // enviar log al backend con el nombre de usuario (data.usuario.Nombre)
  const crearLog = async ({ Accion = "", Producto = "" }) => {
    try {
      const nombreUsuario =
        usuario?.Nombre ||
        (() => {
          try {
            const raw = localStorage.getItem("usuario");
            return raw ? JSON.parse(raw)?.Nombre : null;
          } catch (e) {
            return null;
          }
        })() ||
        "sin-nombre";

      console.debug("FRONT LOG -> Enviando log:", { Usuario: nombreUsuario, Accion, Producto });

      await fetch("http://localhost:4000/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Accion, Producto, Usuario: nombreUsuario })
      });
    } catch (err) {
      console.error("Error enviando log:", err);
    }
  };

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const navigate = useNavigate();
  const [categoriaId, setCategoriaId] = useState("");
  const [productoId, setProductoId] = useState("");

  const [factura, setFactura] = useState({
    nombre: "",
    direccion: "",
    metodoPago: "",
    productos: [{ productoId: "", cantidad: 1 }],
    monto: ""
  });
  // Estados para los combobox decorativos de filtrado por fecha
  const [filtroDia, setFiltroDia] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [facturasDia, setFacturasDia] = useState([]);
  const [cargandoFacturas, setCargandoFacturas] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // si viene id por params (Main -> Admin) pre-seleccionar para editar y cargar datos
  const [originalProduct, setOriginalProduct] = useState(null);

  useEffect(() => {
    if (!id) return;
    const stateProduct = location.state?.producto || location.state?.product || null;
    const applyProduct = (prod) => {
      if (!prod) return;
      // Normalizar categoria: puede venir como objeto o id
      let categoriaVal = "";
      if (prod.Categoria) {
        categoriaVal = typeof prod.Categoria === "object" ? (prod.Categoria._id || prod.Categoria.id || "") : String(prod.Categoria);
      } else if (prod.categoria) {
        categoriaVal = typeof prod.categoria === "object" ? (prod.categoria._id || prod.categoria.id || "") : String(prod.categoria);
      } else if (prod.categoriaId) {
        categoriaVal = String(prod.categoriaId);
      }
      // Normalizar stock a número (si no viene, usar 0)
      const stockVal = (typeof prod.Stock !== "undefined" ? prod.Stock : (typeof prod.stock !== "undefined" ? prod.stock : 0));
      setOriginalProduct(prod);
      setForm({
        Nombre: prod.Nombre ?? prod.nombre ?? "",
        Descripcion: prod.Descripcion ?? prod.descripcion ?? "",
        Precio: prod.Precio ?? prod.precio ?? "",
        Categoria: categoriaVal ?? "",
        Imagen: prod.Imagen ?? prod.imagen ?? "",
        Stock: Number(isNaN(Number(stockVal)) ? 0 : Number(stockVal))
      });
      setProductoId(id);
      setAccion("editar");
      setEntidad("producto");
    };

    if (stateProduct) {
      applyProduct(stateProduct);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`http://localhost:4000/productos/${id}`);
        const p = await res.json();
        const prod = p.producto ?? p;
        applyProduct(prod);
      } catch (e) {
        console.error("Error cargando producto para editar:", e);
      }
    })();
  }, [id, location.state]);

  // Agregar producto a la factura
  const agregarProductoFactura = () => {
    setFactura({
      ...factura,
      productos: [...factura.productos, { productoId: "", cantidad: 1 }]
    });
  };

  // Eliminar producto de la factura
  const eliminarProductoFactura = (index) => {
    const nuevosProductos = factura.productos.filter((_, i) => i !== index);
    setFactura({ ...factura, productos: nuevosProductos });
  };

  // Actualizar producto específico
  const actualizarProductoFactura = (index, campo, valor) => {
    const nuevosProductos = [...factura.productos];
    nuevosProductos[index][campo] = valor;
    setFactura({ ...factura, productos: nuevosProductos });
  };

  const crearFactura = async () => {
    try {
      const facturaData = {
        "Nombre y apellido": factura.nombre,
        "Direccion": factura.direccion,
        "Metodo de pago": factura.metodoPago,
        productos: factura.productos
      };

      const resp = await fetch("http://localhost:4000/facturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(facturaData),
      });

      const data = await resp.json();

      if (!resp.ok || !data.ok) {
        if (data?.faltantes?.length) {
          const detalle = data.faltantes
            .map(f => `- ${f.nombre || f.productoId}: solicitado ${f.solicitado ?? "?"}, disponible ${f.disponible ?? "0"}${f.motivo ? ` (${f.motivo})` : ""}`)
            .join("\n");
          alert(`No se puede completar la compra por stock insuficiente:\n${detalle}`);
        } else {
          alert(data?.error || "Error al crear la factura");
        }
        return;
      }

      alert("Factura creada correctamente");
      // Opcional: limpiar formulario
      // setFactura({ nombre:"", direccion:"", metodoPago:"", productos:[{ productoId:"", cantidad:1 }], monto:"" });
    } catch (e) {
      console.error(e);
      alert("Error de red al crear la factura");
    }
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
            Imagen: producto.Imagen,
            Stock: producto.Stock ?? 0 
          });
        }
      }
    });
    cargarLogs(1);
  }, []);

    // ============================================================
    // ==================== PRODUCTOS =============================
    // ============================================================

    const agregarProducto = async () => {
      try {
        const payload = {
          Nombre: form.Nombre,
          Descripcion: form.Descripcion,
          Precio: form.Precio,
          Categoria: form.Categoria,
          Imagen: form.Imagen,
          Stock: Number(form.Stock || 0),
          usuarios: usuario?._id ?? null
        };
        console.debug("FRONT DEBUG - AGREGAR PRODUCTO payload:", payload);
        const res = await fetch("http://localhost:4000/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        alert("Producto creado");
        cargarProductos();
        crearLog({ Accion: "Crear producto", Producto: form.Nombre });
      } catch (err) {
        console.error("Error agregarProducto:", err);
        alert("Error de red al crear producto");
      }
    };
 
    const editarProducto = async () => {
      if (!productoId) return alert("Seleccione un producto");
 
     try {
      const payload = {
        Nombre: form.Nombre,
        Descripcion: form.Descripcion,
        Precio: form.Precio,
        Categoria: form.Categoria,
        Imagen: form.Imagen,
        Stock: Number(form.Stock || 0),
        usuarios: usuario?._id ?? null
      };
      console.debug("FRONT DEBUG - EDITAR PRODUCTO payload:", payload);
      const res = await fetch(`http://localhost:4000/productos/${productoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await res.json().catch(() => ({}));
      alert("Producto editado");
      cargarProductos();
      crearLog({ Accion: "Editar producto", Producto: productoId || form.Nombre });
    } catch (err) {
      console.error("Error editarProducto:", err);
      alert("Error de red al editar producto");
    }
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

  // Cargar facturas del día seleccionado
  async function cargarFacturasDia(dia, mes, ano) {
    try {
      setCargandoFacturas(true);
      setFacturasDia([]);
      const params = new URLSearchParams({ dia: String(dia), mes: String(mes), ano: String(ano) });
      const resp = await fetch(`http://localhost:4000/facturas/filtrar?${params.toString()}`);
      const data = await resp.json();
      if (data.ok) {
        setFacturasDia(data.facturas || []);
      } else {
        setFacturasDia([]);
      }
    } catch (err) {
      console.error("Error cargando facturas del día:", err);
      setFacturasDia([]);
    } finally {
      setCargandoFacturas(false);
    }
  }

  // Cargar detalles de factura seleccionada
  const cargarDetallesFactura = async (facturaId) => {
    if (!facturaId) return;
    try {
      const resp = await fetch(`http://localhost:4000/facturas/${facturaId}`);
      const data = await resp.json();
      if (data.ok) {
        setFacturaSeleccionada(data.factura);
        setMostrarModal(true);
      }
    } catch (err) {
      console.error("Error cargando factura:", err);
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    setMostrarModal(false);
    setFacturaSeleccionada(null);
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
                {accion === "crear" && (
                  <div>
                    <input name="Nombre" placeholder="Nombre" value={form.Nombre ?? ""} onChange={actualizarForm} />
                    <input name="Descripcion" placeholder="Descripción" value={form.Descripcion ?? ""} onChange={actualizarForm} />
                    <input name="Precio" type="number" placeholder="Precio" value={form.Precio ?? ""} onChange={actualizarForm} />

                    <select name="Categoria" value={form.Categoria ?? ""} onChange={actualizarForm}>
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.Nombre}
                        </option>
                      ))}
                    </select>

                    <input name="Imagen" placeholder="URL de imagen" value={form.Imagen ?? ""} onChange={actualizarForm} />
                    <input
                      type="number"
                      placeholder="Stock"
                      name="Stock"
                      value={typeof form.Stock === "number" ? form.Stock : (form.Stock ?? "")}
                      onChange={actualizarForm}
                    />
                  </div>
                )}

                {accion === "editar" && (
                  <div>
                    <label>ID del producto a editar</label>
                    <input
                      type="text"
                      placeholder="ID del producto"
                      value={productoId}
                      onChange={(e) => setProductoId(e.target.value)}
                    />

                    <input name="Nombre" placeholder="Nombre" value={form.Nombre ?? ""} onChange={actualizarForm} />
                    <input name="Descripcion" placeholder="Descripción" value={form.Descripcion ?? ""} onChange={actualizarForm} />
                    <input name="Precio" type="number" placeholder="Precio" value={form.Precio ?? ""} onChange={actualizarForm} />

                    <select name="Categoria" value={form.Categoria ?? ""} onChange={actualizarForm}>
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat._id} value={cat._id}>

                          {cat.Nombre}
                        </option>
                      ))}
                    </select>

                    <input name="Imagen" placeholder="URL de imagen" value={form.Imagen ?? ""} onChange={actualizarForm} />
                    <input
                      type="number"
                      placeholder="Stock"
                      name="Stock"
                      value={typeof form.Stock === "number" ? form.Stock : (form.Stock ?? "")}
                      onChange={actualizarForm}
                    />
                  </div>
                )}

                {accion === "borrar" && (
                  <div>
                    <label>ID del producto a desactivar</label>
                    <input
                      type="text"
                      placeholder="ID del producto"
                      value={productoId}
                      onChange={(e) => setProductoId(e.target.value)}
                    />
                  </div>
                )}
                 <br />

                {accion === "crear" && <button onClick={agregarProducto}>Agregar producto</button>}
                {accion === "editar" && <button onClick={editarProducto}>Editar producto</button>}
                {accion === "borrar" && <button onClick={desactivarProducto}>Desactivar producto</button>}
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

              <h3 style={{ margin: "10px 0" }}>Productos</h3>
              {factura.productos.map((prod, index) => (
                <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="ID del producto"
                    value={prod.productoId}
                    onChange={(e) => actualizarProductoFactura(index, "productoId", e.target.value)}
                    style={{ flex: 2 }}
                  />
                  
                  <input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    value={prod.cantidad}
                    onChange={(e) => actualizarProductoFactura(index, "cantidad", parseInt(e.target.value) || 1)}
                    style={{ flex: 1, width: "80px" }}
                  />
                  
                  {factura.productos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarProductoFactura(index)}
                      aria-label={`Eliminar producto ${index + 1}`}
                      style={{
                        background: "#d32f2f",
                        color: "white",
                        border: "none",
                        padding: "0",            // eliminar padding grande
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",       // tamaño de fuente más pequeño
                        lineHeight: 1,
                        width: "28px",          // ancho fijo pequeño
                        height: "28px",         // alto fijo pequeño
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={agregarProductoFactura}
                style={{ marginTop: "8px", marginBottom: "12px", background: "#4CAF50", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}
              >
                + Agregar Producto
              </button>
               
               <br />
               <button onClick={crearFactura}>Generar Factura</button>
            </div>

            {/* Nuevo div decorativo: filtrado por fecha (día / mes / año) */}
            <div style={{ borderTop: "1px solid #eee", marginTop: 12, paddingTop: 12 }}>
              <h3 style={{ margin: "6px 0" }}>Filtrar facturas por fecha</h3>

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                {/* Día */}
                <select
                  value={filtroDia}
                  onChange={async (e) => {
                    const v = e.target.value; setFiltroDia(v);
                    if (v && filtroMes && filtroAno) {
                      await cargarFacturasDia(v, filtroMes, filtroAno);
                    } else {
                      setFacturasDia([]);
                    }
                  }}
                >
                  <option value="">Día</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Mes */}
                <select
                  value={filtroMes}
                  onChange={async (e) => {
                    const v = e.target.value; setFiltroMes(v);
                    if (filtroDia && v && filtroAno) {
                      await cargarFacturasDia(filtroDia, v, filtroAno);
                    } else {
                      setFacturasDia([]);
                    }
                  }}
                >
                  <option value="">Mes</option>
                  {["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
                    .map((m, idx) => <option key={idx} value={idx+1}>{m}</option>)}
                </select>

                {/* Año */}
                <select
                  value={filtroAno}
                  onChange={async (e) => {
                    const v = e.target.value; setFiltroAno(v);
                    if (filtroDia && filtroMes && v) {
                      await cargarFacturasDia(filtroDia, filtroMes, v);
                    } else {
                      setFacturasDia([]);
                    }
                  }}
                >
                  <option value="">Año</option>
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)
                    .map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Cuarto combobox: facturas del día */}
              <div>
                <select 
                  style={{ display: (filtroDia && filtroMes && filtroAno) ? "block" : "none", width: "100%" }}
                  onChange={(e) => cargarDetallesFactura(e.target.value)}
                >
                  <option value="">
                    {cargandoFacturas ? "Cargando..." : "Facturas del día"}
                  </option>
                  {facturasDia.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.Numero ? f.Numero : `${new Date(f.fecha).toLocaleTimeString()} - ${f.Producto || f["Producto"] || "Factura"}`}
                    </option>
                  ))}
                  {!cargandoFacturas && facturasDia.length === 0 && filtroDia && filtroMes && filtroAno && (
                    <option value="" disabled>Sin facturas para esa fecha</option>
                  )}
                </select>
              </div>
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
)              }
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

      {/* Modal para mostrar detalles de factura */}
      {mostrarModal && facturaSeleccionada && (
        <div className={styles["modal-overlay"]} onClick={cerrarModal}>
          <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>
            <button className={styles["modal-close"]} onClick={cerrarModal}>×</button>
            
            <h2 className={styles["modal-title"]}>📄 Detalle de Factura</h2>
            
            <div className={styles["factura-details"]}>
              <div className={styles["detail-row"]}>
                <span className={styles["detail-label"]}>Fecha:</span>
                <span className={styles["detail-value"]}>
                  {new Date(facturaSeleccionada.fecha).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className={styles["detail-row"]}>
                <span className={styles["detail-label"]}>Cliente:</span>
                <span className={styles["detail-value"]}>{facturaSeleccionada["Nombre y apellido"]}</span>
              </div>

              <div className={styles["detail-row"]}>
                <span className={styles["detail-label"]}>Dirección:</span>
                <span className={styles["detail-value"]}>{facturaSeleccionada.Direccion}</span>
              </div>

              <div className={styles["detail-row"]}>
                <span className={styles["detail-label"]}>Productos:</span>
              </div>
              
              {facturaSeleccionada.productos && facturaSeleccionada.productos.map((prod, idx) => (
                <div key={idx} className={styles["producto-item"]}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                    <span>{prod.nombre} x {prod.cantidad}</span>
                    <span>${prod.subtotal}</span>
                  </div>
                </div>
              ))}

              <div className={styles["detail-row"]}>
                <span className={styles["detail-label"]}>Método de pago:</span>
                <span className={styles["detail-value"]}>{facturaSeleccionada["Metodo de pago"]}</span>
              </div>

              <div className={styles["detail-row-total"]}>
                <span className={styles["detail-label"]}>Total:</span>
                <span className={styles["detail-value-total"]}>${facturaSeleccionada.Monto}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPanel;
