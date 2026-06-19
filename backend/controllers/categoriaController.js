const { Categoria, Producto } = require("../models");

const listarCategorias = async (req, res) => {
  try {
    // Busca las categorías con sus productos
    const categorias = await Categoria.findAll({
      include: [{ model: Producto, as: "productos" }],
      order: [["id", "ASC"]],
    });

    res.json(categorias);
  } catch (error) {
    console.error("Error al listar categorías:", error);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
};

const obtenerCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    // Busca la categoría con sus productos
    const categoria = await Categoria.findByPk(id, {
      include: [{ model: Producto, as: "productos" }],
    });

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(categoria);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ error: "Error al obtener la categoría" });
  }
};

const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    // Validacion del nombre
    if (!nombre || String(nombre).trim() === "") {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    // Crea la categoría
    const categoria = await Categoria.create({ nombre, descripcion });

    res
      .status(201)
      .json({ message: "Categoría creada exitosamente", categoria });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ error: "Ya existe una categoría con ese nombre" });
    }
    res.status(500).json({ error: "Error al crear la categoría" });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    // Busca la categoría
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    // Validacion del nombre
    if (!nombre || String(nombre).trim() === "") {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    categoria.nombre = nombre;
    categoria.descripcion = descripcion;
    // Actualiza la categoría
    await categoria.save();

    res.json({ message: "Categoría actualizada exitosamente", categoria });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ error: "Ya existe una categoría con ese nombre" });
    }
    res.status(500).json({ error: "Error al actualizar la categoría" });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    await categoria.destroy();
    res.json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
};

module.exports = {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
