import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // ← BOOLEANO PRIVADO: Cambia aquí solo desde el código
  const autenticacionRequerida = true; // true = requiere login | false = sin login

  useEffect(() => {
    // Al cargar, verifica si hay usuario en localStorage
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, logout, autenticacionRequerida }}>
      {children}
    </AuthContext.Provider>
  );
}
