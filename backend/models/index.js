// backend/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions
  }
);

const UserModel = require('./User');
const CategoriaModel = require('./Categoria');
const ProductoModel = require('./Producto');
const MovimientoInventarioModel = require('./MovimientoInventario');

const User = UserModel(sequelize);
const Categoria = CategoriaModel(sequelize);
const Producto = ProductoModel(sequelize);
const MovimientoInventario = MovimientoInventarioModel(sequelize);

Categoria.hasMany(Producto, {
  foreignKey: 'categoriaId',
  as: 'productos'
});

Producto.belongsTo(Categoria, {
  foreignKey: 'categoriaId',
  as: 'categoria'
});

Producto.hasMany(MovimientoInventario, {
  foreignKey: 'productoId',
  as: 'movimientos'
});

MovimientoInventario.belongsTo(Producto, {
  foreignKey: 'productoId',
  as: 'producto'
});

module.exports = {
  sequelize,
  Sequelize,
  User,
  Categoria,
  Producto,
  MovimientoInventario
};
