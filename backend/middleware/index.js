const { generarToken, verificarToken } = require('./auth');
const { errorHandler, notFoundHandler } = require('./error-handler.middleware');
const { errorAuthHandler } = require('./error-auth-handler.middleware');
const { errorCategoriasHandler } = require('./error-categorias-handler.middleware');
const { errorProductosHandler } = require('./error-productos-handler.middleware');
const { errorMovimientosHandler } = require('./error-movimientos-handler.middleware');
const { errorUsuariosHandler } = require('./error-usuarios-handler.middleware');

module.exports = {
  generarToken,
  verificarToken,
  errorHandler,
  notFoundHandler,
  errorAuthHandler,
  errorCategoriasHandler,
  errorProductosHandler,
  errorMovimientosHandler,
  errorUsuariosHandler
};