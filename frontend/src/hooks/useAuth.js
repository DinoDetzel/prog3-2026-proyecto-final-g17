import { useState, useEffect } from 'react';
import authService from '../services/authService';

const useAuth = () => {
  const [user, setUser] = useState(authService.getUser());
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());

  useEffect(() => {
    const actualizarEstado = () => {
      setUser(authService.getUser());
      setIsLoggedIn(authService.isLoggedIn());
    };

    window.addEventListener('storage', actualizarEstado);
    return () => window.removeEventListener('storage', actualizarEstado);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setIsLoggedIn(true);
    return data;
  };

  const register = async (nombre, email, password) => {
    const data = await authService.register(nombre, email, password);
    setUser(data.user);
    setIsLoggedIn(true);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  return { user, isLoggedIn, login, register, logout };
};

export default useAuth;