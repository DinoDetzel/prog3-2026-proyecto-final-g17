import api from './api';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const register = async (nombre, email, password) => {
  const { data } = await api.post('/auth/register', { nombre, email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const getPerfil = async () => {
  const { data } = await api.get('/auth/perfil');
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getUsuarioLocal = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const estaLogueado = () => {
  return !!localStorage.getItem('token');
};
