# Mock Data

Shared by Backend and Frontend so everybody works with the **same data**.

| File | What it is |
|------|------------|
| `reports.json` | Array of 12 reports. Each item has EXACTLY the shape of a report returned by `GET /reports` and `GET /reports/:id` (see `docs/api-contract.md`). |
| `meta.json` | Reference values: `categories`, `locations`, `reportTypes`, `contactMethods`. |

Rules:
- Contacts here are the **public contact only** (`contact: { method, value }`), because that is all the API ever returns.
- `imageUrl: null` means "no photo" -> the frontend shows a placeholder.
- All people, phone numbers, and emails are fake.
- **Do not edit one copy only.** If the contract changes, update this folder first, then copy to the frontend repo (`frontend/src/data/mockReports.json`).

Backend use: Checkpoint 2 -> load `reports.json` into the in-memory store. Checkpoint 3 -> use it as the source for the Prisma seed script.
