import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { getPerfil, logout } from '../services/auth';

export default function PerfilPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getPerfil();
        setPerfil(data.user);
      } catch (err) {
        setError('No se pudo cargar el perfil.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="perfil-page">
      <Navbar />
      <main className="perfil-main">
        <h2 className="perfil-titulo">Mi Perfil</h2>

        {cargando && <div className="estado-mensaje">Cargando...</div>}
        {error && <div className="estado-error">{error}</div>}

        {perfil && (
          <div className="perfil-card">
            <div className="perfil-avatar">
              {perfil.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="perfil-info">
              <div className="perfil-fila">
                <span className="perfil-label">Nombre</span>
                <span className="perfil-valor">{perfil.nombre}</span>
              </div>
              <div className="perfil-fila">
                <span className="perfil-label">Email</span>
                <span className="perfil-valor">{perfil.email}</span>
              </div>
              <div className="perfil-fila">
                <span className="perfil-label">Miembro desde</span>
                <span className="perfil-valor">
                  {new Date(perfil.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="perfil-logout">
              Cerrar sesión
            </button>
          </div>
        )}
      </main>
    </div>
  );
}