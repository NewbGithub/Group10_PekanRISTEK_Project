# 🔎 Pacil Lost & Found — Backend

A Lost & Found website for Fasilkom UI (Pacil) students, built for the **RISTEK Open Class Web Development 2026 Final Project**.
This repository contains the **Backend** (Express.js, PostgreSQL, Prisma, Cloudinary) and the shared planning documents.

> **Current status: Checkpoint 1 — Project Preparation**

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| `<Backend name>` | Backend Developer | `@username` |
| `<Frontend name 1>` | Frontend Developer | `@username` |
| `<Frontend name 2>` | Frontend Developer | `@username` |

## 🔗 Repositories

- Backend: `<link to this repo>`
- Frontend: `<link to frontend repo>`

## 🧰 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | HTML, CSS, JavaScript, React.js, Vite |
| Backend | JavaScript, Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma ORM |
| Image Storage | Cloudinary |
| Version Control | GitHub |

## ✅ Checkpoint 1 Requirements

| Requirement | Where |
|-------------|-------|
| GitHub repos, local environment, README | This README + frontend README |
| Pages, features, team responsibilities | [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) |
| Report fields, data types, DB relationships | [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) (sections 1–4) |
| Report fields -> Prisma schema plan (Week 3) | [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) (sections 5–8) |
| REST API contract (endpoints, methods, JSON, status codes) | [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) |
| Search/filter query params and pagination | [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) (section 7) |
| Report submission format and optional image upload | [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) (section 9) |
| Consistent mock data for FE and BE | [`mock-data/`](mock-data/) |

## 🚀 Local Setup (Backend)

Requirements: **Node.js (LTS)**, **npm**, **Git**.

```bash
# 1. Clone
git clone <this-repo-url>
cd lostfound-backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env

# 4. Run in development mode (auto-restart on changes)
npm run dev
```

Check it works: open <http://localhost:3000/health>. Expected:
```json
{ "success": true, "message": "API is running", "data": { "status": "ok" } }
```

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the server with `nodemon` |
| `npm start` | Start the server with `node` (used in production) |

### Environment variables (`.env.example`)

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default `3000`) |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated |
| `DATABASE_URL` | PostgreSQL connection string (Checkpoint 3) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials (Checkpoint 3) |

## 📁 Project Structure

```
lostfound-backend/
├── docs/                # Planning documents (checkpoint 1 deliverables)
├── mock-data/           # Shared mock data (same shape as API responses)
├── prisma/              # Prisma schema + migrations (Week 3)
└── src/
    ├── app.js           # Express app (middleware, routes, error handling)
    ├── server.js        # Entry point (starts the server)
    ├── routes/          # URL -> controller mapping
    ├── controllers/     # Read request, call service, send response
    ├── services/        # Business logic and data access
    ├── middlewares/     # Upload, validation, error handling
    ├── validators/      # Input validation rules
    ├── utils/           # Helpers (e.g. toPublicReport)
    └── data/            # In-memory data for Checkpoint 2
```

## 🌿 Git Workflow

Branches `feat/...`, `fix/...`, `docs/...` -> Pull Request -> review by a teammate -> merge to `main`.
Commit messages: `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`. Never commit `.env`.

## 📌 API Overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/categories`, `/locations` | Reference lists |
| GET | `/reports` | List/search/filter/paginate reports |
| GET | `/reports/:id` | Report detail |
| POST | `/reports` | Submit a report (optional `image`) |

Full details: [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

## 🗓️ Checkpoints

- [x] **CP1 (16 Nov 2026)** Project Preparation
- [ ] **CP2 (19 Nov 2026)** Main UI & Working API
- [ ] **CP3 (22 Nov 2026)** Full Integration & Deployment
