# Sistema Web Full-Stack con Docker

Proyecto base para el trabajo final de Programacion 3. Es una aplicacion web completa con frontend, backend, base de datos y servicios auxiliares, todo orquestado con Docker Compose.

**Tu trabajo consiste en completar las partes marcadas con `// TODO` en el backend** (autenticacion JWT) y desarrollar las funcionalidades adicionales que se indiquen.

---

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
| **Frontend** | React 18 | 3000 | Interfaz de usuario |
| **Backend** | Express + Sequelize | 3001 | API REST |
| **Database** | PostgreSQL 15 | 5432 | Base de datos relacional |
| **Cache** | Redis 7 | 6379 | Cache y sesiones |
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

---

## Estructura del Proyecto

```
proyecto/
├── docker-compose.yml              # Orquestacion de todos los servicios
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile.dev               # Imagen Docker para desarrollo
│   ├── package.json
│   ├── server.js                    # Punto de entrada del servidor Express
│   ├── config/
│   │   ├── config.js                # Config de Sequelize CLI (migraciones)
│   │   └── database.js              # Config de conexion a PostgreSQL
│   ├── models/
│   │   ├── index.js                 # Inicializa Sequelize y registra modelos
│   │   └── User.js                  # Modelo de usuario (tiene TODOs)
│   ├── controllers/
│   │   └── authController.js        # Logica de registro, login y perfil (tiene TODOs)
│   ├── middleware/
│   │   └── auth.js                  # Generacion y verificacion de JWT (tiene TODOs)
│   ├── routes/
│   │   ├── index.js                 # Router principal, monta /api/auth
│   │   └── auth.js                  # Rutas de autenticacion
│   ├── migrations/                  # Migraciones de base de datos
│   ├── seeders/                     # Datos de prueba
│   ├── tests/                       # Tests
│   └── utils/                       # Funciones auxiliares
│
├── frontend/
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
└── pgadmin/
    ├── Dockerfile
    ├── servers.json                 # Conexion preconfigurada al PostgreSQL
    └── pgpass                       # Credenciales de la BD
```

---

## Que Hay Que Completar: Autenticacion JWT

El sistema de autenticacion esta parcialmente implementado. Hay **8 TODOs** distribuidos en 3 archivos que deben ser completados para que funcione.

### Como funciona JWT (teoria)

1. El usuario se **registra** enviando nombre, email y password.
2. El servidor **hashea** la password (nunca se guarda en texto plano) y crea el usuario en la BD.
3. El servidor genera un **token JWT** (un string firmado que contiene el id y email del usuario) y se lo devuelve.
4. Para las siguientes peticiones, el cliente envia el token en el header `Authorization: Bearer <token>`.
5. El servidor **verifica** que el token sea valido y no haya expirado antes de dar acceso.

### Endpoints de la API

| Metodo | Ruta | Protegida | Descripcion |
|--------|------|-----------|-------------|
| `POST` | `/api/auth/register` | No | Registrar un nuevo usuario |
| `POST` | `/api/auth/login` | No | Iniciar sesion |
| `GET` | `/api/auth/perfil` | Si | Obtener datos del usuario logueado |

