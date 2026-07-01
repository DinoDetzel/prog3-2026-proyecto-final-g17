import api from './api';

export const getProductos = async () => {
  const { data } = await api.get('/productos');
  return data;
};

export const getCategorias = async () => {
  const { data } = await api.get('/categorias');
  return data;
};