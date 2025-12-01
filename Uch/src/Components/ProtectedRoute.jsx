import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context2/AuthContext";

export function ProtectedRoute({ children }) {
  const { usuario, autenticacionRequerida } = useContext(AuthContext);

  // Si autenticación está desactivada, permite acceso a todo
  if (!autenticacionRequerida) {
    return children;
  }

  // Si autenticación está activada y no hay usuario, redirige a login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}