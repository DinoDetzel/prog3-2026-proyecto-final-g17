/**
 * Middleware de manejo de errores para el recurso Productos.
 */

function errorProductosHandler(err, req, res, next) {
  console.error(`[PRODUCTOS ERROR] ${err.message}`);

  // Nombre de producto duplicado
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      error: true,
      message: "Ya existe un producto con ese nombre",
    });
  }

  // Validaciones de Sequelize
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: true,
      message: err.errors.map((e) => e.message).join(", "),
    });
  }

  // Producto no encontrado
  if (err.status === 404) {
    return res.status(404).json({
      error: true,
      message: err.message || "Producto no encontrado",
    });
  }

  // Stock insuficiente
  if (err.status === 422) {
    return res.status(422).json({
      error: true,
      message: err.message || "Stock insuficiente para realizar la operación",
    });
  }

  next(err);
}

module.exports = { errorProductosHandler };
