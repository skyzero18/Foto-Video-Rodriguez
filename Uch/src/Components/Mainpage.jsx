import { useState, useEffect } from "react";
import styles from "./Mainpage.module.css";
import { useNavigate } from "react-router-dom";

function Mainpage() {
  const [categoria, setCategoria] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
              method: "PUT",
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

  return (
    <>
      {/* NAVBAR */}
      <header className="ml-header">
      
        <img src=".\public\96919ec3-2b35-4e8c-b4cb-ab67f08d736d.jpg" alt="s"  style={{ width: "140px", height: "auto" }} />
        <input
          className="ml-search"
          placeholder="Buscar productos, marcas..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <nav className="ml-nav">
          <button
            onClick={() => navigate("/admin")}
            style={{
              background: "#fff",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Admin Panel
          </button>
        </nav>
      </header>

      {/* FILTROS */}
      <div className="ml-filtros">
        <label>Categorías: </label>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
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
      <div className="ml-grid">
        {!loading && filtrados.length === 0 ? (
          <p>No hay productos con esos filtros.</p>
        ) : (
          filtrados.map((p) => (
            <div key={p._id} className="ml-card" style={{ position: "relative" }}>
              <img
                src={p.Imagen || "https://via.placeholder.com/250"}
                alt={p.Nombre}
              />

              {/* CONTADOR DE STOCK */}
              <div
                className="ml-card-stock"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "10px"
                }}
              >
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  <button onClick={() => actualizarStock(p._id, -1)}>-</button>
                  <input type="number" value={p.Stock || 0} readOnly />
                  <button onClick={() => actualizarStock(p._id, 1)}>+</button>
                </div>

                {/* Botón Editar justo debajo */}
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
              <div className="ml-card-info">
                <h3>{p.Nombre}</h3>
                <p>{p.Descripcion}</p>
                <span className="ml-category">{p.CategoriaNombre}</span>
                <p>Stock: {p.Stock}</p>
                <span className="ml-price">${p.Precio}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Mainpage;
