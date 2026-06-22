"use strict";

const now = new Date();

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("categorias", null, {});

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
