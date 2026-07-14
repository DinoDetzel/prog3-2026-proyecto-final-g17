import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/layout/Navbar";
import {
  getProductos,
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../services/productos";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "categorias", label: "Categorías", icon: "🗂️" },
  { id: "productos", label: "Productos", icon: "📦" },
  { id: "movimientos", label: "Movimientos", icon: "🔄" },
];

export default function HomePage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [seccionActiva, setSeccionActiva] = useState("productos");
  const [formCategoria, setFormCategoria] = useState({
    nombre: "",
    descripcion: "",
  });
  const [categoriaEditandoId, setCategoriaEditandoId] = useState(null);
  const [mensajeCategoria, setMensajeCategoria] = useState("");
  const [errorCategoria, setErrorCategoria] = useState("");

  const [formProducto, setFormProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    stockMinimo: "",
    categoriaId: "",
    activo: true,
  });
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [mensajeProducto, setMensajeProducto] = useState("");
  const [errorProducto, setErrorProducto] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [soloActivos, setSoloActivos] = useState(true);
  const [stockBajo, setStockBajo] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideNombre = p.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const coincideCategoria =
        categoriaSeleccionada === "" ||
        String(p.categoriaId) === categoriaSeleccionada;
      const coincideActivo = !soloActivos || p.activo;
      const coincideStock = !stockBajo || p.stock <= p.stockMinimo;
      return (
        coincideNombre && coincideCategoria && coincideActivo && coincideStock
      );
    });
  }, [productos, busqueda, categoriaSeleccionada, soloActivos, stockBajo]);

  const getNombreCategoria = (categoriaId) => {
    const cat = categorias.find((c) => c.id === categoriaId);
    return cat ? cat.nombre : "—";
  };

  const getEstadoStock = (producto) => {
    if (producto.stock === 0) return { label: "Sin stock", clase: "sin-stock" };
    if (producto.stock <= producto.stockMinimo)
      return { label: "Stock bajo", clase: "stock-bajo" };
    return { label: "En stock", clase: "en-stock" };
  };

  const hayFiltrosActivos = busqueda || categoriaSeleccionada || stockBajo;

  const resetFormCategoria = () => {
    setFormCategoria({ nombre: "", descripcion: "" });
    setCategoriaEditandoId(null);
  };

  const resetFormProducto = () => {
    setFormProducto({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      stockMinimo: "",
      categoriaId: "",
      activo: true,
    });
    setProductoEditandoId(null);
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [prods, cats] = await Promise.all([
        getProductos(),
        getCategorias(),
      ]);
      setProductos(prods);
      setCategorias(cats);
      setError("");
    } catch (err) {
      setError("Error al cargar los datos. Verificá tu conexión.");
    } finally {
      setCargando(false);
    }
  };

  const manejarGuardarCategoria = async (e) => {
    e.preventDefault();
    setErrorCategoria("");
    setMensajeCategoria("");

    if (!formCategoria.nombre.trim()) {
      setErrorCategoria("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      if (categoriaEditandoId) {
        await actualizarCategoria(categoriaEditandoId, formCategoria);
        setMensajeCategoria("Categoría actualizada correctamente.");
      } else {
        await crearCategoria(formCategoria);
        setMensajeCategoria("Categoría creada correctamente.");
      }

      await cargarDatos();
      resetFormCategoria();
    } catch (err) {
      const mensaje =
        err?.response?.data?.message ||
        "No se pudo guardar la categoría. Intentá nuevamente.";
      setErrorCategoria(mensaje);
    }
  };

  const manejarGuardarProducto = async (e) => {
    e.preventDefault();
    setErrorProducto("");
    setMensajeProducto("");

    if (!formProducto.nombre.trim()) {
      setErrorProducto("El nombre del producto es obligatorio.");
      return;
    }

    if (!formProducto.categoriaId) {
      setErrorProducto("La categoría del producto es obligatoria.");
      return;
    }

    try {
      const payload = {
        nombre: formProducto.nombre,
        descripcion: formProducto.descripcion,
        precio: Number(formProducto.precio) || 0,
        stock: Number(formProducto.stock) || 0,
        stockMinimo: Number(formProducto.stockMinimo) || 0,
        categoriaId: Number(formProducto.categoriaId),
        activo: formProducto.activo,
      };

      if (productoEditandoId) {
        await actualizarProducto(productoEditandoId, payload);
        setMensajeProducto("Producto actualizado correctamente.");
      } else {
        await crearProducto(payload);
        setMensajeProducto("Producto creado correctamente.");
      }

      await cargarDatos();
      resetFormProducto();
    } catch (err) {
      const mensaje =
        err?.response?.data?.message ||
        "No se pudo guardar el producto. Intentá nuevamente.";
      setErrorProducto(mensaje);
    }
  };

  const manejarEditarCategoria = (categoria) => {
    setCategoriaEditandoId(categoria.id);
    setFormCategoria({
      nombre: categoria.nombre || "",
      descripcion: categoria.descripcion || "",
    });
    setSeccionActiva("categorias");
    setMensajeCategoria("");
    setErrorCategoria("");
  };

  const manejarEliminarCategoria = async (id) => {
    if (!window.confirm("¿Querés eliminar esta categoría?")) return;

    setErrorCategoria("");
    setMensajeCategoria("");

    try {
      await eliminarCategoria(id);
      await cargarDatos();
      if (categoriaEditandoId === id) {
        resetFormCategoria();
      }
      setMensajeCategoria("Categoría eliminada correctamente.");
    } catch (err) {
      const mensaje =
        err?.response?.data?.message || "No se pudo eliminar la categoría.";
      setErrorCategoria(mensaje);
    }
  };

  const manejarEditarProducto = (producto) => {
    setProductoEditandoId(producto.id);
    setFormProducto({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio ?? "",
      stock: producto.stock ?? "",
      stockMinimo: producto.stockMinimo ?? "",
      categoriaId: producto.categoriaId ? String(producto.categoriaId) : "",
      activo: producto.activo ?? true,
    });
    setSeccionActiva("productos");
    setMensajeProducto("");
    setErrorProducto("");
  };

  const manejarEliminarProducto = async (id) => {
    if (!window.confirm("¿Querés eliminar este producto?")) return;

    setErrorProducto("");
    setMensajeProducto("");

    try {
      await eliminarProducto(id);
      await cargarDatos();
      if (productoEditandoId === id) {
        resetFormProducto();
      }
      setMensajeProducto("Producto eliminado correctamente.");
    } catch (err) {
      const mensaje =
        err?.response?.data?.message || "No se pudo eliminar el producto.";
      setErrorProducto(mensaje);
    }
  };

  const resumen = useMemo(
    () => ({
      totalProductos: productos.length,
      productosActivos: productos.filter((p) => p.activo).length,
      stockBajo: productos.filter((p) => p.stock <= p.stockMinimo).length,
      categorias: categorias.length,
    }),
    [productos, categorias],
  );

  const renderContenido = () => {
    switch (seccionActiva) {
      case "dashboard":
        return (
          <section className="content-panel">
            <div className="home-header">
              <h2 className="home-titulo">Dashboard</h2>
              <span className="home-contador">Resumen general</span>
            </div>

            <div className="dashboard-grid">
              <article className="stat-card">
                <h3>Total de productos</h3>
                <p className="stat-value">{resumen.totalProductos}</p>
              </article>
              <article className="stat-card">
                <h3>Productos activos</h3>
                <p className="stat-value">{resumen.productosActivos}</p>
              </article>
              <article className="stat-card">
                <h3>Stock bajo</h3>
                <p className="stat-value">{resumen.stockBajo}</p>
              </article>
              <article className="stat-card">
                <h3>Categorías</h3>
                <p className="stat-value">{resumen.categorias}</p>
              </article>
            </div>
          </section>
        );

      case "categorias":
        return (
          <section className="content-panel">
            <div className="home-header">
              <h2 className="home-titulo">Categorías</h2>
              <span className="home-contador">
                {categorias.length} categorías cargadas
              </span>
            </div>

            <div className="empty-state">
              <p>Gestioná tus categorías desde esta sección.</p>

              <form
                className="categoria-form"
                onSubmit={manejarGuardarCategoria}
              >
                <input
                  type="text"
                  className="filtro-input"
                  placeholder="Nombre de la categoría"
                  value={formCategoria.nombre}
                  onChange={(e) =>
                    setFormCategoria({
                      ...formCategoria,
                      nombre: e.target.value,
                    })
                  }
                />
                <div class="producto-form-row">
                  <textarea
                    className="categoria-textarea"
                    placeholder="Descripción"
                    value={formCategoria.descripcion}
                    onChange={(e) =>
                      setFormCategoria({
                        ...formCategoria,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="categoria-form-actions">
                  <button type="submit" className="categoria-btn principal">
                    {categoriaEditandoId ? "Actualizar" : "Crear"}
                  </button>
                  {categoriaEditandoId && (
                    <button
                      type="button"
                      className="categoria-btn"
                      onClick={resetFormCategoria}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {mensajeCategoria && (
                <div className="estado-ok">{mensajeCategoria}</div>
              )}
              {errorCategoria && (
                <div className="estado-error">{errorCategoria}</div>
              )}

              <div className="categoria-list">
                {categorias.map((cat) => (
                  <div key={cat.id} className="categoria-card">
                    <div>
                      <h3 className="categoria-card-title">{cat.nombre}</h3>
                      <p className="categoria-card-desc">
                        {cat.descripcion || "Sin descripción"}
                      </p>
                      <span className="categoria-card-count">
                        {cat.productos?.length || 0} productos asociados
                      </span>
                    </div>
                    <div className="categoria-actions">
                      <button
                        type="button"
                        className="categoria-btn"
                        onClick={() => manejarEditarCategoria(cat)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="categoria-btn eliminar"
                        onClick={() => manejarEliminarCategoria(cat.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "movimientos":
        return (
          <section className="content-panel">
            <div className="home-header">
              <h2 className="home-titulo">Movimientos</h2>
              <span className="home-contador">Historial de inventario</span>
            </div>

            <div className="empty-state">
              <p>
                Aquí aparecerán los movimientos de stock y ajustes de
                inventario.
              </p>
            </div>
          </section>
        );

      case "productos":
      default:
        return (
          <section className="content-panel">
            <div className="home-header">
              <h2 className="home-titulo">Productos</h2>
              <span className="home-contador">
                {productosFiltrados.length} de {productos.length} productos
              </span>
            </div>

            <div className="producto-form-card">
              <h3>
                {productoEditandoId ? "Editar producto" : "Nuevo producto"}
              </h3>
              <form className="producto-form" onSubmit={manejarGuardarProducto}>
                <input
                  type="text"
                  className="filtro-input"
                  placeholder="Nombre del producto"
                  value={formProducto.nombre}
                  onChange={(e) =>
                    setFormProducto({ ...formProducto, nombre: e.target.value })
                  }
                />
                <div class="producto-form-row">
                  <textarea
                    className="categoria-textarea"
                    placeholder="Descripción"
                    value={formProducto.descripcion}
                    onChange={(e) =>
                      setFormProducto({
                        ...formProducto,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="producto-form-row">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="filtro-input"
                    placeholder="Precio"
                    value={formProducto.precio}
                    onChange={(e) =>
                      setFormProducto({
                        ...formProducto,
                        precio: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    className="filtro-input"
                    placeholder="Stock"
                    value={formProducto.stock}
                    onChange={(e) =>
                      setFormProducto({
                        ...formProducto,
                        stock: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    className="filtro-input"
                    placeholder="Stock mínimo"
                    value={formProducto.stockMinimo}
                    onChange={(e) =>
                      setFormProducto({
                        ...formProducto,
                        stockMinimo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="producto-form-row">
                  <select
                    value={formProducto.categoriaId}
                    onChange={(e) =>
                      setFormProducto({
                        ...formProducto,
                        categoriaId: e.target.value,
                      })
                    }
                    className="filtro-select"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <label className="filtro-check">
                    <input
                      type="checkbox"
                      checked={formProducto.activo}
                      onChange={(e) =>
                        setFormProducto({
                          ...formProducto,
                          activo: e.target.checked,
                        })
                      }
                    />
                    Activo
                  </label>
                </div>
                <div className="categoria-form-actions">
                  <button type="submit" className="categoria-btn principal">
                    {productoEditandoId ? "Actualizar" : "Crear"}
                  </button>
                  {productoEditandoId && (
                    <button
                      type="button"
                      className="categoria-btn"
                      onClick={resetFormProducto}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {mensajeProducto && (
                <div className="estado-ok">{mensajeProducto}</div>
              )}
              {errorProducto && (
                <div className="estado-error">{errorProducto}</div>
              )}
            </div>

            <div className="filtros-container">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="filtro-input"
              />

              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.nombre}
                  </option>
                ))}
              </select>

              <label className="filtro-check">
                <input
                  type="checkbox"
                  checked={soloActivos}
                  onChange={(e) => setSoloActivos(e.target.checked)}
                />
                Solo activos
              </label>

              <label className="filtro-check">
                <input
                  type="checkbox"
                  checked={stockBajo}
                  onChange={(e) => setStockBajo(e.target.checked)}
                />
                Stock bajo
              </label>

              {hayFiltrosActivos && (
                <button
                  className="filtro-limpiar"
                  onClick={() => {
                    setBusqueda("");
                    setCategoriaSeleccionada("");
                    setStockBajo(false);
                  }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {cargando && (
              <div className="estado-mensaje">Cargando productos...</div>
            )}
            {error && <div className="estado-error">{error}</div>}
            {!cargando && !error && productosFiltrados.length === 0 && (
              <div className="estado-mensaje">
                No se encontraron productos con esos filtros.
              </div>
            )}

            {!cargando && !error && productosFiltrados.length > 0 && (
              <div className="tabla-container">
                <table className="tabla-productos">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Stock mín.</th>
                      <th>Estado</th>
                      <th>Activo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.map((p) => {
                      const estadoStock = getEstadoStock(p);
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="producto-nombre">{p.nombre}</div>
                            {p.descripcion && (
                              <div className="producto-descripcion">
                                {p.descripcion}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge-categoria">
                              {getNombreCategoria(p.categoriaId)}
                            </span>
                          </td>
                          <td>
                            <span className="precio">
                              ${Number(p.precio).toLocaleString("es-AR")}
                            </span>
                          </td>
                          <td>{p.stock}</td>
                          <td>{p.stockMinimo}</td>
                          <td>
                            <span
                              className={`badge-stock ${estadoStock.clase}`}
                            >
                              {estadoStock.label}
                            </span>
                          </td>
                          <td>
                            <span
                              className={p.activo ? "activo-si" : "activo-no"}
                            >
                              {p.activo ? "✓" : "✗"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="categoria-btn"
                              onClick={() => manejarEditarProducto(p)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="categoria-btn eliminar"
                              onClick={() => manejarEliminarProducto(p.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
    }
  };

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <p className="sidebar-title">Inventario</p>
            <span className="sidebar-subtitle">Panel principal</span>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${seccionActiva === item.id ? "active" : ""}`}
                onClick={() => setSeccionActiva(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="home-main">{renderContenido()}</main>
      </div>
    </div>
  );
}
