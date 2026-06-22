const express = require("express");
const router = express.Router();
const {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} = require("../controllers/categoriaController");
const { verificarToken } = require("../middleware/auth");

router.get("/", verificarToken, listarCategorias);
router.get("/:id", verificarToken, obtenerCategoria);
router.post("/", verificarToken, crearCategoria);
router.put("/:id", verificarToken, actualizarCategoria);
router.delete("/:id", verificarToken, eliminarCategoria);

module.exports = router;
