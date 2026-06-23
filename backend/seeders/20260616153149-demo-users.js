"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const [count] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) FROM users",
    );
    if (Number(count[0].count) > 0) {
      console.log("Seed users: ya existen registros, se omite la carga.");
      return;
    }

    const hashedPassword = await bcrypt.hash("123456", 10);
    const now = new Date();

    await queryInterface.bulkInsert("users", [
      {
        nombre: "Admin",
        email: "admin@test.com",
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "Juan Pérez",
        email: "juan@test.com",
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
      {
        nombre: "María García",
        email: "maria@test.com",
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
