import api from "./api";

export const getProductos = async () => {
  const { data } = await api.get("/productos");
  return data;
};

export const getCategorias = async () => {
  const { data } = await api.get("/categorias");
  return data;
};

export const crearProducto = async (producto) => {
  const { data } = await api.post("/productos", producto);
  return data;
};

export const actualizarProducto = async (id, producto) => {
  const { data } = await api.put(`/productos/${id}`, producto);
  return data;
};

export const eliminarProducto = async (id) => {
  const { data } = await api.delete(`/productos/${id}`);
  return data;
};

export const crearCategoria = async (categoria) => {
  const { data } = await api.post("/categorias", categoria);
  return data;
};

export const actualizarCategoria = async (id, categoria) => {
  const { data } = await api.put(`/categorias/${id}`, categoria);
  return data;
};

export const eliminarCategoria = async (id) => {
  const { data } = await api.delete(`/categorias/${id}`);
  return data;
};
