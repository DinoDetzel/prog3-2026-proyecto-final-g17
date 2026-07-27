import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, getUsuarioLocal } from "../../services/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUsuarioLocal();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🏪 Panel Vendedor
      </Link>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">
          Productos
        </Link>
        <Link to="/perfil" className="navbar-link">
          👤 {user?.nombre || "Perfil"}
        </Link>
        <button onClick={handleLogout} className="navbar-logout">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
