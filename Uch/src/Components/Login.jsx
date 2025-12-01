import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { AuthContext } from "../context2/AuthContext";

function LoginPage() {
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const navigate = useNavigate();
  const { usuario, setUsuario } = useContext(AuthContext);

  const [form, setForm] = useState({
    Nombre: "",
    Correo: "",
    contraseña: "",
    claveRegistro: "",
  });

  const [loginForm, setLoginForm] = useState({
    Correo: "",
    contraseña: "",
  });

  // Si ya está logueado, redirige a main
  useEffect(() => {
    if (usuario) {
      navigate("/main", { replace: true });
    }
  }, [usuario, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const registrar = async () => {
    if (!form.Nombre || !form.Correo || !form.contraseña || !form.claveRegistro) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensaje || "Error al registrar");
        return;
      }

      alert("Usuario registrado correctamente. Inicia sesión");
      setMostrarRegistro(false);
      setForm({ Nombre: "", Correo: "", contraseña: "", claveRegistro: "" });
    } catch (error) {
      console.error(error);
      alert("Error al registrar usuario");
    }
  };

  const login = async () => {
    if (!loginForm.Correo || !loginForm.contraseña) {
      alert("Completa correo y contraseña");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensaje || "Credenciales incorrectas");
        return;
      }

      alert("¡Bienvenido " + data.usuario.Nombre + "!");

      // Guardar usuario en localStorage y Context
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      setUsuario(data.usuario);

      // Redirigir a main (el useEffect se encargará)
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <>
      <header className={styles["ml-header"]}>
        <img
          src="/96919ec3-2b35-4e8c-b4cb-ab67f08d736d.jpg"
          alt="Logo"
          style={{ width: "140px", height: "auto" }}
        />
      </header>

      <div className={styles["split-container"]}>
        {/* LADO IZQUIERDO: IMAGEN */}
        <div className={styles["split-left"]}>
          <img src="\public\8f296590-bd11-40f8-bd9c-4aac9be1dce9.jpg" alt="Fondo" />
        </div>

        {/* LADO DERECHO: LOGIN / REGISTRO */}
        <div className={styles["split-right"]}>

          {!mostrarRegistro && (
            <div className={styles["form-box"]}>
              <h2>Inicia Sesión</h2>

              <input
                type="email"
                placeholder="Correo"
                name="Correo"
                value={loginForm.Correo}
                onChange={handleLoginChange}
              />

              <input
                type="password"
                placeholder="Contraseña"
                name="contraseña"
                value={loginForm.contraseña}
                onChange={handleLoginChange}
              />

              <button onClick={login}>Iniciar Sesión</button>

              <p className={styles["link-msg"]}>
                ¿No tienes cuenta?
                <span onClick={() => setMostrarRegistro(true)}>Registrarte</span>
              </p>
            </div>
          )}

          {mostrarRegistro && (
            <div className={styles["form-box"]}>
              <h2>Crear Cuenta</h2>

              <input
                type="text"
                placeholder="Nombre"
                name="Nombre"
                value={form.Nombre}
                onChange={handleChange}
              />

              <input
                type="email"
                placeholder="Correo"
                name="Correo"
                value={form.Correo}
                onChange={handleChange}
              />

              <input
                type="password"
                placeholder="Contraseña"
                name="contraseña"
                value={form.contraseña}
                onChange={handleChange}
              />

              <input
                type="password"
                placeholder="Clave de registro"
                name="claveRegistro"
                value={form.claveRegistro}
                onChange={handleChange}
              />

              <button onClick={registrar}>Registrarse</button>

              <p className={styles["link-msg"]}>
                ¿Ya tienes cuenta?
                <span onClick={() => setMostrarRegistro(false)}>Iniciar sesión</span>
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default LoginPage;
