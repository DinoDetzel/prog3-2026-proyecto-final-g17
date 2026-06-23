# Programación III 2026 - TUP

#### Profesor: Gustavo Ramoscelli
#### Ayudante: Maria Victoria Ruiz

#### Integrantes del Grupo 17:
- Dino Detzel
- Jano Rodriguez
- Luca Aversano
- Joaquin Robles
- Owen Braggi Bamberger Carrasco
- Garcia Amado Juan Manuel

## Proyecto Final (Backend)

**Sistema de Inventario Básico**
Aplicación básica para pequeños negocios que necesiten controlar su inventario.

## Funcionalidades Principales
- Gestión de productos
- Control de stock básico
- Categorización de productos
- Registro de movimientos de inventario
- Búsqueda simple de productos

## Metodología de trabajo con Git/GitHub
Se trabajó con ramas por alumno. Cada integrante creó su propia rama con el formato feature/nombre, realizó sus cambios y abrió un Pull Request hacia dev. Cada alumno tiene mínimo un commit en su rama.

## Arquitectura General

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Caddy     │    │   React     │    │   Express   │
│  (Proxy)    │◄──►│ (Frontend)  │◄──►│  (Backend)  │
│   :80       │    │   :3000     │    │   :3001     │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                   ┌─────────────┐    ┌─────────────┐
                   │    Redis    │    │ PostgreSQL  │
                   │  (Cache)    │    │    (DB)     │
                   │   :6379     │    │   :5432     │
                   └─────────────┘    └─────────────┘
```

Todos los servicios corren dentro de contenedores Docker y se comunican a traves de una red interna (`app_network`). Caddy actua como reverse proxy: recibe todo el trafico en el puerto 80 y lo redirige al frontend o al backend segun la URL.

| Servicio | Tecnologia | Puerto | Funcion |
|----------|------------|--------|---------|
| **Frontend** | React 18 | 3000 | Interfaz de usuario | (por implementar)
| **Backend** | Express + Sequelize | 3001 | API REST |
| **Database** | PostgreSQL 15 | 5432 | Base de datos relacional |
| **Cache** | Redis 7 | 6379 | Cache y sesiones | (por implementar)
| **Proxy** | Caddy 2 | 80 | Reverse proxy |
| **pgAdmin** | pgAdmin 4 | 5050 | Administracion visual de la BD |

---

## Inicio Rapido

### Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y [Docker Compose](https://docs.docker.com/compose/install/) instalados.

### Levantar el proyecto

```bash
# Construir las imagenes (solo la primera vez o cuando cambien dependencias)
docker-compose build

# Iniciar todos los servicios
docker-compose up

# Cargar migraciones y seeders (solo la primera vez)
docker-compose exec backend npx sequelize-cli db:migrate
docker-compose exec backend npx sequelize-cli db:seed:all
```

Una vez que todo este corriendo, podes acceder a:

| Recurso | URL |
|---------|-----|
| Frontend (React) | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Health check | http://localhost:3001/health |
| Proxy (Caddy) | http://localhost |
| pgAdmin | http://localhost:5050 |

> **Tip:** Si queres correrlo en segundo plano, usa `docker-compose up -d`. Para ver los logs: `docker-compose logs -f`.

### Detener el proyecto

```bash
# Detener los servicios (mantiene los datos)
docker-compose down

