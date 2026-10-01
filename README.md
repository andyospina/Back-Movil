# ReviewLab Backend — Sprint 8

API REST con **Express + Sequelize + PostgreSQL** (SQLite opcional para pruebas), datos iniciales con **Faker** y colección **Postman**. Sigue la estructura del video del curso (Express + PostgreSQL): módulos ES, `src/{controllers,database,models,routes}`, `app.js` + `index.js`.

## Ejecución

```bash
cd backend
npm install
cp .env.example .env      # ajusta puerto y contraseña de PostgreSQL
# crear la BD una vez (pgAdmin/DBeaver o):  createdb reviewlab
npm run dev               # nodemon, recarga al guardar
npm start                 # sin nodemon
npm test                  # pruebas automáticas (SQLite en memoria, no requiere Postgres)
```

Sin PostgreSQL: `DB_DIALECT=sqlite` en `.env`.

Al arrancar: conecta (`authenticate` + `SELECT 1`) → `setupRelations()` → `sync({ force })` → carga datos iniciales con Faker. `force: true` (por defecto) recrea las tablas en cada arranque, útil solo en desarrollo; con `DB_FORCE_SYNC=false` los datos persisten y cada loader solo inserta si su tabla está vacía.

## Estructura

- `src/database/database.js` — conexión Sequelize por variables de entorno.
- `src/database/init-data.js` — datos iniciales (Faker, semilla fija) por entidad.
- `src/models/` — `user`, `tweet`, `follower`, `product` (Product y Review) y `relations.js`.
- `src/controllers/` — `users`, `tweets`, `catalog` (products/reviews) y `errors.js`.
- `src/routes/` — `user.routes.js`, `tweets.js`, `catalog.routes.js`.

## Modelos y relaciones

| Modelo | Campos principales |
|---|---|
| User | username (único), email (único, validado), password, name, profileImage, website (URL), bio, followersCount |
| Tweet | content (≤280), imageUrl, likes, retweets, commentsCount, userId, parentTweetId |
| Follower (intermedia) | followerId, followingId |
| Product | name, category, rating |
| Review | rating (1-5), title, body, recommended, userId, productId |

- **1-M:** User→Tweet (FK `userId`), User→Review, Product→Review. Todas con `onDelete: CASCADE` + `hooks: true`.
- **M-M autoreferencial:** User↔User mediante `Follower` (alias `following` / `followers`).
- **1-M autoreferencial:** Tweet→Tweet por `parentTweetId` (alias `replies` / `parentTweet`); `null` = tweet original. Borrar un tweet borra sus respuestas.

Product y Review son las entidades que ya existían en ReviewLab (ver `docs/diagrama-entidad-relacion.md`).

## Endpoints (base `http://localhost:3000`)

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/users` | Listar / crear |
| GET/PUT/DELETE | `/users/:id` | Detalle / actualizar / eliminar |
| GET | `/users/:id/tweets` | Tweets del usuario (con datos del autor) |
| GET | `/users/:id/followers`, `/users/:id/following` | Seguidores / seguidos |
| POST/DELETE | `/users/:id/follow/:targetId` | Seguir / dejar de seguir |
| GET/POST | `/tweets` | Listar (incluye autor) / crear |
| GET/PUT/DELETE | `/tweets/:id` | Detalle / actualizar / eliminar |
| GET | `/tweets/:id/replies` | Respuestas, más recientes primero |
| GET/POST/PUT/DELETE | `/products`, `/reviews` (+ `/:id`) | CRUD de catálogo |

Códigos: 200, 201, 204, 400 (datos o ID inválidos, relación inexistente), 404 (recurso inexistente), 500.
`POST /tweets` exige `content` y un `userId` existente (404 si no); si trae `parentTweetId`, el tweet padre debe existir (404 si no). Las respuestas de usuarios nunca incluyen `password`.

## Postman

Importa `postman/Sprint8.postman_collection.json` (variable `baseUrl`). Carpetas: Users, Relaciones, Tweets, Otros recursos, cada una con casos de error. Cada request trae un test de código HTTP. Arranca el servidor con los datos iniciales recién cargados y ejecuta la colección en orden (Collection Runner).
