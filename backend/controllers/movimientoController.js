const {
  sequelize,
  MovimientoInventario,
  Producto,
  User,
} = require("../models");

const listarMovimientos = async (req, res) => {
  try {
    const movimientos = await MovimientoInventario.findAll({
      include: [
        { model: Producto, as: "producto" },
        { model: User, as: "usuario" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(movimientos);
  } catch (error) {
    console.error("Error al listar movimientos:", error);
    res.status(500).json({ error: "Error al obtener los movimientos" });
  }
};

const obtenerMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const movimiento = await MovimientoInventario.findByPk(id, {
      include: [
        { model: Producto, as: "producto" },
        { model: User, as: "usuario" },
      ],
    });

    if (!movimiento) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }

    res.json(movimiento);
  } catch (error) {
    console.error("Error al obtener movimiento:", error);
    res.status(500).json({ error: "Error al obtener el movimiento" });
  }
};

const crearMovimiento = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { productoId, tipo, tipoMovimiento, cantidad, notas, motivo } =
      req.body;
    const movimientoTipo = tipo || tipoMovimiento;
    const notasMovimiento = notas !== undefined ? notas : motivo;

    if (!productoId || !movimientoTipo || !cantidad) {
      await transaction.rollback();

      return res.status(400).json({
        error: "productoId, tipo y cantidad son obligatorios",
      });
    }

    if (!["ENTRADA", "SALIDA"].includes(movimientoTipo)) {
      await transaction.rollback();

      return res.status(400).json({
        error: "tipo debe ser ENTRADA o SALIDA",
      });
    }

    if (cantidad <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        error: "La cantidad debe ser mayor a cero",
      });
    }

    const producto = await Producto.findByPk(productoId, {
      transaction,
    });

    if (!producto) {
      await transaction.rollback();

      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    if (tipo === "SALIDA" && producto.stock < cantidad) {
      await transaction.rollback();

      return res.status(400).json({
        error: "Stock insuficiente para el movimiento",
      });
    }

    const movimiento = await MovimientoInventario.create(
      {
        productoId,
        usuarioId: req.user.id,
        tipo: movimientoTipo,
        cantidad,
        notas: notasMovimiento || null,
      },
      {
        transaction,
      },
    );

    producto.stock =
      tipo === "ENTRADA"
        ? producto.stock + cantidad
        : producto.stock - cantidad;

    await producto.save({ transaction });
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
    const { tipo, tipoMovimiento, cantidad, notas, motivo } = req.body;
    const movimientoTipo = tipo || tipoMovimiento;
    const notasMovimiento = notas !== undefined ? notas : motivo;

    const movimiento = await MovimientoInventario.findByPk(id, {
      transaction,
    });

    if (!movimiento) {
      await transaction.rollback();

      return res.status(404).json({
        error: "Movimiento no encontrado",
      });
    }

    if (!movimientoTipo || !cantidad) {
      await transaction.rollback();

      return res.status(400).json({
        error: "tipo y cantidad son obligatorios",
      });
    }

    if (!["ENTRADA", "SALIDA"].includes(movimientoTipo)) {
      await transaction.rollback();

      return res.status(400).json({
        error: "tipo debe ser ENTRADA o SALIDA",
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

    const ajusteAnterior =
      movimiento.tipo === "ENTRADA"
        ? movimiento.cantidad
        : -movimiento.cantidad;
    const ajusteNuevo = movimientoTipo === "ENTRADA" ? cantidad : -cantidad;
    const diferenciaStock = ajusteNuevo - ajusteAnterior;

    if (producto.stock + diferenciaStock < 0) {
      await transaction.rollback();

      return res.status(400).json({
        error: "La actualización generaría stock negativo",
      });
    }

    producto.stock += diferenciaStock;
    movimiento.tipo = movimientoTipo;
    movimiento.cantidad = cantidad;
    movimiento.notas =
      notasMovimiento !== undefined ? notasMovimiento : movimiento.notas;

    await movimiento.save({ transaction });
    await producto.save({ transaction });
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

    const revertirMovimiento =
      movimiento.tipo === "ENTRADA"
        ? -movimiento.cantidad
        : movimiento.cantidad;

    if (producto.stock + revertirMovimiento < 0) {
      await t.rollback();
      return res.status(400).json({
        error: "No se puede eliminar porque generaría stock negativo",
      });
    }

    producto.stock += revertirMovimiento;

    await producto.save({ transaction: t });
    await movimiento.destroy({ transaction: t });
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
