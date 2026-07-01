import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/" style={styles.brandLink}>Inventario App</Link>
      </div>
      <div style={styles.links}>
        {isLoggedIn ? (
          <>
            <Link to="/perfil" style={styles.link}>Perfil</Link>
            <span style={styles.user}>Hola, {user?.nombre}</span>
            <button onClick={handleLogout} style={styles.button}>Cerrar sesion</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: '#1a1a2e', color: 'white' },
  brand: { fontSize: '20px', fontWeight: 'bold' },
  brandLink: { color: 'white', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: 'white', textDecoration: 'none', fontSize: '14px' },
  user: { color: '#aaa', fontSize: '14px' },
  button: { padding: '6px 14px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }
};

export default Navbar;