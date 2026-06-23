"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [count] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) FROM productos",
    );
    if (Number(count[0].count) > 0) {
      console.log("Seed productos: ya existen registros, se omite la carga.");
      return;
    }

    const [categorias] = await queryInterface.sequelize.query(
      "SELECT id, nombre FROM categorias",
    );
    const limpieza = categorias.find((c) => c.nombre === "Limpieza");
    const bebidas = categorias.find((c) => c.nombre === "Bebidas");
    const alimentos = categorias.find((c) => c.nombre === "Alimentos");
    const lacteos = categorias.find((c) => c.nombre === "Lacteos");

    const now = new Date();

    await queryInterface.bulkInsert("productos", [
      {
        nombre: "Lavandina Ayudin 1L",
        descripcion: "Lavandina clasica para limpieza",
        precio: 1500.0,
        stock: 40,
        stockMinimo: 10,
        categoria_id: limpieza.id,
        activo: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Coca Cola 2L",
        descripcion: "Gaseosa sabor cola",
        precio: 2800.0,
        stock: 80,
        stockMinimo: 20,
        categoria_id: bebidas.id,
        activo: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Harina 000 1kg",
        descripcion: "Harina de trigo para reposteria",
        precio: 1200.0,
        stock: 25,
        stockMinimo: 10,
        categoria_id: alimentos.id,
        activo: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Leche Entera 1L",
        descripcion: "Leche entera pasteurizada",
        precio: 1800.0,
        stock: 15,
        stockMinimo: 12,
        categoria_id: lacteos.id,
        activo: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Jabon en Polvo 500g",
        descripcion: "Jabon en polvo para lavar ropa",
        precio: 3500.0,
        stock: 0,
        stockMinimo: 5,
        categoria_id: limpieza.id,
        activo: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Arroz Largo 1kg",
        descripcion: "Arroz blanco largo fino",
        precio: 1600.0,
        stock: 50,
        stockMinimo: 15,
        categoria_id: alimentos.id,
        activo: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("productos", null, {});
  },
};
