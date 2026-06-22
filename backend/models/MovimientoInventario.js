const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MovimientoInventario = sequelize.define(
    "MovimientoInventario",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "producto_id",
        references: {
          model: "productos",
          key: "id",
        },
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "usuario_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      tipo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [["ENTRADA", "SALIDA"]],
        },
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      notas: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "movimientos",
      timestamps: true,
    },
  );

  return MovimientoInventario;
};