# Detener y borrar todos los datos (base de datos, cache, etc.)
docker-compose down -v
```

## Estructura de archivos

```
proyecto/
├── docker-compose.yml              # Orquestacion de todos los servicios
├── .gitignore
├── README.md
├── Consigna.md
├── API_test.md
│
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.dev               # Imagen Docker para desarrollo
│   ├── package.json
│   ├── server.js                    # Punto de entrada del servidor Express
│   ├── config/
│   │   ├── config.js                # Config de Sequelize CLI (migraciones)
│   │   └── database.js              # Config de conexion a PostgreSQL
│   ├── models/
│   │   ├── Categoria.js
│   │   ├── index.js                 # Inicializa Sequelize y registra modelos
│   │   ├── MovimientoInventario.js
│   │   ├── Producto.js
│   │   └── User.js                  # Modelo de usuario
│   ├── controllers/
│   │   ├── authController.js        # Logica de registro, login y perfil
│   │   ├── categoriaController.js
│   │   ├── movimientoController.js
│   │   └── productoController.js
│   ├── middleware/
│   │   └── auth.js                  # Generacion y verificacion de JWT
│   ├── routes/
│   │   ├── index.js                 # Router principal, monta /api/auth
│   │   ├── auth.js                  # Rutas de autenticacion
│   │   ├── categorias.js
│   │   ├── movimientos.js
│   │   └── productos.js
│   ├── migrations/                  # Migraciones de base de datos
│   └── seeders/                     # Datos de prueba
│
├── frontend/
│   ├── .env.development
│   ├── craco.config.js
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js                 # Punto de entrada de React
│       ├── App.js                   # Componente principal
│       ├── components/              # Componentes reutilizables
│       │   ├── common/
│       │   ├── layout/
│       │   └── ui/
│       ├── pages/                   # Paginas de la aplicacion
│       ├── services/                # Llamadas a la API (axios)
│       ├── hooks/                   # Custom hooks de React
│       ├── utils/                   # Funciones auxiliares
│       ├── styles/                  # Estilos globales
│       └── assets/                  # Imagenes, iconos, etc.
│
├── database/
│   └── init.sql                     # Script que se ejecuta al crear la BD
│
├── caddy/
│   └── Caddyfile                    # Configuracion del reverse proxy
│
├── postman/                         # Pruebas en Postman
│
└── pgadmin/
    ├── Dockerfile
    ├── servers.json                 # Conexion preconfigurada al PostgreSQL
    ├── servers-with-password.json
    └── pgpass                       # Credenciales de la BD
