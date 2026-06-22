/**
 * Middleware de manejo de errores genérico.
 * Captura cualquier error no manejado y devuelve una respuesta estructurada.
 */

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error';

  res.status(status).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: true,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

module.exports = { errorHandler, notFoundHandler };