#### Ejemplo: Registro

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan", "email": "juan@test.com", "password": "123456"}'
```

Respuesta esperada (una vez completados los TODOs):
```json
{
  "message": "Usuario registrado exitosamente",
  "user": { "id": 1, "nombre": "Juan", "email": "juan@test.com" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Ejemplo: Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "juan@test.com", "password": "123456"}'
```

#### Ejemplo: Acceder al perfil (ruta protegida)

```bash
curl http://localhost:3001/api/auth/perfil \
  -H "Authorization: Bearer <token_obtenido_en_login>"
```

### Archivos con TODOs

A continuacion se detalla cada TODO. **No cambies la estructura de los archivos**, solo completa las partes indicadas.

---

### 1. `backend/models/User.js` — Modelo de usuario

Este archivo define la tabla `users` en la base de datos usando Sequelize.

**TODO 1 — Hook `beforeCreate`:** Antes de guardar un usuario nuevo, hay que hashear la password para no almacenarla en texto plano.

```javascript
// Pista: bcrypt.hash(user.password, 10) devuelve una promesa con el hash.
// Hay que asignar el resultado a user.password.
```

**TODO 2 — Metodo `validarPassword`:** Este metodo compara una password en texto plano con el hash almacenado. Se usa en el login.

```javascript
// Pista: bcrypt.compare(password, this.password) devuelve true o false.
```

---

### 2. `backend/middleware/auth.js` — Generacion y verificacion de tokens

Este archivo exporta dos funciones: una para crear tokens y otra para verificar que un request tenga un token valido.

**TODO 3 — `generarToken`:** Crear un JWT firmado con los datos del usuario.

```javascript
// Pista: jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
```

**TODO 4 — Extraer el token del header:** El header `Authorization` tiene el formato `"Bearer eyJhbG..."`. Hay que extraer solo la parte del token.

```javascript
// Pista: authHeader.split(' ') devuelve un array ["Bearer", "eyJhbG..."].
// El token esta en la posicion [1].
```

**TODO 5 — `verificarToken`:** Decodificar el token y, si es valido, guardar los datos del usuario en `req.user` para que los controladores puedan usarlos.

```javascript
// Pista: jwt.verify(token, JWT_SECRET) devuelve el payload decodificado.
// Guardar el resultado en req.user y llamar a next().
```

---

### 3. `backend/controllers/authController.js` — Logica de registro, login y perfil

Este archivo tiene la logica de negocio de cada endpoint.

**TODO 6 — `register`:** Crear el usuario en la base de datos.

```javascript
// Pista: await User.create({ nombre, email, password })
// El hook beforeCreate se encarga de hashear la password automaticamente.
```

**TODO 7 — `login`:** Buscar al usuario por email y validar su password.

```javascript
// Pista para buscar: await User.findOne({ where: { email } })
// Pista para validar: await user.validarPassword(password)
```

**TODO 8 — `perfil`:** Obtener el usuario desde la BD usando el id que el middleware puso en `req.user`.

```javascript
// Pista: await User.findByPk(req.user.id)
```

---

### Como verificar que funciona

Una vez completados los 8 TODOs:

```bash
# 1. Levantar los servicios
docker-compose up

# 2. Registrar un usuario
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test", "email": "test@test.com", "password": "123456"}'

# 3. Hacer login (copiar el token de la respuesta)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "123456"}'

# 4. Acceder al perfil con el token
curl http://localhost:3001/api/auth/perfil \
  -H "Authorization: Bearer PEGAR_TOKEN_AQUI"
```

Si el paso 4 devuelve los datos del usuario, la autenticacion esta funcionando correctamente.

---

## Desarrollo con Hot Reload

Cuando los servicios estan corriendo, los cambios en el codigo se aplican automaticamente:

- **Frontend (React):** Cualquier cambio en `frontend/src/` se refleja al instante en el navegador gracias a Fast Refresh.
- **Backend (Express):** Cualquier cambio en `backend/` reinicia automaticamente el servidor gracias a nodemon.
- **Base de datos:** Los datos persisten entre reinicios gracias a los volumenes de Docker. Solo se pierden si ejecutas `docker-compose down -v`.

### Flujo de trabajo

1. Edita los archivos en tu editor (VS Code, etc.)
2. Los cambios se detectan automaticamente dentro del contenedor
3. El servicio correspondiente se recarga
4. Verifica en el navegador o con `curl`

---

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

### Migraciones y Seeders con Sequelize

Las migraciones permiten versionar cambios en la estructura de la BD. Los seeders insertan datos de prueba.

```bash
# Entrar al contenedor del backend
docker-compose exec backend sh

# Crear una nueva migracion
npx sequelize-cli migration:generate --name create-users

# Ejecutar migraciones pendientes
npx sequelize-cli db:migrate

# Deshacer la ultima migracion
npx sequelize-cli db:migrate:undo

# Ver estado de migraciones
npx sequelize-cli db:migrate:status

# Crear un seeder
npx sequelize-cli seed:generate --name demo-users

# Ejecutar todos los seeders
npx sequelize-cli db:seed:all

# Salir del contenedor
exit
```

### Backup y restauracion

```bash
# Exportar la base de datos
docker-compose exec database pg_dump -U app_user app_database > backup.sql

# Importar un backup
docker-compose exec -T database psql -U app_user -d app_database < backup.sql
```

---

## Variables de Entorno

Las variables de entorno del backend estan definidas directamente en `docker-compose.yml`, dentro del servicio `backend`. Las mas importantes son:

| Variable | Valor | Descripcion |
|----------|-------|-------------|
| `NODE_ENV` | `development` | Entorno de ejecucion |
| `PORT` | `3001` | Puerto del servidor Express |
| `DB_HOST` | `database` | Nombre del servicio de PostgreSQL en Docker |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_NAME` | `app_database` | Nombre de la base de datos |
| `DB_USER` | `app_user` | Usuario de la BD |
| `DB_PASSWORD` | `app_password` | Password de la BD |
| `JWT_SECRET` | `your_jwt_secret_here` | Clave secreta para firmar los tokens JWT |
| `CORS_ORIGIN` | `http://localhost:3000` | Origen permitido para peticiones del frontend |

> **Nota:** En un entorno de produccion, estas variables **nunca** deben estar en el codigo ni en el repositorio. Se usan archivos `.env` o secrets de Docker.

---

## Comandos Utiles

### Docker Compose

```bash
# Ver el estado de los contenedores
docker-compose ps

# Ver logs de un servicio en particular
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Reiniciar un servicio sin detener los demas
docker-compose restart backend

# Reconstruir un servicio (cuando cambias package.json o el Dockerfile)
docker-compose up --build backend

# Entrar al shell de un contenedor
docker-compose exec backend sh
docker-compose exec frontend sh

# Ver las variables de entorno dentro de un contenedor
docker-compose exec backend env
```

### Limpieza

```bash
# Detener servicios y borrar datos
docker-compose down -v

# Reconstruir todo desde cero (cuando nada funciona)
docker-compose down -v --rmi all
docker-compose build --no-cache
docker-compose up

# Liberar espacio de Docker en el sistema
docker system prune -a
```

---

## Problemas Comunes

### El backend no conecta a la base de datos

La base de datos tarda unos segundos en iniciar. El `docker-compose.yml` tiene un `healthcheck` para que el backend espere, pero a veces no alcanza.

```bash
# Verificar que la BD este corriendo
docker-compose ps database

# Ver los logs de PostgreSQL
docker-compose logs database

# Solucion nuclear: reiniciar con volumenes limpios
docker-compose down -v
docker-compose up --build
```

### Un puerto ya esta en uso

Si otro programa ya esta usando el puerto 3000, 3001 u 80:

```bash
# Ver que proceso usa el puerto
lsof -i :3000
# o en Linux
netstat -tlnp | grep :3000
```

Podes cambiar el puerto externo en `docker-compose.yml`. Por ejemplo, para mover el frontend al puerto 3002:

```yaml
ports:
  - "3002:3000"  # externo:interno
```

### Hot reload no funciona

Verificar que estas variables esten en `docker-compose.yml` dentro del servicio `frontend`:

```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
  - WATCHPACK_POLLING=true
```

Si sigue sin funcionar, reiniciar el servicio: `docker-compose restart frontend`.

### Error de permisos en Docker

```bash
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Error de credenciales de Docker Desktop (Windows/WSL)

```
error getting credentials - err: exec: "docker-credential-desktop.exe"
```

```bash
# Hacer backup de la config de Docker
cp ~/.docker/config.json ~/.docker/config.json.backup

# Resetear la config
echo '{}' > ~/.docker/config.json

# Intentar de nuevo
docker-compose build
```

---

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

---
---

# Secciones Opcionales / Avanzadas

Las siguientes secciones cubren temas que van mas alla del desarrollo local. No son necesarias para completar el trabajo, pero son utiles si queres exponer tu proyecto a internet o desplegarlo en un servidor real.

---

## Opcional: Configurar Caddy para Produccion con HTTPS

### Que es Caddy y por que lo usamos

Caddy es un servidor web moderno que funciona como **reverse proxy** (intermediario entre el usuario y tus servicios). En este proyecto, Caddy recibe todas las peticiones en el puerto 80 y decide a donde mandarlas:

- Si la URL empieza con `/api` o `/health` → la envia al **backend** (Express, puerto 3001)
- Cualquier otra URL → la envia al **frontend** (React, puerto 3000)

```
Usuario → Caddy (:80) → /api/*    → Backend (:3001)
                       → /*        → Frontend (:3000)
```

La ventaja principal de Caddy sobre otros servidores como Nginx o Apache es que **configura HTTPS automaticamente**. Cuando le das un nombre de dominio, Caddy se encarga solo de:

1. Pedir un certificado SSL gratuito a Let's Encrypt
2. Instalarlo
3. Renovarlo automaticamente cada ~60 dias
4. Redirigir HTTP → HTTPS

Con Nginx, todo eso hay que configurarlo manualmente.

### Que se necesita para HTTPS

Para que Caddy active HTTPS automatico necesitas **dos cosas**:

1. **Un nombre de dominio** que apunte a la IP de tu servidor (por ejemplo `miproyecto.com` o `miproyecto.duckdns.org`)
2. **Que los puertos 80 y 443 esten abiertos** y accesibles desde internet

> **Nota:** HTTPS no funciona con `localhost` ni con direcciones IP directas. Se necesita un dominio.

### Configurar Caddy con un dominio

Si tenes un dominio apuntando a tu servidor, la configuracion es asi de simple. Editar `caddy/Caddyfile`:

```
miproyecto.com {
    handle /api/* {
        reverse_proxy backend:3001
    }

    handle /health {
        reverse_proxy backend:3001
    }

    handle {
        reverse_proxy frontend:3000
    }
}
```

El unico cambio respecto a la configuracion de desarrollo es reemplazar `:80` por el nombre de dominio. Caddy hace todo lo demas automaticamente.

Tambien hay que actualizar el servicio en `docker-compose.yml` para exponer el puerto 443 (HTTPS) y darle un volumen para guardar los certificados:

```yaml
caddy:
  image: caddy:2-alpine
  container_name: app_caddy
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./caddy/Caddyfile:/etc/caddy/Caddyfile
    - caddy_data:/data
    - caddy_config:/config
```

Y agregar `caddy_config` a la seccion `volumes` del final del archivo:

```yaml
volumes:
  # ...los que ya estan...
  caddy_config:
```

### Que es DDNS (DNS Dinamico)

Para entender DDNS, primero hay que entender el problema que resuelve.

**El problema:** cuando contras un dominio (por ejemplo en Namecheap o Google Domains), tenes que decirle a que direccion IP apunta. Pero la mayoria de las conexiones hogareñas tienen **IP dinamica**: tu proveedor de internet te cambia la IP periodicamente (cada horas o dias). Si tu IP cambia, el dominio deja de apuntar al lugar correcto y tu sitio queda inaccesible.

**La solucion: DNS Dinamico (DDNS).** Es un servicio que actualiza automaticamente la relacion dominio → IP. Funciona asi:

1. Te registras en un servicio DDNS y te dan un subdominio (ejemplo: `miproyecto.duckdns.org`)
2. Instalas un cliente en tu computadora/servidor que cada pocos minutos le avisa al servicio de DDNS cual es tu IP actual
3. Si tu IP cambia, el servicio actualiza el registro DNS automaticamente

```
Tu PC (IP cambia) → Cliente DDNS avisa → Servicio DDNS actualiza → Dominio siempre apunta a tu IP
```

### Servicios DDNS gratuitos

| Servicio | Subdominio que te dan | Notas |
|----------|----------------------|-------|
| [Duck DNS](https://www.duckdns.org/) | `tunombre.duckdns.org` | Gratuito, simple, popular |
| [No-IP](https://www.noip.com/) | `tunombre.ddns.net` | Gratuito con renovacion mensual |
| [Dynu](https://www.dynu.com/) | `tunombre.dynu.net` | Gratuito, soporta dominios propios |
| [Afraid.org](https://freedns.afraid.org/) | Varios disponibles | Gratuito, muchas opciones de subdominio |

### Ejemplo completo con Duck DNS

**Paso 1:** Crear una cuenta en [duckdns.org](https://www.duckdns.org/) (se puede entrar con Google/GitHub).

**Paso 2:** Crear un subdominio, por ejemplo `miprog3`. Esto te da `miprog3.duckdns.org`.

**Paso 3:** Agregar un servicio DDNS al `docker-compose.yml` para que actualice tu IP automaticamente:

```yaml
duckdns:
  image: lscr.io/linuxserver/duckdns:latest
  container_name: app_duckdns
  restart: unless-stopped
  environment:
    - SUBDOMAINS=miprog3
    - TOKEN=tu-token-de-duckdns
    - UPDATE_IP=ipv4
    - TZ=America/Argentina/Buenos_Aires
```

> El token lo encontras en tu panel de Duck DNS despues de loguearte.

**Paso 4:** Actualizar el `Caddyfile` para usar tu subdominio:

```
miprog3.duckdns.org {
    handle /api/* {
        reverse_proxy backend:3001
    }

    handle /health {
        reverse_proxy backend:3001
    }

    handle {
        reverse_proxy frontend:3000
    }
}
```

**Paso 5:** Abrir los puertos 80 y 443 en tu router (port forwarding) hacia la IP local de tu computadora.

Con esto, cualquier persona puede entrar a `https://miprog3.duckdns.org` desde cualquier lugar y ver tu proyecto corriendo con HTTPS.

### Consideraciones importantes

- **Port forwarding:** Tu router por defecto bloquea conexiones entrantes. Tenes que entrar a la configuracion del router (generalmente `192.168.1.1`) y redirigir los puertos 80 y 443 hacia la IP local de tu maquina.
- **Firewall:** Si usas Linux, asegurate de que `ufw` u otro firewall permita los puertos 80 y 443.
- **Seguridad:** Exponer tu computadora a internet tiene riesgos. Asegurate de cambiar todas las contraseñas por defecto antes de hacerlo (base de datos, pgAdmin, JWT secret).

---

## Opcional: Despliegue en AWS con EC2

### Que es AWS

Amazon Web Services (AWS) es la plataforma de servicios en la nube mas grande del mundo. Ofrece servidores, bases de datos, almacenamiento, redes y cientos de servicios mas que se pagan por uso. En vez de comprar un servidor fisico, alquilas uno virtual que podes crear, configurar y destruir en minutos.

### Que es el Free Tier

AWS tiene un programa llamado **Free Tier** (nivel gratuito) que permite usar varios servicios **sin costo** durante los primeros 12 meses despues de crear la cuenta. El objetivo es que puedas aprender y experimentar sin gastar dinero.

> **Importante:** El Free Tier tiene limites. Si los superas, AWS te cobra automaticamente a la tarjeta de credito que registraste. Siempre controla tu uso en la consola de Billing.

### Que incluye el Free Tier (lo mas relevante para este proyecto)

| Servicio | Que te da gratis | Duracion |
|----------|-----------------|----------|
| **EC2** (servidor virtual) | 750 horas/mes de instancia `t2.micro` o `t3.micro` (1 vCPU, 1 GB RAM) | 12 meses |
| **RDS** (base de datos) | 750 horas/mes de instancia `db.t3.micro` con 20 GB de almacenamiento | 12 meses |
| **S3** (almacenamiento) | 5 GB de almacenamiento, 20.000 requests GET, 2.000 PUT | 12 meses |
| **Elastic IP** | 1 IP publica gratuita **mientras este asociada a una instancia corriendo** | 12 meses |
| **Data Transfer** | 100 GB de salida a internet por mes | 12 meses |

> 750 horas/mes = suficiente para tener **1 instancia corriendo 24/7** todo el mes (un mes tiene ~730 horas).

### Que es EC2

EC2 (Elastic Compute Cloud) es el servicio de servidores virtuales de AWS. Cada servidor se llama **instancia**. Una instancia es basicamente una computadora en la nube con Linux (o Windows) donde podes instalar lo que quieras.

La instancia `t2.micro` del Free Tier tiene:
- 1 vCPU
- 1 GB de RAM
- 8 GB de disco (ampliable hasta 30 GB gratis)
- Conexion a internet

Es suficiente para correr este proyecto en modo desarrollo o para un deploy basico.

### Pasos para desplegar este proyecto en EC2

#### 1. Crear una cuenta en AWS

Ir a [aws.amazon.com](https://aws.amazon.com/) y crear una cuenta. Se necesita una tarjeta de credito/debito (se hace un cargo temporal de ~1 USD que se revierte).

#### 2. Lanzar una instancia EC2

1. Entrar a la [consola de EC2](https://console.aws.amazon.com/ec2/)
2. Click en **Launch Instance**
3. Configurar:
   - **Nombre:** `prog3-final` (o el que quieras)
   - **AMI:** Ubuntu Server 24.04 LTS (Free Tier eligible)
   - **Instance type:** `t2.micro` (Free Tier eligible)
   - **Key pair:** Crear un nuevo par de claves, descargar el archivo `.pem` (lo vas a necesitar para conectarte por SSH). **No lo pierdas.**
   - **Network settings:** Habilitar trafico HTTP (puerto 80) y HTTPS (puerto 443). Tambien asegurarse de que SSH (puerto 22) este habilitado.
   - **Storage:** 20 GB gp3 (dentro del Free Tier)
4. Click en **Launch Instance**

#### 3. Conectarse por SSH

```bash
# Dar permisos al archivo de clave
chmod 400 tu-clave.pem

# Conectarse (reemplazar con la IP publica de tu instancia)
ssh -i tu-clave.pem ubuntu@54.XXX.XXX.XXX
```

> La IP publica la encontras en la consola de EC2, en los detalles de tu instancia.

#### 4. Instalar Docker en la instancia

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sudo sh

# Agregar tu usuario al grupo docker (para no usar sudo)
sudo usermod -aG docker $USER

# Cerrar sesion y volver a entrar para que tome efecto
exit
# Volver a conectarse con ssh...

# Verificar que Docker funciona
docker --version
docker compose version
```

#### 5. Clonar el proyecto y levantarlo

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

# Levantar los servicios
docker compose up -d

# Verificar que todo esta corriendo
docker compose ps
```

En este punto, tu proyecto esta accesible en `http://IP-PUBLICA-DE-TU-INSTANCIA`.

#### 6. (Opcional) Asociar un dominio

Si tenes un dominio o un DDNS, podes apuntarlo a la IP publica de tu instancia EC2 y configurar Caddy con HTTPS como se explico en la seccion anterior.

> **Nota sobre Elastic IP:** La IP publica de una instancia EC2 cambia cada vez que la detenes y la volves a iniciar. Para tener una IP fija, podes asignar una **Elastic IP** (gratuita mientras la instancia este corriendo). Se hace desde la consola de EC2 → Elastic IPs → Allocate → Associate.

### Consideraciones sobre costos

- **No dejes instancias corriendo si no las usas.** Si bien el Free Tier da 750 horas/mes, si lanzas 2 instancias, cada una consume horas por separado (2 instancias × 375 horas = 750 horas en medio mes).
- **Elastic IP sin instancia = costo.** Si reservas una Elastic IP y no la asocias a una instancia corriendo, AWS te cobra ~$3.65/mes.
- **Configura alertas de Billing.** En la consola de AWS → Billing → Budgets, podes crear una alerta que te avise si tu gasto supera cierto monto (por ejemplo, $1 USD).
- **Cuando termines el cuatrimestre**, elimina la instancia y libera la Elastic IP para no tener cargos inesperados.

### Alternativas gratuitas a AWS

Si AWS te parece complejo o no queres poner una tarjeta de credito, hay alternativas con planes gratuitos mas simples:

| Plataforma | Plan gratuito | Ideal para |
|------------|--------------|------------|
| [Railway](https://railway.app/) | $5 USD de credito/mes | Deploy rapido con Docker |
| [Render](https://render.com/) | Servicios web gratuitos (se apagan por inactividad) | Proyectos simples |
| [Fly.io](https://fly.io/) | 3 VMs compartidas gratuitas | Contenedores Docker |
| [Oracle Cloud](https://www.oracle.com/cloud/free/) | 2 instancias ARM gratuitas **para siempre** (4 CPU, 24 GB RAM total) | Alternativa a EC2 sin limite de 12 meses |
