import { useState, useEffect, useContext } from "react";
import styles from "./Mainpage.module.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context2/AuthContext";

function Mainpage() {
  const [categoria, setCategoria] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 10;
  const navigate = useNavigate();
  const { usuario, logout } = useContext(AuthContext);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const resProd = await fetch("http://localhost:4000/productos");
        const resCat = await fetch("http://localhost:4000/categorias");

        const productosData = await resProd.json();
        const categoriasData = await resCat.json();

        // Filtrar solo categorías activas
        const categoriasActivas = categoriasData.filter((c) => c.Activo === true);

        // Crear diccionario de categorías por ID
        const mapCat = {};
        categoriasActivas.forEach((c) => {
          mapCat[c._id] = c.Nombre;
        });

        // Reemplazar ID por nombre real
        const productosFinal = productosData.map((p) => ({
          ...p,
          CategoriaNombre: mapCat[p.Categoria] || "Sin categoría",
        }));

        setProductos(productosFinal);
        setCategorias(categoriasActivas);
        setLoading(false);
        setPaginaActual(1); // Resetear paginación al cargar
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoading(false);
      }
    }

    cargarDatos();
  }, []);

  // FILTROS
  const filtrados = productos.filter((p) => {
    const coincideCat =
      categoria === "todas" ||
      p.CategoriaNombre?.toLowerCase() === categoria.toLowerCase();

    const coincideBusq =
      p.Nombre?.toLowerCase().includes(busqueda.toLowerCase());

    return coincideCat && coincideBusq && p.Activo === true;
  });

  // PAGINACIÓN
  const totalPaginas = Math.ceil(filtrados.length / productosPorPagina);
  const indiceInicio = (paginaActual - 1) * productosPorPagina;
  const indiceFin = indiceInicio + productosPorPagina;
  const productosPaginados = filtrados.slice(indiceInicio, indiceFin);

  // Función para actualizar stock
  const actualizarStock = async (id, cambio) => {
    try {
      setProductos(prev => {
        return prev.map(p => {
          if (p._id === id) {
            const nuevoStock = (p.Stock || 0) + cambio;
            if (nuevoStock < 0) return p; // evitar negativos
            // Actualizar backend
            fetch(`http://localhost:4000/productos/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ Stock: nuevoStock })
            }).catch(err => console.error(err));

            return { ...p, Stock: nuevoStock };
          }
          return p;
        });
      });
    } catch (error) {
      console.error("Error al actualizar stock:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* NAVBAR */}
      <header className={styles["ml-header"]}>
        <img src=".\public\96919ec3-2b35-4e8c-b4cb-ab67f08d736d.jpg" alt="s" style={{ width: "140px", height: "auto" }} />
        <input
          className={styles["ml-search"]}
          placeholder="Buscar productos, marcas..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
        />

        <nav className={styles["ml-nav"]}>
          <span style={{ color: "#333", fontWeight: "bold", marginRight: "20px" }}>
            {usuario?.Nombre}
          </span>

          <button
            onClick={() => navigate("/admin")}
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
            Admin Panel
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

      {/* FILTROS */}
      <div className={styles["ml-filtros"]}>
        <label>Categorías: </label>
        <select 
          value={categoria} 
          onChange={(e) => {
            setCategoria(e.target.value);
            setPaginaActual(1); // Resetear a página 1 al cambiar categoría
          }}
        >
          <option value="todas">Todas</option>
          {categorias.map((c) => (
            <option key={c._id} value={c.Nombre.toLowerCase()}>
              {c.Nombre}
            </option>
          ))}
        </select>
      </div>

      {/* LOADING */}
      {loading && <p style={{ textAlign: "center" }}>Cargando productos...</p>}

      {/* PRODUCTOS */}
      <div className={styles["ml-grid"]}>
        {!loading && filtrados.length === 0 ? (
          <p>No hay productos con esos filtros.</p>
        ) : (
          productosPaginados.map((p) => (
            <div key={p._id} className={styles["ml-card"]}>
              <img
                src={p.Imagen || "https://via.placeholder.com/250"}
                alt={p.Nombre}
              />

              {/* CONTADOR DE STOCK */}
              <div className={styles["ml-card-stock"]}>
                <div className={styles["ml-card-stock-buttons"]}>
                  <button onClick={() => actualizarStock(p._id, -1)}>-</button>
                  <input type="number" value={p.Stock || 0} readOnly />
                  <button onClick={() => actualizarStock(p._id, 1)}>+</button>
                </div>

                {/* Botón Editar */}
                <button
                  onClick={() => navigate(`/admin/${p._id}`)}
                  style={{
                    background: "#008332",
                    color: "#fff",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "5px"
                  }}
                >
                  Editar
                </button>
              </div>

              {/* INFO DEL PRODUCTO */}
              <div className={styles["ml-card-info"]}>
                <h3>{p.Nombre}</h3>
                <p>{p.Descripcion}</p>
                <span className={styles["ml-category"]}>{p.CategoriaNombre}</span>
                <p>Stock: {p.Stock}</p>
                <span className={styles["ml-price"]}>${p.Precio}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINACIÓN */}
      {!loading && filtrados.length > 0 && (
        <div className={styles["ml-pagination"]}>
          <button 
            onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
          >
            ◀ Anterior
          </button>

          <span>
            Página {paginaActual} de {totalPaginas}
          </span>

          <button 
            onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </>
  );
}

export default Mainpage;
