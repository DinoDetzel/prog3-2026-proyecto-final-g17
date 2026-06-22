/**
 * Middleware de manejo de errores para el recurso Usuarios.
 */

function errorUsuariosHandler(err, req, res, next) {
  console.error(`[USUARIOS ERROR] ${err.message}`);

  // Email duplicado
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: true,
      message: 'El email ya está registrado'
    });
  }

  // Validaciones de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: true,
      message: err.errors.map(e => e.message).join(', ')
    });
  }

  // Usuario no encontrado
  if (err.status === 404) {
    return res.status(404).json({
      error: true,
      message: err.message || 'Usuario no encontrado'
    });
  }

  // Sin permisos
  if (err.status === 403) {
    return res.status(403).json({
      error: true,
      message: err.message || 'No tenés permisos para realizar esta acción'
    });
  }

  next(err);
}

module.exports = { errorUsuariosHandler };
