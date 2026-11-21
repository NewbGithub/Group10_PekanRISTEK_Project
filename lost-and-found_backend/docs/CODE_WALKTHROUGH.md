# Code Walkthrough — what every file does

Tip: open each file next to this document. Every file also has comments written line by line.

## 1. The big picture: life of a request

```
Frontend ── HTTP ──▶ server.js (listen)
                       │
                     app.js
                       │  cors()            -> may this frontend call us?
                       │  express.json()    -> JSON body -> req.body
                       ▼
                routes/index.js ─▶ routes/reportRoutes.js
                       │  (POST only) middlewares/uploadImage.js (multer: file -> req.file)
                       ▼
        controllers/reportController.js
                       │  validators/reportValidator.js   -> 400 if input is wrong
                       ▼
        services/reportService.js          (business rules)
              │                    │
   services/imageService.js   repositories/index.js ─▶ memory  OR  prisma(PostgreSQL)
        (Cloudinary)                  │
                       ▼
        utils/toPublicReport.js  (privacy filter)  ──▶ utils/response.js ──▶ JSON response
                       │
          any error ──▶ middlewares/errorHandler.js
```

## 2. URL table

| Method | URL | Router file | Controller function | Success |
|--------|-----|-------------|---------------------|---------|
| GET | `/health` | `app.js` | inline | 200 |
| GET | `/reports` | `routes/reportRoutes.js` | `getReports` | 200 |
| GET | `/reports/:id` | `routes/reportRoutes.js` | `getReportById` | 200 / 404 |
| POST | `/reports` | `routes/reportRoutes.js` | `createReport` | 201 / 400 / 413 / 415 |
| GET | `/categories` | `routes/referenceRoutes.js` | `getCategories` | 200 |
| GET | `/locations` | `routes/referenceRoutes.js` | `getLocations` | 200 |
| any other | | `middlewares/errorHandler.js` (`notFound`) | | 404 |

Local base URL: `http://localhost:3000`. Production: your Render URL.

## 3. File by file

### `src/server.js`: starts the program
- `require('dotenv').config()` loads `.env` into `process.env`. It must be first.
- `app.listen(config.port, ...)` opens the port and starts waiting for requests; `server` holds the running server.
- `shutdown` + `process.on('SIGTERM' | 'SIGINT')`: when the host stops the app (or you press `Ctrl + C`), stop accepting requests, close the database connection (`repository.disconnect()`), then `process.exit(0)`.

### `src/app.js`: assembles Express
- `express()` creates the app; `app.disable('x-powered-by')` hides the "Express" header.
- `cors({...})`: allows only origins in `CORS_ORIGIN`; `exposedHeaders: ['Location']` lets the frontend read that header.
- `express.json()`: parses JSON bodies.
- `app.get('/health')`: simple liveness check.
- `app.use(routes)`: plugs in all real endpoints.
- `app.use(notFound)`, `app.use(errorHandler)`: must be LAST. Express reads top to bottom; they catch what nothing above handled.

### `src/config.js`: all environment variables in one place
Reads `process.env`, applies defaults (`PORT` 3000, `STORAGE` memory, timezone Asia/Jakarta), turns `CORS_ORIGIN` into an array, and **fails fast** (throws) if `STORAGE` is wrong or `DATABASE_URL` is missing in prisma mode. `cloudinaryConfigured` is true only when all three Cloudinary values exist.

### `src/constants.js`
Fixed values (enums, pagination limits, image rules, field length limits). Change a rule here and every file follows.

### `src/routes/*`
- `routes/index.js`: `router.use('/reports', reportRoutes)` prefixes every route inside with `/reports`.
- `routes/reportRoutes.js`: `router.get('/')` -> `GET /reports`; `router.get('/:id')` -> `GET /reports/:id` (`:id` becomes `req.params.id`); `router.post('/', uploadImage, createReport)` runs `uploadImage` BEFORE the controller. No `put/patch/delete` exist on purpose.
- `routes/referenceRoutes.js`: `/categories` and `/locations`.

### `src/controllers/*`: "receptionists"
`reportController.js` does the same 4 steps each time: read input (`req.query`, `req.params`, `req.body`, `req.file`) -> validate (throw `AppError(400)` if errors) -> call the service -> `sendSuccess(...)`.
`createReport` additionally sets `res.location(...)` and uses status 201.
`referenceController.js` returns the two lists.
`asyncHandler(...)` wraps every controller so any `throw`/rejected promise reaches `errorHandler`.

