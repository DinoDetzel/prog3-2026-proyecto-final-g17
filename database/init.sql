--inicializo la base de datos y creo las extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--agregue tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--agregue tabla de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--agregue tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--agrego tabla de movimientos
CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL, -- Va a decir 'ENTRADA' o 'SALIDA'
    cantidad INTEGER NOT NULL,
    notas TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--agrego datos a las tablas
INSERT INTO categorias (nombre, descripcion) VALUES
('Limpieza', 'Productos para limpieza del hogar y comercio'),
('Bebidas', 'Gaseosas, aguas y jugos');

INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES
('Lavandina Ayudín 1L', 'Lavandina clásica', 1500.00, 50, 1),
('Coca Cola 2L', 'Gaseosa sabor cola', 2800.00, 100, 2);

SELECT 'Base de datos de inventario inicializada correctamente' AS status;