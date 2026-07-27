import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth';

const authService = {
  register: async (nombre, email, password) => {
    const response = await axios.post(`${API_URL}/register`, { nombre, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  perfil: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getToken: () => localStorage.getItem('token'),

  getUser: () => JSON.parse(localStorage.getItem('user')),

  isLoggedIn: () => !!localStorage.getItem('token')
};

export default authService;