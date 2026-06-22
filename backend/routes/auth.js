const express = require('express');
const router = express.Router();
const { register, login, perfil } = require('../controllers/authController');
const { verificarToken, errorAuthHandler, errorHandler } = require('../middleware');

// POST /api/auth/register - Registro de usuario (pública)
router.post('/register', register);

// POST /api/auth/login - Inicio de sesión (pública)
router.post('/login', login);

// GET /api/auth/perfil - Obtener perfil (protegida)
router.get('/perfil', verificarToken, perfil);

// Manejo de errores
router.use(errorAuthHandler);
router.use(errorHandler);

module.exports = router;

