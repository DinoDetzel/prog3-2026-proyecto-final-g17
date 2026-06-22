const express = require("express");
const router = express.Router();
const {
  listarMovimientos,
  obtenerMovimiento,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
} = require("../controllers/movimientoController");
const { verificarToken } = require("../middleware/auth");

router.get("/", verificarToken, listarMovimientos);
router.get("/:id", verificarToken, obtenerMovimiento);
router.post("/", verificarToken, crearMovimiento);
router.put("/:id", verificarToken, actualizarMovimiento);
router.delete("/:id", verificarToken, eliminarMovimiento);

module.exports = router;