```

## Base de Datos

### Acceso con pgAdmin (interfaz web)

pgAdmin ya viene preconfigurado para conectarse a la base de datos. Solo hay que entrar a:

- **URL:** http://localhost:5050
- **Email:** `admin@example.com`
- **Password:** `admin123`

La conexion al servidor PostgreSQL ya esta configurada automaticamente.

### Acceso por terminal

```bash
# Abrir una consola SQL directa
docker-compose exec database psql -U app_user -d app_database
```

### Credenciales de la BD

| Campo | Valor |
|-------|-------|
| Host (desde otro contenedor) | `database` |
| Host (desde tu maquina) | `localhost` |
| Puerto | `5432` |
| Base de datos | `app_database` |
| Usuario | `app_user` |
| Password | `app_password` |

### Endpoints de la API

Todas las rutas de inventario (`/api/productos`, `/api/categorias`, `/api/movimientos`) requieren un token JWT valido enviado en el header `Authorization: Bearer <token>`. El token se obtiene al registrarse o iniciar sesion.

#### Autenticacion (`/api/auth`)

| Metodo | Ruta | Protegida | Descripcion |
|--------|------|-----------|-------------|
| `POST` | `/api/auth/register` | No | Registrar un nuevo usuario |
| `POST` | `/api/auth/login` | No | Iniciar sesion y obtener token |
| `GET` | `/api/auth/perfil` | Si | Obtener datos del usuario logueado |

#### Productos (`/api/productos`)

| Metodo | Ruta | Protegida | Descripcion |
|--------|------|-----------|-------------|
| `GET` | `/api/productos` | Si | Listar productos. Query opcionales: `?search=<texto>` (busqueda por nombre, insensible a mayusculas) y `?categoriaId=<id>` (filtrar por categoria) |
| `GET` | `/api/productos/:id` | Si | Obtener un producto por su id, con su categoria y movimientos |
| `POST` | `/api/productos` | Si | Crear un producto |
| `PUT` | `/api/productos/:id` | Si | Actualizar un producto |
| `DELETE` | `/api/productos/:id` | Si | Eliminar un producto y sus movimientos asociados |

Ejemplo de body para crear/actualizar producto:
```json
{
  "nombre": "Lavandina Ayudin 1L",
  "descripcion": "Lavandina clasica para limpieza",
  "precio": 1500,
  "stock": 40,
  "stockMinimo": 10,
  "categoriaId": 1,
  "activo": true
}
```

#### Categorias (`/api/categorias`)

| Metodo | Ruta | Protegida | Descripcion |
|--------|------|-----------|-------------|
| `GET` | `/api/categorias` | Si | Listar categorias con sus productos |
| `GET` | `/api/categorias/:id` | Si | Obtener una categoria por su id con sus productos |
| `POST` | `/api/categorias` | Si | Crear una categoria (nombre unico) |
| `PUT` | `/api/categorias/:id` | Si | Actualizar una categoria |
| `DELETE` | `/api/categorias/:id` | Si | Eliminar una categoria |

Ejemplo de body para crear/actualizar categoria:
```json
{
  "nombre": "Limpieza",
  "descripcion": "Productos para limpieza del hogar y comercio"
}
```

#### Movimientos de inventario (`/api/movimientos`)

| Metodo | Ruta | Protegida | Descripcion |
|--------|------|-----------|-------------|
| `GET` | `/api/movimientos` | Si | Listar movimientos (ordenados por fecha descendente) con producto y usuario |
| `GET` | `/api/movimientos/:id` | Si | Obtener un movimiento por su id |
| `POST` | `/api/movimientos` | Si | Registrar un movimiento (ENTRADA o SALIDA) y actualizar el stock del producto |
| `PUT` | `/api/movimientos/:id` | Si | Actualizar un movimiento y reajustar el stock |
| `DELETE` | `/api/movimientos/:id` | Si | Eliminar un movimiento y revertir su efecto en el stock |

Ejemplo de body para crear movimiento:
```json
{
  "productoId": 1,
  "tipo": "ENTRADA",
  "cantidad": 10,
  "notas": "Reposicion de stock"
}
```
> `tipo` debe ser `ENTRADA` o `SALIDA`. En las `SALIDA` se valida que haya stock suficiente. El `usuarioId` se asigna automaticamente desde el token JWT (no se envia en el body).

### Ejemplos de uso

```bash
# 1. Registrar un usuario
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","email":"juan@test.com","password":"123456"}'

# 2. Iniciar sesion (copiar el token de la respuesta)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@test.com","password":"123456"}'

# 3. Listar productos (con token)
curl http://localhost:3001/api/productos \
  -H "Authorization: Bearer <token>"

# 4. Buscar productos por nombre y filtrar por categoria
curl "http://localhost:3001/api/productos?search=lav&categoriaId=1" \
  -H "Authorization: Bearer <token>"

