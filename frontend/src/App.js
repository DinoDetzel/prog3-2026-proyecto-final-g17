import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { estaLogueado } from "./services/auth";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import PerfilPage from "./pages/PerfilPage";
import "./App.css";

// Ruta protegida: si no está logueado, redirige al login
function RutaProtegida({ children }) {
  return estaLogueado() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RutaProtegida>
              <HomePage />
            </RutaProtegida>
          }
        />
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <PerfilPage />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
