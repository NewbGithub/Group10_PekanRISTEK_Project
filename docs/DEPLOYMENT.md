# Deployment Guide (Backend)

Dashboard layouts change over time. The ideas stay the same: (1) a PostgreSQL database, (2) a Cloudinary account, (3) a service that runs `npm start` with the right environment variables.
Examples below use **Neon** (database), **Cloudinary** (images) and **Render** (API). Railway/Supabase/etc. work the same way.

## A. Local PostgreSQL + migrations (do this first)

1. Install PostgreSQL from postgresql.org (Windows: the installer includes pgAdmin). Remember the password you set for user `postgres`; default port is `5432`.
2. Create a database: open **pgAdmin** -> right-click **Databases** -> **Create -> Database...** -> name `lostfound` -> Save.
3. In `.env` set (if the password has special characters like `@`, URL-encode them, e.g. `@` -> `%40`):
   ```
   STORAGE=prisma
   DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/lostfound?schema=public
   ```
4. Install Prisma (pinned to major version 6, which this code is written for):
   ```bash
   npm install prisma@6 @prisma/client@6
   ```
5. Create the first migration and the tables:
   ```bash
   npx prisma migrate dev --name init
   ```
   This creates `prisma/migrations/<timestamp>_init/migration.sql` and applies it. **Commit that folder.**
6. Seed categories and locations (required) and optional demo reports:
   ```bash
   npm run seed
   npm run seed:demo      # optional demo reports (only if the table is empty)
   ```
7. `npm run dev`, test with Postman, then do the persistence check in `TESTING.md`.

## B. Cloudinary
1. Sign up at cloudinary.com.
2. Open the **Dashboard** (Programmable Media) -> find **Cloud name**, **API Key**, **API Secret** (under "API Keys").
3. Put them in `.env`: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. Install the libraries if not done yet: `npm install multer cloudinary`.
5. Upload a photo via Postman; the response `imageUrl` should be a `res.cloudinary.com` link, and the file appears in **Media Library -> lostfound/reports**.

## C. Production database (Neon)
1. Create a project at neon.tech and copy the **connection string** (it looks like `postgresql://user:pass@host/dbname?sslmode=require`). Keep `sslmode=require`.
2. This is your production `DATABASE_URL`.

## D. Deploy the API (Render)
1. Push all code (including `prisma/migrations/`) to GitHub.
2. On render.com: **New + -> Web Service** -> connect your GitHub repo `lostfound-backend`.
3. Settings:

   | Field | Value |
   |-------|-------|
   | Runtime | Node |
   | Build Command | `npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js` |
   | Start Command | `npm start` |

   (`migrate deploy` applies your committed migrations to the production DB; the seed is safe to repeat because it uses upsert.)
4. **Environment variables** (Environment tab):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `STORAGE` | `prisma` |
   | `DATABASE_URL` | Neon connection string |
   | `CORS_ORIGIN` | your frontend URL, e.g. `https://lostfound-xyz.vercel.app` (no trailing `/`; comma-separate several; include `http://localhost:5173` while testing) |
   | `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | from Cloudinary |
   | `APP_TIMEZONE` | `Asia/Jakarta` |

   Do not set `PORT`; the platform provides it.
5. Deploy. When it is live, open `https://<your-service>.onrender.com/health`.
6. Send the base URL to your frontend teammates (they put it in `VITE_API_BASE_URL`). Then update the **Base URL (production)** line in `docs/API_CONTRACT.md` and in the README.

Note: free web services on some platforms "sleep" when idle, so the first request after a while can take a long time. Open `/health` a few minutes before your demo.

## E. Final checklist
- [ ] `GET <prod>/health` works
- [ ] `GET <prod>/reports` returns the seeded categories/reports
- [ ] POST with photo works from the deployed frontend (no CORS error)
- [ ] Restart/redeploy the service -> data is still there
- [ ] `prisma/migrations/` is committed
- [ ] No `.env` in GitHub
- [ ] API docs + DB setup instructions are final (README, `docs/`)
