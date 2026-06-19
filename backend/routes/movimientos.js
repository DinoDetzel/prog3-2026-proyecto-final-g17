const express = require('express');
const router = express.Router();
const {
  listarMovimientos,
  obtenerMovimiento,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento
} = require('../controllers/movimientoController');

router.get('/', listarMovimientos);
router.get('/:id', obtenerMovimiento);
router.post('/', crearMovimiento);
router.put('/:id', actualizarMovimiento);
router.delete('/:id', eliminarMovimiento);

module.exports = router;
