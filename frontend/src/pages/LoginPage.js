import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState('login');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      if (modo === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.nombre, form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error, intentá de nuevo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-titulo">🏪 Panel Vendedor</h1>
        <p className="login-subtitulo">
          {modo === 'login' ? 'Iniciá sesión para continuar' : 'Creá tu cuenta'}
        </p>

        <div className="login-tabs">
          <button
            className={`login-tab ${modo === 'login' ? 'activo' : ''}`}
            onClick={() => setModo('login')}
          >
            Iniciar sesión
          </button>
          <button
            className={`login-tab ${modo === 'register' ? 'activo' : ''}`}
            onClick={() => setModo('register')}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {modo === 'register' && (
            <div className="login-field">
              <label className="login-label">Nombre</label>
              <input
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
                className="login-input"
              />
            </div>
          )}
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="vendedor@ejemplo.com"
              required
              className="login-input"
            />
          </div>
          <div className="login-field">
            <label className="login-label">Contraseña</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••"
              required
              className="login-input"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={cargando} className="login-btn">
            {cargando ? 'Cargando...' : modo === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}