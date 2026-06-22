'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insertar Categorías
    await queryInterface.bulkInsert('categorias', [
      { nombre: 'Limpieza', descripcion: 'Productos para limpieza del hogar', createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Bebidas', descripcion: 'Gaseosas y jugos', createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Insertar Productos
    await queryInterface.bulkInsert('productos', [
      { nombre: 'Lavandina Ayudín 1L', descripcion: 'Lavandina clásica', precio: 1500.00, stock: 50, categoria_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Coca Cola 2L', descripcion: 'Gaseosa sabor cola', precio: 2800.00, stock: 100, categoria_id: 2, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('productos', null, {});
    await queryInterface.bulkDelete('categorias', null, {});
  }
};