# 5. Registrar una entrada de stock
curl -X POST http://localhost:3001/api/movimientos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"productoId":1,"tipo":"ENTRADA","cantidad":10,"notas":"Reposicion"}'
```

> Tambien existe una coleccion de Postman lista para importar en la carpeta `postman/`, con entornos para local y produccion.

## Explicacion de funciones principales

### Autenticacion
- **Registro** (`authController.register`): valida nombre, email y password, verifica que el email no este registrado, hashea la password con `bcrypt` (hook `beforeCreate` del modelo `User`) y devuelve un token JWT.
- **Login** (`authController.login`): busca el usuario por email y valida la password con `bcrypt.compare`.
- **Middleware `verificarToken`** (`middleware/auth.js`): extrae el token del header `Authorization: Bearer ...`, lo verifica con `jwt.verify` y guarda el payload en `req.user`. Protege todas las rutas de inventario.
- El modelo `User` sobrescribe `toJSON()` para nunca devolver la password en las respuestas.

### Gestion de productos (`productoController`)
- **`listarProductos`**: lista productos con su categoria y movimientos. Soporta busqueda por nombre (`?search`, insensible a mayusculas con `Op.iLike`) y filtro por categoria (`?categoriaId`).
- **`obtenerProducto`**: devuelve un producto por id con sus relaciones.
- **`crearProducto` / `actualizarProducto`**: validan nombre y categoria, y persisten el producto.
- **`eliminarProducto`**: dentro de una transaccion elimina primero los movimientos asociados y luego el producto.

### Categorizacion (`categoriaController`)
- CRUD completo de categorias. El nombre es unico (validacion del modelo y manejo de `SequelizeUniqueConstraintError`).
- Cada categoria se devuelve con sus productos asociados (`hasMany`).

### Control de stock y movimientos (`movimientoController`)
- El modelo `Producto` tiene `stock` y `stockMinimo`.
- **`crearMovimiento`**: dentro de una transaccion valida que el producto exista y que haya stock suficiente (en SALIDA), crea el movimiento con `usuarioId` tomado de `req.user`, y suma o resta el stock del producto.
- **`actualizarMovimiento`**: reverte el efecto del movimiento anterior y aplica el nuevo, validando que no genere stock negativo.
- **`eliminarMovimiento`**: reverte el efecto del movimiento en el stock antes de borrarlo.
- El campo `tipo` solo admite `ENTRADA` o `SALIDA` (validacion `isIn` del modelo).

### Relaciones entre modelos (`models/index.js`)
- `Categoria` 1:N `Producto` (una categoria tiene muchos productos; un producto pertenece a una categoria).
- `Producto` 1:N `MovimientoInventario` (un producto tiene muchos movimientos).
- `User` 1:N `MovimientoInventario` (un usuario registra muchos movimientos; cada movimiento queda asociado a quien lo creo).

### Migraciones y seeders
- Las tablas se crean via migraciones de Sequelize en `backend/migrations/` (`users`, `categorias`, `productos`, `movimientos`).
- Los seeders en `backend/seeders/` cargan datos de prueba: usuarios, categorias, productos y movimientos historicos. Para correrlos:
```bash
docker-compose exec backend npx sequelize-cli db:migrate
docker-compose exec backend npx sequelize-cli db:seed:all
```

## Tecnologias Utilizadas

### Backend
- **[Express](https://expressjs.com/)** — Framework web para Node.js
- **[Sequelize](https://sequelize.org/)** — ORM para bases de datos SQL
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** — Generacion y verificacion de JWT
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** — Hashing de passwords
- **[helmet](https://helmetjs.github.io/)** — Headers de seguridad HTTP
- **[cors](https://github.com/expressjs/cors)** — Configuracion de Cross-Origin Resource Sharing
- **[morgan](https://github.com/expressjs/morgan)** — Logging de peticiones HTTP

### Frontend
- **[React 18](https://react.dev/)** — Biblioteca para interfaces de usuario
- **[React Router](https://reactrouter.com/)** — Navegacion SPA
- **[Axios](https://axios-http.com/)** — Cliente HTTP
- **[React Query](https://tanstack.com/query)** — Manejo de estado del servidor
- **[React Hook Form](https://react-hook-form.com/)** — Manejo de formularios
- **[Tailwind CSS](https://tailwindcss.com/)** — Framework de estilos utilitario

### Infraestructura
- **[Docker](https://docs.docker.com/)** — Contenedores
- **[Docker Compose](https://docs.docker.com/compose/)** — Orquestacion multi-contenedor
- **[PostgreSQL 15](https://www.postgresql.org/docs/15/)** — Base de datos relacional
- **[Redis 7](https://redis.io/docs/)** — Cache en memoria
- **[Caddy 2](https://caddyserver.com/docs/)** — Reverse proxy
- **[pgAdmin 4](https://www.pgadmin.org/docs/)** — Administracion visual de PostgreSQL

## Licencia
Proyecto de la materia Programación III. Uso educativo y académico.