### `src/validators/reportValidator.js`: "the security guard"
- `validateListQuery(query)`: reads `q, type, category, location, sort, page, limit`; blank = not provided; wrong values push `{field, message}`. `readInt` enforces ranges (`limit` 1-50).
- `validateCreateBody(body)`: required text fields with length limits; `type`/`publicContactMethod` must be in the allowed lists; `eventDate` must be real (`isRealDate`) and not after today in `APP_TIMEZONE` (`todayIn`); each contact has a rule (`CONTACT_RULES`) that normalizes (e.g. removes `@`, spaces) and checks format; the **selected** contact must be filled.
- Returns `{ errors, value }`: errors empty means valid and `value` is the cleaned data.

### `src/services/reportService.js`: business rules
- `listReports`: asks the repository for items + total, computes `totalPages`, `hasNextPage`, `hasPrevPage`, and maps every item with `toPublicReport`.
- `getReportById`: 404 `AppError` if missing.
- `createReport`: (1) category and location slugs must exist; (2) upload the photo only AFTER validation passes; (3) save; if saving fails, delete the already-uploaded photo (no orphan files); (4) return the public shape.

### `src/services/imageService.js`
`getClient()` lazily loads and configures Cloudinary (or returns `null` if not configured). `uploadImage(file)` streams the in-memory `file.buffer` to Cloudinary folder `lostfound/reports` and returns `{url, publicId}`. `deleteImage(publicId)` is a cleanup that never throws.

### `src/repositories/*`: where data lives
- `index.js`: picks `memory` or `prisma` using `STORAGE`.
- `reportRepository.memory.js` (Checkpoint 2): loads `mock-data/*.json` into arrays; `findMany` filters (`matches`), sorts (`comparator`), slices a page; `create` pushes a new record with `crypto.randomUUID()`. Data disappears on restart.
- `reportRepository.prisma.js` (Checkpoint 3): `buildWhere` turns filters into a Prisma `where`; `findMany` runs `findMany` + `count` in a `$transaction`; `skip`/`take` implement pagination; `include` brings category and location (like a SQL JOIN).
Both expose the same functions, so no other file changes when you switch.

### `src/middlewares/uploadImage.js`
multer (memory storage, 5 MB, 1 file, field `image`) + two checks: mimetype filter and a real "magic bytes" check (`utils/imageSignature.js`). Converts multer errors to `AppError` (413 too large, 415 wrong type, 400 other upload problems).

### `src/middlewares/errorHandler.js`
`notFound` -> 404 JSON. `errorHandler` (4 parameters = Express error handler) turns `AppError` into its status/message/errors, bad JSON into 400, anything unexpected into a generic 500 (details only in the server log).

### `src/utils/*`
- `AppError.js`: error with an HTTP status.
- `asyncHandler.js`: forwards async errors to Express.
- `response.js`: `sendSuccess` keeps the success envelope identical everywhere.
- `contactMethods.js`: `WHATSAPP -> contactWhatsapp` etc.
- `toPublicReport.js`: the ONLY way report data leaves the API; picks the one selected contact and drops `imagePublicId` and the other contacts.
- `imageSignature.js`: detects JPEG/PNG/WEBP by their first bytes.

### `prisma/schema.prisma`
Defines enums, the `Category`, `Location`, `Report` models and relations (`@relation`), column types (`@db.VarChar`, `@db.Date`), uniqueness (`@unique`), defaults (`@default(uuid())`, `now()`), auto-updated `updatedAt` and indexes (`@@index`) for the columns we filter/sort on.

### `prisma/seed.js`
`upsert` categories and locations (safe to run repeatedly). With `--with-reports`, inserts the 12 demo reports (only if the table is empty), storing only each report's public contact.

### `mock-data/*`, `docs/*`, `test/*`
Shared mock data; planning and guides; automated tests (`npm test`).

## 4. Why these design choices?
- **Repository layer**: Checkpoint 2 (memory) and 3 (PostgreSQL) share all other code; switching = change `STORAGE`.
- **Single privacy mapper**: impossible to leak private contacts by forgetting a field somewhere.
- **Validate before upload**: no wasted Cloudinary uploads for bad requests.
- **Consistent envelope**: frontend code can treat every response the same way.
- **No edit/delete routes**: public users cannot change reports (a Checkpoint 3 requirement).

## 5. Small JavaScript concepts used
- `async/await`: wait for slow things (database, Cloudinary) without blocking the server.
- `Promise.all([...])`: run independent async tasks at the same time.
- Destructuring `const { a, b } = obj`, spread `{ ...obj }`, optional `a ?? b` ("a unless it is null/undefined").
- Arrow functions `(x) => x * 2`; closures like `asyncHandler(fn)` returning a new function.
- `module.exports` / `require`: how files share code (CommonJS).
