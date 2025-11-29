import { useState } from "react";
import "./Login.css";

function LoginPage() {
  const [form, setForm] = useState({
    Nombre: "",
    Correo: "",
    contraseña: "",
    claveRegistro: "",   // <-- 🔐 CLAVE MAESTRA
  });

  const [loginForm, setLoginForm] = useState({
    Correo: "",
    contraseña: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  // ------------------------------
  // REGISTRAR
  // ------------------------------
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

  // ------------------------------
  // LOGIN
  // ------------------------------
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
    <div className="login-container">

      <h1>Panel de Registro</h1>

      {/* REGISTRO */}
      <div className="form-box">
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

        {/* 🔐 NUEVO CAMPO: CLAVE MAESTRA */}
        <input
          type="password"
          placeholder="Clave de registro"
          name="claveRegistro"
          value={form.claveRegistro}
          onChange={handleChange}
        />

        <button onClick={registrar}>Registrarse</button>
      </div>

      <hr />

      {/* LOGIN */}
      <div className="form-box">
        <h2>Login</h2>

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
      </div>
    </div>
  );
}

export default LoginPage;
