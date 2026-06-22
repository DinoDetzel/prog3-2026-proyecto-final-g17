const { Categoria, Producto } = require("../models");

const listarCategorias = async (req, res, next) => {
  try {
    // Busca las categorías con sus productos
    const categorias = await Categoria.findAll({
      include: [{ model: Producto, as: "productos" }],
      order: [["id", "ASC"]],
    });

    res.json(categorias);
  } catch (error) {
    console.error("Error al listar categorías:", error);
    next(error);
  }
};

const obtenerCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Busca la categoría con sus productos
    const categoria = await Categoria.findByPk(id, {
      include: [{ model: Producto, as: "productos" }],
    });

    if (!categoria) {
      const err = new Error("Categoría no encontrada");
      err.status = 404;
      return next(err);
    }

    res.json(categoria);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    next(error);
  }
};

const crearCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    // Validacion del nombre
    if (!nombre || String(nombre).trim() === "") {
      const err = new Error("El nombre es obligatorio");
      err.status = 400;
      return next(err);
    }
    // Crea la categoría
    const categoria = await Categoria.create({ nombre, descripcion });

    res
      .status(201)
      .json({ message: "Categoría creada exitosamente", categoria });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    next(error);
  }
};

const actualizarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    // Busca la categoría
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      const err = new Error("Categoría no encontrada");
      err.status = 404;
      return next(err);
    }
    // Validacion del nombre
    if (!nombre || String(nombre).trim() === "") {
      const err = new Error("El nombre es obligatorio");
      err.status = 400;
      return next(err);
    }

    categoria.nombre = nombre;
    categoria.descripcion = descripcion;
    // Actualiza la categoría
    await categoria.save();

    res.json({ message: "Categoría actualizada exitosamente", categoria });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    next(error);
  }
};

const eliminarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      const err = new Error("Categoría no encontrada");
      err.status = 404;
      return next(err);
    }

    // Prevent deletion if category has associated products
    const productos =
      (await categoria.getProductos) && (await categoria.getProductos());
    if (productos && productos.length > 0) {
      const err = new Error(
        "No se puede eliminar la categoría porque tiene productos asociados",
      );
      err.status = 409;
      return next(err);
    }

    await categoria.destroy();
    res.json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    next(error);
  }
};

module.exports = {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
