import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';

const Perfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await authService.perfil();
        setPerfil(data.user);
      } catch (err) {
        setError('Sesion expirada, inicia sesion nuevamente');
        setTimeout(() => navigate('/login'), 2000);
      }
    };
    cargarPerfil();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (error) return <div style={styles.container}><p style={styles.error}>{error}</p></div>;
  if (!perfil) return <div style={styles.container}><p>Cargando...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Mi Perfil</h2>
        <div style={styles.field}>
          <span style={styles.label}>Nombre</span>
          <span>{perfil.nombre}</span>
        </div>
        <div style={styles.field}>
          <span style={styles.label}>Email</span>
          <span>{perfil.email}</span>
        </div>
        <div style={styles.field}>
          <span style={styles.label}>Miembro desde</span>
          <span>{new Date(perfil.createdAt).toLocaleDateString()}</span>
        </div>
        <button onClick={handleLogout} style={styles.button}>Cerrar sesion</button>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', width: '360px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '24px' },
  field: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' },
  label: { fontWeight: 'bold', color: '#555' },
  button: { width: '100%', padding: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '24px' },
  error: { color: 'red' }
};

export default Perfil;