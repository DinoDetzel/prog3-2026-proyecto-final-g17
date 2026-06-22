/**
 * Middleware de manejo de errores para el recurso Categorias.
 */

function errorCategoriasHandler(err, req, res, next) {
  console.error(`[CATEGORIAS ERROR] ${err.message}`);

  // Nombre de categoría duplicado
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: true,
      message: 'Ya existe una categoría con ese nombre'
    });
  }

  // Validaciones de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: true,
      message: err.errors.map(e => e.message).join(', ')
    });
  }

  // Categoría no encontrada
  if (err.status === 404) {
    return res.status(404).json({
      error: true,
      message: err.message || 'Categoría no encontrada'
    });
  }

  // Categoría en uso (no se puede eliminar)
  if (err.status === 409) {
    return res.status(409).json({
      error: true,
      message: err.message || 'No se puede eliminar la categoría porque tiene productos asociados'
    });
  }

  next(err);
}

module.exports = { errorCategoriasHandler };
