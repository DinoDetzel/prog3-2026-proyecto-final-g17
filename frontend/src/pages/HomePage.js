import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import { getProductos, getCategorias } from '../services/productos';

export default function HomePage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [soloActivos, setSoloActivos] = useState(true);
  const [stockBajo, setStockBajo] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);
        setProductos(prods);
        setCategorias(cats);
      } catch (err) {
        setError('Error al cargar los datos. Verificá tu conexión.');
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = categoriaSeleccionada === '' || String(p.categoriaId) === categoriaSeleccionada;
      const coincideActivo = !soloActivos || p.activo;
      const coincideStock = !stockBajo || p.stock <= p.stockMinimo;
      return coincideNombre && coincideCategoria && coincideActivo && coincideStock;
    });
  }, [productos, busqueda, categoriaSeleccionada, soloActivos, stockBajo]);

  const getNombreCategoria = (categoriaId) => {
    const cat = categorias.find((c) => c.id === categoriaId);
    return cat ? cat.nombre : '—';
  };

  const getEstadoStock = (producto) => {
    if (producto.stock === 0) return { label: 'Sin stock', clase: 'sin-stock' };
    if (producto.stock <= producto.stockMinimo) return { label: 'Stock bajo', clase: 'stock-bajo' };
    return { label: 'En stock', clase: 'en-stock' };
  };

  const hayFiltrosActivos = busqueda || categoriaSeleccionada || stockBajo;

  return (
    <div className="home-page">
      <Navbar />
      <main className="home-main">

        <div className="home-header">
          <h2 className="home-titulo">Productos</h2>
          <span className="home-contador">
            {productosFiltrados.length} de {productos.length} productos
          </span>
        </div>

        {/* FILTROS */}
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
              <option key={cat.id} value={String(cat.id)}>{cat.nombre}</option>
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
              onClick={() => { setBusqueda(''); setCategoriaSeleccionada(''); setStockBajo(false); }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* ESTADOS */}
        {cargando && <div className="estado-mensaje">Cargando productos...</div>}
        {error && <div className="estado-error">{error}</div>}
        {!cargando && !error && productosFiltrados.length === 0 && (
          <div className="estado-mensaje">No se encontraron productos con esos filtros.</div>
        )}

        {/* TABLA */}
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
                          <div className="producto-descripcion">{p.descripcion}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge-categoria">{getNombreCategoria(p.categoriaId)}</span>
                      </td>
                      <td>
                        <span className="precio">${Number(p.precio).toLocaleString('es-AR')}</span>
                      </td>
                      <td>{p.stock}</td>
                      <td>{p.stockMinimo}</td>
                      <td>
                        <span className={`badge-stock ${estadoStock.clase}`}>
                          {estadoStock.label}
                        </span>
                      </td>
                      <td>
                        <span className={p.activo ? 'activo-si' : 'activo-no'}>
                          {p.activo ? '✓' : '✗'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}