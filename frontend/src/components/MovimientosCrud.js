import React, { useEffect, useMemo, useState } from "react";
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
  getMovimientos,
} from "../services/movimientos";

const formInicial = {
  productoId: "",
  tipo: "ENTRADA",
  cantidad: "",
  notas: "",
};

export default function MovimientosCrud({ productos = [], onDatosActualizados }) {
  const [movimientos, setMovimientos] = useState([]);
  const [formMovimiento, setFormMovimiento] = useState(formInicial);
  const [movimientoEditandoId, setMovimientoEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("");

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const productosDisponibles = useMemo(
    () => productos.filter((producto) => producto.activo !== false),
    [productos],
  );

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((movimiento) => {
      const coincideTipo = !filtroTipo || movimiento.tipo === filtroTipo;
      const coincideProducto =
        !filtroProducto || String(movimiento.productoId) === filtroProducto;
      return coincideTipo && coincideProducto;
    });
  }, [movimientos, filtroTipo, filtroProducto]);

  const cargarMovimientos = async () => {
    setCargando(true);
    try {
      const data = await getMovimientos();
      setMovimientos(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError("No se pudieron cargar los movimientos.");
    } finally {
      setCargando(false);
    }
  };

  const resetForm = () => {
    setFormMovimiento(formInicial);
    setMovimientoEditandoId(null);
  };

  const obtenerMensajeError = (err, fallback) => {
    return err?.response?.data?.error || err?.response?.data?.message || fallback;
  };

  const manejarGuardarMovimiento = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!formMovimiento.productoId) {
      setError("Seleccioná un producto.");
      return;
    }

    if (!formMovimiento.cantidad || Number(formMovimiento.cantidad) <= 0) {
      setError("La cantidad debe ser mayor a cero.");
      return;
    }

    const payload = {
      productoId: Number(formMovimiento.productoId),
      tipo: formMovimiento.tipo,
      cantidad: Number(formMovimiento.cantidad),
      notas: formMovimiento.notas,
    };

    try {
      if (movimientoEditandoId) {
        await actualizarMovimiento(movimientoEditandoId, payload);
        setMensaje("Movimiento actualizado correctamente.");
      } else {
        await crearMovimiento(payload);
        setMensaje("Movimiento creado correctamente.");
      }

      await cargarMovimientos();
      if (onDatosActualizados) await onDatosActualizados();
      resetForm();
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo guardar el movimiento. Revisá el stock disponible.",
        ),
      );
    }
  };

  const manejarEditarMovimiento = (movimiento) => {
    setMovimientoEditandoId(movimiento.id);
    setFormMovimiento({
      productoId: String(movimiento.productoId),
      tipo: movimiento.tipo,
      cantidad: String(movimiento.cantidad),
      notas: movimiento.notas || "",
    });
    setMensaje("");
    setError("");
  };

  const manejarEliminarMovimiento = async (id) => {
    if (!window.confirm("¿Querés eliminar este movimiento?")) return;

    setMensaje("");
    setError("");

    try {
      await eliminarMovimiento(id);
      await cargarMovimientos();
      if (onDatosActualizados) await onDatosActualizados();
      if (movimientoEditandoId === id) resetForm();
      setMensaje("Movimiento eliminado correctamente.");
    } catch (err) {
      setError(
        obtenerMensajeError(
          err,
          "No se pudo eliminar el movimiento porque afectaría el stock.",
        ),
      );
    }
  };

  const cargarEjemplo = (tipo) => {
    const producto =
      tipo === "SALIDA"
        ? productosDisponibles.find((item) => Number(item.stock) > 0)
        : productosDisponibles[0];

    if (!producto) {
      setError("Primero cargá un producto activo para usar ejemplos.");
      return;
    }

    const cantidad =
      tipo === "SALIDA" ? Math.min(Number(producto.stock), 2) || 1 : 10;

    setFormMovimiento({
      productoId: String(producto.id),
      tipo,
      cantidad: String(cantidad),
      notas:
        tipo === "ENTRADA"
          ? "Ejemplo: reposición de proveedor"
          : "Ejemplo: venta mostrador",
    });
    setMovimientoEditandoId(null);
    setMensaje("Ejemplo cargado. Revisá los datos y guardalo.");
    setError("");
  };

  const getNombreProducto = (movimiento) => {
    return movimiento.producto?.nombre || "Producto eliminado";
  };

  const getUsuarioMovimiento = (movimiento) => {
    return movimiento.usuario?.nombre || movimiento.usuario?.email || "Usuario";
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="content-panel">
      <div className="home-header">
        <h2 className="home-titulo">Movimientos</h2>
        <span className="home-contador">
          {movimientosFiltrados.length} de {movimientos.length} movimientos
        </span>
      </div>

      <div className="producto-form-card">
        <div className="movimiento-form-header">
          <h3>{movimientoEditandoId ? "Editar movimiento" : "Nuevo movimiento"}</h3>
          <div className="movimiento-ejemplos">
            <button
              type="button"
              className="categoria-btn"
              onClick={() => cargarEjemplo("ENTRADA")}
            >
              Ejemplo entrada
            </button>
            <button
              type="button"
              className="categoria-btn"
              onClick={() => cargarEjemplo("SALIDA")}
            >
              Ejemplo salida
            </button>
          </div>
        </div>

        <form className="producto-form" onSubmit={manejarGuardarMovimiento}>
          <div className="producto-form-row movimiento-grid">
            <select
              value={formMovimiento.productoId}
              onChange={(e) =>
                setFormMovimiento({
                  ...formMovimiento,
                  productoId: e.target.value,
                })
              }
              className="filtro-select"
              disabled={Boolean(movimientoEditandoId)}
            >
              <option value="">Seleccionar producto</option>
              {productosDisponibles.map((producto) => (
                <option key={producto.id} value={String(producto.id)}>
                  {producto.nombre} - stock {producto.stock}
                </option>
              ))}
            </select>

            <select
              value={formMovimiento.tipo}
              onChange={(e) =>
                setFormMovimiento({ ...formMovimiento, tipo: e.target.value })
              }
              className="filtro-select"
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>

            <input
              type="number"
              min="1"
              className="filtro-input"
              placeholder="Cantidad"
              value={formMovimiento.cantidad}
              onChange={(e) =>
                setFormMovimiento({
                  ...formMovimiento,
                  cantidad: e.target.value,
                })
              }
            />
          </div>

          <textarea
            className="categoria-textarea"
            placeholder="Notas o motivo"
            value={formMovimiento.notas}
            onChange={(e) =>
              setFormMovimiento({ ...formMovimiento, notas: e.target.value })
            }
          />

          <div className="categoria-form-actions">
            <button type="submit" className="categoria-btn principal">
              {movimientoEditandoId ? "Actualizar" : "Crear"}
            </button>
            {movimientoEditandoId && (
              <button type="button" className="categoria-btn" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {mensaje && <div className="estado-ok">{mensaje}</div>}
        {error && <div className="estado-error">{error}</div>}
      </div>

      <div className="filtros-container">
        <select
          value={filtroProducto}
          onChange={(e) => setFiltroProducto(e.target.value)}
          className="filtro-select"
        >
          <option value="">Todos los productos</option>
          {productosDisponibles.map((producto) => (
            <option key={producto.id} value={String(producto.id)}>
              {producto.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="filtro-select"
        >
          <option value="">Todos los tipos</option>
          <option value="ENTRADA">Entradas</option>
          <option value="SALIDA">Salidas</option>
        </select>

        {(filtroProducto || filtroTipo) && (
          <button
            type="button"
            className="filtro-limpiar"
            onClick={() => {
              setFiltroProducto("");
              setFiltroTipo("");
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {cargando && <div className="estado-mensaje">Cargando movimientos...</div>}

      {!cargando && movimientosFiltrados.length === 0 && (
        <div className="estado-mensaje">
          No hay movimientos para mostrar con esos filtros.
        </div>
      )}

      {!cargando && movimientosFiltrados.length > 0 && (
        <div className="tabla-container">
          <table className="tabla-productos">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Usuario</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td>{formatearFecha(movimiento.createdAt)}</td>
                  <td>
                    <div className="producto-nombre">
                      {getNombreProducto(movimiento)}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge-movimiento ${movimiento.tipo.toLowerCase()}`}
                    >
                      {movimiento.tipo}
                    </span>
                  </td>
                  <td>{movimiento.cantidad}</td>
                  <td>{getUsuarioMovimiento(movimiento)}</td>
                  <td>
                    <span className="movimiento-notas">
                      {movimiento.notas || "Sin notas"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="categoria-btn"
                      onClick={() => manejarEditarMovimiento(movimiento)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="categoria-btn eliminar"
                      onClick={() => manejarEliminarMovimiento(movimiento.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
