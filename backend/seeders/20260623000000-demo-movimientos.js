"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [count] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) FROM movimientos",
    );
    if (Number(count[0].count) > 0) {
      console.log("Seed movimientos: ya existen registros, se omite la carga.");
      return;
    }

    const [productos] = await queryInterface.sequelize.query(
      "SELECT id, nombre FROM productos",
    );
    const [users] = await queryInterface.sequelize.query(
      "SELECT id, email FROM users",
    );

    const lavandina = productos.find((p) => p.nombre.includes("Lavandina"));
    const coca = productos.find((p) => p.nombre.includes("Coca Cola"));
    const harina = productos.find((p) => p.nombre.includes("Harina"));
    const leche = productos.find((p) => p.nombre.includes("Leche Entera"));
    const jabon = productos.find((p) => p.nombre.includes("Jabon"));
    const arroz = productos.find((p) => p.nombre.includes("Arroz"));

    const admin = users.find((u) => u.email === "admin@test.com");
    const juan = users.find((u) => u.email === "juan@test.com");
    const maria = users.find((u) => u.email === "maria@test.com");

    const base = new Date();
    const dia = (n) => new Date(base.getTime() - n * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert("movimientos", [
      {
        producto_id: lavandina.id,
        usuario_id: admin.id,
        tipo: "ENTRADA",
        cantidad: 60,
        notas: "Compra inicial a proveedor",
        createdAt: dia(10),
        updatedAt: dia(10),
      },
      {
        producto_id: lavandina.id,
        usuario_id: juan.id,
        tipo: "SALIDA",
        cantidad: 20,
        notas: "Venta mostrador",
        createdAt: dia(5),
        updatedAt: dia(5),
      },
      {
        producto_id: coca.id,
        usuario_id: admin.id,
        tipo: "ENTRADA",
        cantidad: 100,
        notas: "Reposicion de stock",
        createdAt: dia(9),
        updatedAt: dia(9),
      },
      {
        producto_id: coca.id,
        usuario_id: maria.id,
        tipo: "SALIDA",
        cantidad: 20,
        notas: "Venta a comercio",
        createdAt: dia(4),
        updatedAt: dia(4),
      },
      {
        producto_id: harina.id,
        usuario_id: admin.id,
        tipo: "ENTRADA",
        cantidad: 25,
        notas: "Compra a distribuidor",
        createdAt: dia(8),
        updatedAt: dia(8),
      },
      {
        producto_id: leche.id,
        usuario_id: juan.id,
        tipo: "ENTRADA",
        cantidad: 30,
        notas: "Ingreso de mercaderia",
        createdAt: dia(7),
        updatedAt: dia(7),
      },
      {
        producto_id: leche.id,
        usuario_id: maria.id,
        tipo: "SALIDA",
        cantidad: 15,
        notas: "Venta mostrador",
        createdAt: dia(3),
        updatedAt: dia(3),
      },
      {
        producto_id: jabon.id,
        usuario_id: admin.id,
        tipo: "ENTRADA",
        cantidad: 10,
        notas: "Compra inicial",
        createdAt: dia(6),
        updatedAt: dia(6),
      },
      {
        producto_id: jabon.id,
        usuario_id: juan.id,
        tipo: "SALIDA",
        cantidad: 10,
        notas: "Promocion de lanzamiento",
        createdAt: dia(2),
        updatedAt: dia(2),
      },
      {
        producto_id: arroz.id,
        usuario_id: admin.id,
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
