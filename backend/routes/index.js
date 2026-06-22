const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const categoriaRoutes = require('./categorias');
const productoRoutes = require('./productos');
const movimientoRoutes = require('./movimientos');

// Ruta de prueba
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de recursos
router.use('/categorias', categoriaRoutes);
router.use('/productos', productoRoutes);
router.use('/movimientos', movimientoRoutes);

// Ruta de ejemplo
router.get('/test', (req, res) => {
  res.json({
    message: 'Endpoint de prueba',
    data: {
      backend: 'Express',
      database: 'PostgreSQL',
      orm: 'Sequelize'
    }
  });
});

module.exports = router;
