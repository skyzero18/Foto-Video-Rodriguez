import { useState } from "react";

function LoginPage() {
  const [form, setForm] = useState({
    Nombre: "",
    Correo: "",
    contraseña: "",
  });

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const registrar = async () => {
    try {
      const res = await fetch("http://localhost:4000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
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

  return (
    <div className="login-container">

      <h1>Panel de Registro</h1>

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

        <button onClick={registrar}>Registrarse</button>
      </div>

      <hr />

      <div className="form-box">
        <h2>Login (No funcional aún)</h2>
        <input type="email" placeholder="Correo" disabled />
        <input type="password" placeholder="Contraseña" disabled />
        <button disabled>Iniciar Sesión</button>
      </div>

    </div>
  );
}

export default LoginPage;
