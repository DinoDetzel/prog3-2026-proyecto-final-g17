-- Archivo de inicialización de la base de datos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

SELECT 'Base de datos inicializada correctamente' AS status;