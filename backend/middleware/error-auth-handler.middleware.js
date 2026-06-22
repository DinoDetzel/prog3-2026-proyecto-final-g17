/**
 * Middleware de manejo de errores para autenticación (login, register, perfil).
 */

function errorAuthHandler(err, req, res, next) {
  console.error(`[AUTH ERROR] ${err.message}`);

  // Token inválido o expirado
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: true,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: true,
      message: 'Token expirado, iniciá sesión nuevamente'
    });
  }

  // Email duplicado (registro)
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

  // Credenciales inválidas
  if (err.status === 401) {
    return res.status(401).json({
      error: true,
      message: err.message || 'Credenciales inválidas'
    });
  }

  next(err);
}

module.exports = { errorAuthHandler };
