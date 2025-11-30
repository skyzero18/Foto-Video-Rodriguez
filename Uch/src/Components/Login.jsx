import { useState } from "react";
import styles from "./Login.module.css";

function LoginPage() {

  const [mostrarRegistro, setMostrarRegistro] = useState(false);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const registrar = async () => {
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

      alert("Usuario registrado correctamente");
    } catch (error) {
      alert("Error al registrar usuario");
    }
  };

  const login = async () => {
    try {
      const res = await fetch("http://localhost:4000/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensaje || "Error al iniciar sesión");
        return;
      }

      alert("Login exitoso. Bienvenido " + data.usuario.Nombre);

      localStorage.setItem("usuario", JSON.stringify(data.usuario));
    } catch (error) {
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
