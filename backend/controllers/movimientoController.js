const { sequelize, MovimientoInventario, Producto } = require("../models");

const listarMovimientos = async (req, res) => {
  try {
    // Busca los movimientos
    const movimientos = await MovimientoInventario.findAll({
      include: [{ model: Producto, as: "producto" }],
      order: [["fecha", "DESC"]],
    });
    // Devuelve los movimientos
    res.json(movimientos);
  } catch (error) {
    console.error("Error al listar movimientos:", error);
    res.status(500).json({ error: "Error al obtener los movimientos" });
  }
};

const obtenerMovimiento = async (req, res) => {
  try {
    // Obtiene el id del movimiento
    const { id } = req.params;
    const movimiento = await MovimientoInventario.findByPk(id, {
      include: [{ model: Producto, as: "producto" }],
    });
    // Verifica si el movimiento existe
    if (!movimiento) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }
    // Devuelve el movimiento
    res.json(movimiento);
  } catch (error) {
    console.error("Error al obtener movimiento:", error);
    res.status(500).json({ error: "Error al obtener el movimiento" });
  }
};

const crearMovimiento = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { productoId, tipoMovimiento, cantidad, motivo, fecha } = req.body;

    // Validaciones
    if (!productoId || !tipoMovimiento || !cantidad || !motivo) {
      await transaction.rollback();

      return res.status(400).json({
        error: "productoId, tipoMovimiento, cantidad y motivo son obligatorios",
      });
    }

    if (!["ENTRADA", "SALIDA"].includes(tipoMovimiento)) {
      await transaction.rollback();

      return res.status(400).json({
        error: "tipoMovimiento debe ser ENTRADA o SALIDA",
      });
    }

    if (cantidad <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        error: "La cantidad debe ser mayor a cero",
      });
    }

    // Buscar producto dentro de la transacción
    const producto = await Producto.findByPk(productoId, {
      transaction,
    });

    if (!producto) {
      await transaction.rollback();

      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    // Verificar stock
    if (tipoMovimiento === "SALIDA" && producto.stock < cantidad) {
      await transaction.rollback();

      return res.status(400).json({
        error: "Stock insuficiente para el movimiento",
      });
    }

    // Crear movimiento
    const movimiento = await MovimientoInventario.create(
      {
        productoId,
        tipoMovimiento,
        cantidad,
        motivo,
        fecha: fecha || new Date(),
      },
      {
        transaction,
      },
    );

    // Actualizar stock
    producto.stock =
      tipoMovimiento === "ENTRADA"
        ? producto.stock + cantidad
        : producto.stock - cantidad;

    await producto.save({
      transaction,
    });

    // Confirmar cambios
    await transaction.commit();

    res.status(201).json({
      message: "Movimiento creado exitosamente",
      movimiento,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Error al crear movimiento:", error);

    res.status(500).json({
      error: "Error al crear el movimiento",
    });
  }
};

const actualizarMovimiento = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { tipoMovimiento, cantidad, motivo, fecha } = req.body;

    const movimiento = await MovimientoInventario.findByPk(id, {
      transaction,
    });

    if (!movimiento) {
      await transaction.rollback();

      return res.status(404).json({
        error: "Movimiento no encontrado",
      });
    }

    if (!tipoMovimiento || !cantidad || !motivo) {
      await transaction.rollback();

      return res.status(400).json({
        error: "tipoMovimiento, cantidad y motivo son obligatorios",
      });
    }

    if (!["ENTRADA", "SALIDA"].includes(tipoMovimiento)) {
      await transaction.rollback();

      return res.status(400).json({
        error: "tipoMovimiento debe ser ENTRADA o SALIDA",
      });
    }

    if (cantidad <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        error: "La cantidad debe ser mayor a cero",
      });
    }

    const producto = await Producto.findByPk(movimiento.productoId, {
      transaction,
    });

    if (!producto) {
      await transaction.rollback();

      return res.status(404).json({
        error: "Producto asociado no encontrado",
      });
    }

    // Revertir movimiento anterior
    const ajusteAnterior =
      movimiento.tipoMovimiento === "ENTRADA"
        ? movimiento.cantidad
        : -movimiento.cantidad;

    // Aplicar nuevo movimiento
    const ajusteNuevo = tipoMovimiento === "ENTRADA" ? cantidad : -cantidad;

    const diferenciaStock = ajusteNuevo - ajusteAnterior;

    if (producto.stock + diferenciaStock < 0) {
      await transaction.rollback();

      return res.status(400).json({
        error: "La actualización generaría stock negativo",
      });
    }

    producto.stock += diferenciaStock;

    movimiento.tipoMovimiento = tipoMovimiento;
    movimiento.cantidad = cantidad;
    movimiento.motivo = motivo;
    movimiento.fecha = fecha || movimiento.fecha;

    await movimiento.save({
      transaction,
    });

    await producto.save({
      transaction,
    });

    await transaction.commit();

    res.json({
      message: "Movimiento actualizado exitosamente",
      movimiento,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Error al actualizar movimiento:", error);

    res.status(500).json({
      error: "Error al actualizar el movimiento",
    });
  }
};

const eliminarMovimiento = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    // Busca el movimiento y el producto
    const movimiento = await MovimientoInventario.findByPk(id, {
      transaction: t,
    });
    if (!movimiento) {
      await t.rollback();
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }

    const producto = await Producto.findByPk(movimiento.productoId, {
      transaction: t,
    });
    if (!producto) {
      await t.rollback();
      return res.status(404).json({ error: "Producto asociado no encontrado" });
    }
    // Verifica que la eliminación no genere stock negativo
    const revertirMovimiento =
      movimiento.tipoMovimiento === "ENTRADA"
        ? -movimiento.cantidad
        : movimiento.cantidad;
    // evita stock negativo
    if (producto.stock + revertirMovimiento < 0) {
      await t.rollback();
      return res.status(400).json({
        error: "No se puede eliminar porque generaría stock negativo",
      });
    }
    // Elimina el movimiento
    producto.stock += revertirMovimiento;

    await producto.save({ transaction: t });
    await movimiento.destroy({ transaction: t });
    // confirma cambios
    await t.commit();
    res.json({ message: "Movimiento eliminado exitosamente" });
  } catch (error) {
    await t.rollback();

    console.error("Error al eliminar movimiento:", error);

    res.status(500).json({ error: "Error al eliminar el movimiento" });
  }
};

module.exports = {
  listarMovimientos,
  obtenerMovimiento,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
};
