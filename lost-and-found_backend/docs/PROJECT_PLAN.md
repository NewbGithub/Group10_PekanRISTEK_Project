# Project Plan — Pacil Lost & Found

## 1. Goal
A website where students can post **Lost** and **Found** reports so owners and finders can reach each other, instead of relying on buried WhatsApp group messages.

## 2. Team and Responsibilities

| Member | Role | Main responsibilities |
|--------|------|-----------------------|
| `<Backend name>` | Backend (BE) | Repo + environment, DB design, REST API, validation, Cloudinary upload, Prisma + PostgreSQL, contact privacy, API deployment, API docs |
| `<Frontend name 1>` (FE-1) | Frontend | App layout (navbar/footer/routing), Reports listing page, search & filter bar, pagination, report detail page, responsive design |
| `<Frontend name 2>` (FE-2) | Frontend | Home page, report submission form (validation, image preview), API service layer (`fetch`/axios), loading/error states, 404 page, frontend deployment |
| Everyone | — | README, demo materials, testing, Demo Day |

Boundaries: FE-1 and FE-2 coordinate on shared components (cards, buttons, form inputs). BE owns `docs/API_CONTRACT.md`; FE reviews it and raises questions before coding.

## 3. Application Pages

| Route | Page | Content | Owner |
|-------|------|---------|-------|
| `/` | Home | Hero, "how it works", buttons *Report Lost* / *Report Found*, latest reports | FE-2 |
| `/reports` | Report listing | Search box, filters (type, category, location), report cards, pagination | FE-1 |
| `/reports/:id` | Report detail | Photo (or placeholder), item info, location, date, public contact | FE-1 |
| `/reports/new` | Submit report | Form for Lost/Found with optional photo | FE-2 |
| `*` | Not found | Friendly 404 page | FE-2 |

## 4. Features

**Must-have (minimum requirements from the brief)**
1. Public report listing and a detail page per report.
2. Search by item name; filter by type (Lost/Found), category, location.
3. Report submission form with optional photo upload.
4. Default placeholder when a report has no photo.
5. Contact privacy: show only the contact method selected by the reporter.

**Nice-to-have (only after must-haves work)**
- Sort newest/oldest, skeleton loading, "Chat via WhatsApp" button (`wa.me` link), copy-contact button, image preview and compression before upload, share-link button.
- "Mark as resolved" for reporters (needs a secret manage-token, so it is NOT public editing; decide only if there is time).

## 5. Timeline

| Checkpoint | Deadline | Backend | Frontend |
|------------|----------|---------|----------|
| 1. Project Preparation | 16 Nov 2026 | Repo, env, README, DB design, API contract, mock data | Repo, env (Vite + React), README, page plan, review contract |
| 2. Main UI & Working API | 19 Nov 2026 | `GET /reports`, `GET /reports/:id`, `POST /reports` (in-memory), CORS, deploy API, publish base URL | Listing, detail, search/filter, form, responsive, mock data |
| 3. Full Integration & Deployment | 22 Nov 2026 | Prisma + PostgreSQL, migrations, Cloudinary, validation, privacy, deploy, final docs | Real API, photo upload, placeholder, validation, loading/error states, deploy, README, demo |

## 6. Git Workflow

- Two repositories: `lostfound-backend` and `lostfound-frontend`.
- Branches: `main` is always working. Work in branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- Commit messages: `type: short description` — e.g. `feat: add GET /reports endpoint`, `docs: add API contract`, `chore: setup express server`.
- Commit **small and often**, from **your own account**: mentors verify checkpoints through GitHub commit history.
- Open a Pull Request, ask a teammate to review, then merge into `main`.
- Never commit `.env` or secrets (it is in `.gitignore`).

## 7. Definition of Done (per checkpoint)

- **CP1:** Repos exist with all members' commits; READMEs done; plan, DB design, API contract, and mock data committed.
- **CP2:** The 3 endpoints work and are deployed with CORS; base URL published; FE pages work with mock data consistent with the contract.
- **CP3:** FE <-> BE fully integrated; data persists after backend restart; photos on Cloudinary; both apps deployed; README and demo ready.

## 8. Risks

| Risk | Mitigation |
|------|------------|
| Contract changes late and breaks FE | Change only via PR to `API_CONTRACT.md` + announcement |
| CORS errors after deployment | Put the FE production URL in `CORS_ORIGIN` |
| Deployment takes longer than expected | Deploy a "hello world" API early (CP2 day 1) |
| Secrets leaked to GitHub | `.env` ignored; only `.env.example` committed |
