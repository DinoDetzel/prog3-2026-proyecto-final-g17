"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [count] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) FROM categorias",
    );
    if (Number(count[0].count) > 0) {
      console.log("Seed categorias: ya existen registros, se omite la carga.");
      return;
    }

    const now = new Date();

    await queryInterface.bulkInsert("categorias", [
      {
        nombre: "Limpieza",
        descripcion: "Productos para limpieza del hogar y comercio",
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Bebidas",
        descripcion: "Gaseosas, aguas y jugos",
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Alimentos",
        descripcion: "Harinas, arroz, fideos y otros alimentos no perecederos",
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Lacteos",
        descripcion: "Leches, quesos y derivados lacteos",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("categorias", null, {});
  },
};
