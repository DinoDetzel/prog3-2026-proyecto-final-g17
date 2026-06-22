/**
 * Middleware de manejo de errores para el recurso MovimientosInventario.
 */

function errorMovimientosHandler(err, req, res, next) {
  console.error(`[MOVIMIENTOS ERROR] ${err.message}`);

  // Validaciones de Sequelize
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: true,
      message: err.errors.map((e) => e.message).join(", "),
    });
  }

  // Clave foránea inválida (producto o usuario no existe)
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      error: true,
      message: "El producto o usuario referenciado no existe",
    });
  }

  // Movimiento no encontrado
  if (err.status === 404) {
    return res.status(404).json({
      error: true,
      message: err.message || "Movimiento no encontrado",
    });
  }

  // Stock insuficiente para egreso o actualización/eliminación que da stock negativo
  if (err.status === 422) {
    return res.status(422).json({
      error: true,
      message: err.message || "Stock insuficiente para registrar el movimiento",
    });
  }

  // Errores de validación y estado para movimientos
  if (err.status === 400 || err.status === 404) {
    return res.status(err.status).json({
      error: true,
      message: err.message,
    });
  }

  next(err);
}

module.exports = { errorMovimientosHandler };
