# Testing Guide

## 1. Automated tests (no database, no internet needed)
```bash
npm test
```
Runs `test/*.test.js` with Node's built-in test runner. They cover validators, the privacy mapper, image signature check, service logic (list/filter/search/pagination/create) and controller status codes.

## 2. Manual tests with Postman (server must be running: `npm run dev`)

| # | Request | Expect |
|---|---------|--------|
| 1 | `GET http://localhost:3000/health` | 200, `"API is running"` |
| 2 | `GET /reports` | 200, 10 items, `meta.pagination.totalItems` = 12 (memory mode) |
| 3 | `GET /reports?page=2` | 200, 2 items |
| 4 | `GET /reports?type=LOST&category=electronics` | 200, only lost + electronics |
| 5 | `GET /reports?q=charger` | 200, 1 item |
| 6 | `GET /reports?type=ABC&limit=100` | 400 with 2 errors |
| 7 | `GET /reports/a1b2c3d4-0000-4000-8000-000000000001` | 200 |
| 8 | `GET /reports/nope` | 404 |
| 9 | `GET /categories`, `GET /locations` | 200 with `slug` + `name` |
| 10 | `DELETE /reports/a1b2c3d4-0000-4000-8000-000000000001` | 404 (no delete route exists) |
| 11 | `POST /reports` (see below) | 201 + `Location` header |
| 12 | `POST /reports` with empty body | 400 with errors list |
| 13 | `POST /reports` with a `.txt` renamed `.png` as `image` | 415 |
| 14 | `POST /reports` with an image > 5 MB | 413 |

### How to send `POST /reports` in Postman
1. Click **New → HTTP**, method **POST**, URL `http://localhost:3000/reports`.
2. Open the **Body** tab and choose **form-data**.
3. Add keys (type **Text**): `type`=`LOST`, `itemName`, `description`, `category`=`drinkware`, `location`=`gedung-a`, `eventDate`=`2026-11-20`, `reporterName`, `contactWhatsapp`=`081234567890`, `contactInstagram`=`nama.ig`, `publicContactMethod`=`WHATSAPP`.
4. (Optional) add a key named `image`, hover the key cell, change type from *Text* to **File**, and pick a JPG/PNG/WEBP.
5. Do NOT set a `Content-Type` header manually. Click **Send**.
6. Check the response: `contact` contains only the WhatsApp value; `nama.ig` must not appear anywhere.

## 3. Persistence check (Checkpoint 3 requirement)
1. Run with `STORAGE=prisma`. Create a report (POST).
2. Stop the server (`Ctrl + C`) and start again.
3. `GET /reports` still lists your report -> data persisted in PostgreSQL.
(In `STORAGE=memory` mode it disappears. That is expected.)

## 4. CORS check
From the deployed frontend, open DevTools -> Network. A request to the API must succeed. A "blocked by CORS policy" error means the frontend URL is missing from `CORS_ORIGIN` (no trailing slash!).
