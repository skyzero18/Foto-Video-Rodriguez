import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await axios.post("http://localhost:4000/auth/login", {
      correo: correo,           // CAMBIADO
      contraseña: contraseña    // CAMBIADO
    });
    localStorage.setItem("token", res.data.token);
    alert("Login correcto!");
  };

  const register = async () => {
    await axios.post("http://localhost:4000/auth/register", {
      nombre: "usuarioNuevo",  // si tu backend lo pide
      correo: correo,           // CAMBIADO
      contraseña: contraseña,    // CAMBIADO
      rol: "alumno" 
    });
    alert("Usuario registrado");
  };

  return (
    <div style={{ width: "300px", margin: "auto" }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Contraseña"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>Ingresar</button>
      <button onClick={register}>Registrar</button>
    </div>
  );
}
