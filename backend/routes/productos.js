const express = require("express");
const router = express.Router();
const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productoController");
const { verificarToken, errorProductosHandler, errorHandler } = require("../middleware");

router.get("/", verificarToken, listarProductos);
router.get("/:id", verificarToken, obtenerProducto);
router.post("/", verificarToken, crearProducto);
router.put("/:id", verificarToken, actualizarProducto);
router.delete("/:id", verificarToken, eliminarProducto);

// Manejo de errores
router.use(errorProductosHandler);
router.use(errorHandler);

module.exports = router;