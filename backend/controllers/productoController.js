const {
  sequelize,
  Producto,
  Categoria,
  MovimientoInventario,
} = require("../models");
const { Op } = require("sequelize");

const listarProductos = async (req, res, next) => {
  try {
    const { categoriaId, search } = req.query;
    const where = {};
    // Filtrar por categoría
    if (categoriaId) {
      where.categoriaId = categoriaId;
    }
    // Filtrar por nombre, % son comodines en SQL, y se usa para decir, buscar lo que contenga la palabra en search
    // op.iLike es para hacer case insensitive en SQL
    if (search) {
      where.nombre = { [Op.iLike]: `%${search}%` };
    }
    // Busca los productos
    const productos = await Producto.findAll({
      where,
      include: [
        { model: Categoria, as: "categoria" },
        { model: MovimientoInventario, as: "movimientos" },
      ],
      order: [["id", "ASC"]],
    });
    // Devuelve los productos
    res.json(productos);
  } catch (error) {
    console.error("Error al listar productos:", error);
    next(error);
  }
};

const obtenerProducto = async (req, res, next) => {
  try {
    // Obtiene el id del producto
    const { id } = req.params;
    // Busca el producto
    const producto = await Producto.findByPk(id, {
      include: [
        { model: Categoria, as: "categoria" },
        { model: MovimientoInventario, as: "movimientos" },
      ],
    });
    // Verifica si el producto existe
    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      return next(error);
    }
    // Devuelve el producto
    res.json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    next(error);
  }
};

const crearProducto = async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      stock,
      stockMinimo,
      categoriaId,
      activo,
    } = req.body;
    // Validaciones
    if (!nombre || String(nombre).trim() === "") {
      const error = new Error("El nombre es obligatorio");
      error.status = 400;
      return next(error);
    }

    if (!categoriaId) {
      const error = new Error("La categoría es obligatoria");
      error.status = 400;
      return next(error);
    }
    // Busca la categoría
    const categoria = await Categoria.findByPk(categoriaId);
    if (!categoria) {
      const error = new Error("Categoría no encontrada");
      error.status = 404;
      return next(error);
    }
    // Crea el producto y si no hay unidad asignada con ?? se le asigna 0 por defecto
    const producto = await Producto.create({
      nombre,
      descripcion,
      precio: precio ?? 0,
      stock: stock ?? 0,
      stockMinimo: stockMinimo ?? 0,
      categoriaId,
      activo: activo ?? true,
    });

    res.status(201).json({ message: "Producto creado exitosamente", producto });
  } catch (error) {
    console.error("Error al crear producto:", error);
    next(error);
  }
};

const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      precio,
      stock,
      stockMinimo,
      categoriaId,
      activo,
    } = req.body;
    // Busca el producto
    const producto = await Producto.findByPk(id);
    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      return next(error);
    }
    // Validaciones
    if (!nombre || String(nombre).trim() === "") {
      const error = new Error("El nombre es obligatorio");
      error.status = 400;
      return next(error);
    }

    if (categoriaId) {
      const categoria = await Categoria.findByPk(categoriaId);
      if (!categoria) {
        const error = new Error("Categoría no encontrada");
        error.status = 404;
        return next(error);
      }
      producto.categoriaId = categoriaId;
    }
    // Actualiza el producto
    producto.nombre = nombre;
    producto.descripcion = descripcion;
    producto.precio = precio ?? producto.precio;
    producto.stock = stock ?? producto.stock;
    producto.stockMinimo = stockMinimo ?? producto.stockMinimo;
    producto.activo = activo !== undefined ? activo : producto.activo;
    // Guarda el producto
    await producto.save();

    res.json({ message: "Producto actualizado exitosamente", producto });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    next(error);
  }
};

const eliminarProducto = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id, {
      transaction,
    });

    if (!producto) {
      await transaction.rollback();
      const error = new Error("Producto no encontrado");
      error.status = 404;
      return next(error);
    }

    // Eliminar movimientos asociados
    await MovimientoInventario.destroy({
      where: {
        productoId: id,
      },
      transaction,
    });

    // Eliminar producto
    await producto.destroy({
      transaction,
    });

    await transaction.commit();

    res.json({
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Error al eliminar producto:", error);

    next(error);
  }
};

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
