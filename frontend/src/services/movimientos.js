import api from "./api";

export const getMovimientos = async () => {
  const { data } = await api.get("/movimientos");
  return data;
};

export const crearMovimiento = async (movimiento) => {
  const { data } = await api.post("/movimientos", movimiento);
  return data;
};

export const actualizarMovimiento = async (id, movimiento) => {
  const { data } = await api.put(`/movimientos/${id}`, movimiento);
  return data;
};

export const eliminarMovimiento = async (id) => {
  const { data } = await api.delete(`/movimientos/${id}`);
  return data;
};
