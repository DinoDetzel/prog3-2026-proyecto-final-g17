const {
  sequelize,
  MovimientoInventario,
  Producto,
  User,
} = require("../models");

const listarMovimientos = async (req, res, next) => {
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
    next(error);
  }
};

const obtenerMovimiento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movimiento = await MovimientoInventario.findByPk(id, {
      include: [
        { model: Producto, as: "producto" },
        { model: User, as: "usuario" },
      ],
    });

    if (!movimiento) {
      const error = new Error("Movimiento no encontrado");
      error.status = 404;
      return next(error);
    }

    res.json(movimiento);
  } catch (error) {
    console.error("Error al obtener movimiento:", error);
    next(error);
  }
};

const crearMovimiento = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { productoId, tipo, tipoMovimiento, cantidad, notas, motivo } =
      req.body;
    const movimientoTipo = tipo || tipoMovimiento;
    const notasMovimiento = notas !== undefined ? notas : motivo;

    if (!productoId || !movimientoTipo || !cantidad) {
      await transaction.rollback();
      const error = new Error("productoId, tipo y cantidad son obligatorios");
      error.status = 400;
      return next(error);
    }

    if (!["ENTRADA", "SALIDA"].includes(movimientoTipo)) {
      await transaction.rollback();
      const error = new Error("tipo debe ser ENTRADA o SALIDA");
      error.status = 400;
      return next(error);
    }

    if (cantidad <= 0) {
      await transaction.rollback();
      const error = new Error("La cantidad debe ser mayor a cero");
      error.status = 400;
      return next(error);
    }

    const producto = await Producto.findByPk(productoId, {
      transaction,
    });

    if (!producto) {
      await transaction.rollback();
      const error = new Error("Producto no encontrado");
      error.status = 404;
      return next(error);
    }

    if (movimientoTipo === "SALIDA" && producto.stock < cantidad) {
      await transaction.rollback();
      const error = new Error("Stock insuficiente para el movimiento");
      error.status = 422;
      return next(error);
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
      movimientoTipo === "ENTRADA"
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
    next(error);
  }
};

const actualizarMovimiento = async (req, res, next) => {
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
      const error = new Error("Movimiento no encontrado");
      error.status = 404;
      return next(error);
    }

    if (!movimientoTipo || !cantidad) {
      await transaction.rollback();
      const error = new Error("tipo y cantidad son obligatorios");
      error.status = 400;
      return next(error);
    }

    if (!["ENTRADA", "SALIDA"].includes(movimientoTipo)) {
      await transaction.rollback();
      const error = new Error("tipo debe ser ENTRADA o SALIDA");
      error.status = 400;
      return next(error);
    }

    if (cantidad <= 0) {
      await transaction.rollback();
      const error = new Error("La cantidad debe ser mayor a cero");
      error.status = 400;
      return next(error);
    }

    const producto = await Producto.findByPk(movimiento.productoId, {
      transaction,
    });

    if (!producto) {
      await transaction.rollback();
      const error = new Error("Producto asociado no encontrado");
      error.status = 404;
      return next(error);
    }

    const ajusteAnterior =
      movimiento.tipo === "ENTRADA"
        ? movimiento.cantidad
        : -movimiento.cantidad;
    const ajusteNuevo = movimientoTipo === "ENTRADA" ? cantidad : -cantidad;
    const diferenciaStock = ajusteNuevo - ajusteAnterior;

    if (producto.stock + diferenciaStock < 0) {
      await transaction.rollback();
      const error = new Error("La actualización generaría stock negativo");
      error.status = 422;
      return next(error);
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
    next(error);
  }
};

const eliminarMovimiento = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const movimiento = await MovimientoInventario.findByPk(id, {
      transaction: t,
    });

    if (!movimiento) {
      await t.rollback();
      const error = new Error("Movimiento no encontrado");
      error.status = 404;
      return next(error);
    }

    const producto = await Producto.findByPk(movimiento.productoId, {
      transaction: t,
    });

    if (!producto) {
      await t.rollback();
      const error = new Error("Producto asociado no encontrado");
      error.status = 404;
      return next(error);
    }

    const revertirMovimiento =
      movimiento.tipo === "ENTRADA"
        ? -movimiento.cantidad
        : movimiento.cantidad;

    if (producto.stock + revertirMovimiento < 0) {
      await t.rollback();
      const error = new Error(
        "No se puede eliminar porque generaría stock negativo",
      );
      error.status = 422;
      return next(error);
    }

    producto.stock += revertirMovimiento;

    await producto.save({ transaction: t });
    await movimiento.destroy({ transaction: t });
    await t.commit();

    res.json({ message: "Movimiento eliminado exitosamente" });
  } catch (error) {
    await t.rollback();

    console.error("Error al eliminar movimiento:", error);
    next(error);
  }
};

module.exports = {
  listarMovimientos,
  obtenerMovimiento,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
};
