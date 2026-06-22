"use strict";

const base = new Date();
const dia = (n) => new Date(base.getTime() - n * 24 * 60 * 60 * 1000);

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("movimientos", null, {});

    await queryInterface.bulkInsert("movimientos", [
      {
        producto_id: 1,
        usuario_id: 1,
        tipo: "ENTRADA",
        cantidad: 60,
        notas: "Compra inicial a proveedor",
        createdAt: dia(10),
        updatedAt: dia(10),
      },
      {
        producto_id: 1,
        usuario_id: 2,
        tipo: "SALIDA",
        cantidad: 20,
        notas: "Venta mostrador",
        createdAt: dia(5),
        updatedAt: dia(5),
      },
      {
        producto_id: 2,
        usuario_id: 1,
        tipo: "ENTRADA",
        cantidad: 100,
        notas: "Reposicion de stock",
        createdAt: dia(9),
        updatedAt: dia(9),
      },
      {
        producto_id: 2,
        usuario_id: 3,
        tipo: "SALIDA",
        cantidad: 20,
        notas: "Venta a comercio",
        createdAt: dia(4),
        updatedAt: dia(4),
      },
      {
        producto_id: 3,
        usuario_id: 1,
        tipo: "ENTRADA",
        cantidad: 25,
        notas: "Compra a distribuidor",
        createdAt: dia(8),
        updatedAt: dia(8),
      },
      {
        producto_id: 4,
        usuario_id: 2,
        tipo: "ENTRADA",
        cantidad: 30,
        notas: "Ingreso de mercaderia",
        createdAt: dia(7),
        updatedAt: dia(7),
      },
      {
        producto_id: 4,
        usuario_id: 3,
        tipo: "SALIDA",
        cantidad: 15,
        notas: "Venta mostrador",
        createdAt: dia(3),
        updatedAt: dia(3),
      },
      {
        producto_id: 5,
        usuario_id: 1,
        tipo: "ENTRADA",
        cantidad: 10,
        notas: "Compra inicial",
        createdAt: dia(6),
        updatedAt: dia(6),
      },
      {
        producto_id: 5,
        usuario_id: 2,
        tipo: "SALIDA",
        cantidad: 10,
        notas: "Promocion de lanzamiento",
        createdAt: dia(2),
        updatedAt: dia(2),
      },
      {
        producto_id: 6,
        usuario_id: 1,
        tipo: "ENTRADA",
        cantidad: 50,
        notas: "Compra a mayorista",
        createdAt: dia(1),
        updatedAt: dia(1),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("movimientos", null, {});
  },
};
