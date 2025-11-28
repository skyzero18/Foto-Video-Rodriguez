import { useState, useEffect } from "react";
import "./mainpage.css";
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
          mapCat[c._id] = c.Nombre; // guardar NOMBRE según ID
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

  return (
    <>
      {/* NAVBAR */}
      <header className="ml-header">
        <div className="ml-logo">TuTiendita</div>

        <input
          className="ml-search"
          placeholder="Buscar productos, marcas..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <nav className="ml-nav">
          <span>Categorías</span>
          <span>Ofertas</span>
          <span>Moda</span>
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
            <div key={p._id} className="ml-card">
              <img
                src={p.Imagen || "https://via.placeholder.com/250"}
                alt={p.Nombre}
              />

              <div className="ml-card-info">
                <h3>{p.Nombre}</h3>
                <span className="ml-price">$ {p.Precio}</span>

                <span className="ml-category">
                  {p.CategoriaNombre}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Mainpage;
