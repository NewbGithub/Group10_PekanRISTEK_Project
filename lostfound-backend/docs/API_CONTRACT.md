# REST API Contract — Pacil Lost & Found

Version **1.0** (Checkpoint 1). This is the agreement between Backend and Frontend.
**Any change must be announced in the group chat and updated in this file in the same PR.**

---

## 1. General Conventions

| Item | Value |
|------|-------|
| Base URL (local) | `http://localhost:3000` |
| Base URL (production) | `TBD` (publish before Week 3) |
| Path prefix | none. Endpoints are exactly `/reports`, `/reports/:id`, etc. |
| Format | JSON. Only `POST /reports` uses `multipart/form-data` (it may carry a file). |
| JSON naming | `camelCase` keys |
| Enum values | `UPPER_CASE` (e.g. `LOST`, `WHATSAPP`) |
| Reference slugs | `lowercase-kebab` (e.g. `gedung-a`, `card-document`) |
| Dates | `eventDate` = `YYYY-MM-DD`. `createdAt` / `updatedAt` = ISO 8601 UTC string |
| Auth | None. Everything is public. |
| Edit / delete | **Not available to the public.** There is no `PUT`, `PATCH`, or `DELETE`. |
| CORS | Only origins listed in `CORS_ORIGIN` are allowed |

## 2. Response Envelope

**Success**
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {},
  "meta": {}
}
```
`meta` only appears when needed (e.g. pagination).

**Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "itemName", "message": "itemName must be between 3 and 100 characters" }
  ]
}
```
`errors` only appears for validation errors (HTTP 400).

## 3. Endpoint Summary

| Method | Path | Purpose | Checkpoint |
|--------|------|---------|------------|
| GET | `/health` | Check the server is alive | 1/2 |
| GET | `/categories` | List categories (for filter and form dropdowns) | 2 |
| GET | `/locations` | List locations (for filter and form dropdowns) | 2 |
| GET | `/reports` | List, search, filter, paginate reports | 2 |
| GET | `/reports/:id` | Get one report | 2 |
| POST | `/reports` | Submit a Lost/Found report (optional image) | 2 (text) / 3 (image) |

## 4. Report Object

This is the shape returned by `GET /reports` (inside `data[]`) and `GET /reports/:id` / `POST /reports` (inside `data`).

```json
{
  "id": "a1b2c3d4-0000-4000-8000-000000000001",
  "type": "LOST",
  "itemName": "Tumbler Tupperware Biru",
  "description": "Tumbler biru merek Tupperware, ada stiker kecil logo Pacil di bagian bawah.",
  "category": { "slug": "drinkware", "name": "Tumbler & Botol" },
  "location": { "slug": "gedung-a", "name": "Gedung A" },
  "locationDetail": "Ruang A206",
  "eventDate": "2026-11-14",
  "imageUrl": null,
  "reporterName": "Raka",
  "contact": { "method": "WHATSAPP", "value": "081200000001" },
  "createdAt": "2026-11-15T08:30:00.000Z",
  "updatedAt": "2026-11-15T08:30:00.000Z"
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string (UUID) | |
| `type` | `"LOST"` \| `"FOUND"` | |
| `itemName` | string | |
| `description` | string | |
| `category` | `{ slug, name }` | |
| `location` | `{ slug, name }` | |
| `locationDetail` | string \| `null` | Free text, e.g. "Ruang A206" |
| `eventDate` | string | Date the item was lost / found |
| `imageUrl` | string \| `null` | `null` = no photo. **The frontend shows the placeholder.** The backend never returns a placeholder URL. |
| `reporterName` | string | |
| `contact` | `{ method, value }` | **Only the contact method chosen by the reporter.** See privacy rule below. |
| `createdAt`, `updatedAt` | string | |

### Contact privacy rule
A reporter may fill several contact fields, but must choose ONE as public (`publicContactMethod`).
The API returns **only** that one inside `contact`. The other contact values are never exposed by any endpoint, and `imagePublicId` is never exposed either.

---

## 5. `GET /health`

**200 OK**
```json
{ "success": true, "message": "API is running", "data": { "status": "ok" } }
```

## 6. `GET /categories` and `GET /locations`

**200 OK** (`/categories`)
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    { "slug": "card-document", "name": "Kartu & Dokumen" },
    { "slug": "electronics", "name": "Elektronik" }
  ]
}
```
`/locations` has the same shape. Full lists are in `mock-data/meta.json`.

---

## 7. `GET /reports`

Returns reports, **newest first** by default.

### Query parameters (all optional)

| Param | Type | Default | Rules |
|-------|------|---------|-------|
| `q` | string | — | Search by **item name**, case-insensitive, "contains". Trimmed. Max 100 chars. |
| `type` | string | — | `LOST` or `FOUND` (uppercase). |
| `category` | string | — | A category **slug**, e.g. `electronics`. |
| `location` | string | — | A location **slug**, e.g. `gedung-a`. |
| `page` | integer | `1` | Min 1. |
| `limit` | integer | `10` | Min 1, max 50. |
| `sort` | string | `newest` | `newest` or `oldest` (by `createdAt`). |

Rules:
- Filters are combined with **AND**. Example: `type=LOST&category=electronics` = lost AND electronics.
- Empty param (e.g. `q=`) is treated as "not provided".
- Unknown `category` / `location` slug: **200 with empty `data`** (it is just a filter with no match, not an error).
- Invalid value (`type=ABC`, `page=0`, `limit=100`, `sort=random`): **400**.
- `page` bigger than `totalPages`: **200 with empty `data`** (not 404).

### Pagination behavior
Page-based. The backend computes `skip = (page - 1) * limit` and `take = limit`.

`meta.pagination`:

| Field | Meaning |
|-------|---------|
| `page` | Current page |
| `limit` | Items per page |
| `totalItems` | Total items matching the filters |
| `totalPages` | `ceil(totalItems / limit)`. `0` when there are no items |
| `hasNextPage` | `page < totalPages` |
| `hasPrevPage` | `page > 1` |

### Example
`GET /reports?type=LOST&category=electronics&q=charger&page=1&limit=10`

**200 OK**
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": [
    {
      "id": "a1b2c3d4-0000-4000-8000-000000000003",
      "type": "LOST",
      "itemName": "Charger Laptop Asus 65W",
      "description": "Charger laptop Asus 65W dengan kabel agak kusut dan ada selotip hitam di dekat colokan.",
      "category": { "slug": "electronics", "name": "Elektronik" },
      "location": { "slug": "sekretariat", "name": "Sekretariat (Sekre)" },
      "locationDetail": "Meja dekat pintu masuk",
      "eventDate": "2026-11-13",
      "imageUrl": null,
      "reporterName": "Salsa",
      "contact": { "method": "LINE", "value": "salsa_cs" },
      "createdAt": "2026-11-14T13:40:00.000Z",
      "updatedAt": "2026-11-14T13:40:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

**400 Bad Request** (`/reports?type=ABC&limit=100`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "type", "message": "type must be LOST or FOUND" },
    { "field": "limit", "message": "limit must be an integer between 1 and 50" }
  ]
}
```

---

## 8. `GET /reports/:id`

**200 OK**
```json
{
  "success": true,
  "message": "Report retrieved successfully",
  "data": { "...": "a full Report Object (see section 4)" }
}
```

**404 Not Found** (id does not exist, or is not a valid UUID)
```json
{ "success": false, "message": "Report not found" }
```

---

## 9. `POST /reports`

Creates a new Lost or Found report.

### Request format
- `Content-Type: multipart/form-data` (the frontend uses `FormData`).
- All text values are sent as form fields; the optional photo is sent in the file field named **`image`**.
- For quick testing, the backend also accepts `application/json` (text only, no image).
- **Do not** set the `Content-Type` header manually in `fetch`/`axios` when sending `FormData`; the browser adds the correct `boundary`.

### Fields

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| `type` | yes | string | `LOST` or `FOUND` |
| `itemName` | yes | string | 3–100 chars (trimmed) |
| `description` | yes | string | 10–1000 chars (trimmed) |
| `category` | yes | string | Must be an existing category slug |
| `location` | yes | string | Must be an existing location slug |
| `locationDetail` | no | string | Max 100 chars |
| `eventDate` | yes | string | `YYYY-MM-DD`, valid date, **not in the future** |
| `reporterName` | yes | string | 2–60 chars |
| `contactWhatsapp` | no* | string | Indonesian number, e.g. `081234567890`, `+6281234567890`, `6281234567890` |
| `contactInstagram` | no* | string | 1–30 chars of letters, digits, `.` `_`. A leading `@` is removed |
| `contactLine` | no* | string | 4–20 chars of letters, digits, `.` `_` `-` |
| `contactEmail` | no* | string | Valid email, max 100 chars |
| `publicContactMethod` | yes | string | `WHATSAPP`, `INSTAGRAM`, `LINE`, or `EMAIL` |
| `image` | no | file | `image/jpeg`, `image/png`, or `image/webp`. Max **5 MB**. One file. |

\* Each contact field is optional **except** the one picked in `publicContactMethod`: it must be filled and valid.
Example: `publicContactMethod=EMAIL` requires `contactEmail`.

### Image handling (optional photo)

| Step | Behavior |
|------|----------|
| 1 | Frontend sends the file in field `image` (multipart). Frontend should preview it and check type/size before sending. |
| 2 | Backend (`multer`, memory storage) accepts at most 1 file, max 5 MB, only jpeg/png/webp. |
| 3 | Backend validates all text fields **first**. If invalid -> 400 and nothing is uploaded. |
| 4 | If a file exists, backend uploads it to Cloudinary (folder `lostfound/reports`). |
| 5 | Backend stores `secure_url` in `imageUrl` and `public_id` in `imagePublicId` (PostgreSQL). Only `imageUrl` is returned to clients. |
| 6 | If the database insert fails after upload, backend deletes the uploaded image from Cloudinary (cleanup). |
| 7 | No file sent -> `imageUrl` is `null`. Frontend shows the placeholder. |

Checkpoint note:
- **Checkpoint 2:** `POST /reports` works with text fields; an `image` file is accepted but ignored (`imageUrl: null`), data is kept in memory.
- **Checkpoint 3:** images go to Cloudinary, data goes to PostgreSQL.

### Example (curl, text only)
```bash
curl -X POST http://localhost:3000/reports \
  -F "type=LOST" \
  -F "itemName=Tumbler Tupperware Biru" \
  -F "description=Tumbler biru, ada stiker logo Pacil di bagian bawah." \
  -F "category=drinkware" \
  -F "location=gedung-a" \
  -F "locationDetail=Ruang A206" \
  -F "eventDate=2026-11-14" \
  -F "reporterName=Raka" \
  -F "contactWhatsapp=081200000001" \
  -F "contactInstagram=raka.pacil" \
  -F "publicContactMethod=WHATSAPP"
```
Add `-F "image=@/path/to/photo.jpg"` to include a photo.

### Example (frontend)
```js
const formData = new FormData();
formData.append('type', 'LOST');
formData.append('itemName', itemName);
// ...other fields...
if (imageFile) formData.append('image', imageFile);

const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reports`, {
  method: 'POST',
  body: formData, // no Content-Type header here!
});
```

**201 Created** (also sets header `Location: /reports/<id>`)
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "id": "5d0c1f9e-6a3b-4c1d-9a56-0a1b2c3d4e5f",
    "type": "LOST",
    "itemName": "Tumbler Tupperware Biru",
    "description": "Tumbler biru, ada stiker logo Pacil di bagian bawah.",
    "category": { "slug": "drinkware", "name": "Tumbler & Botol" },
    "location": { "slug": "gedung-a", "name": "Gedung A" },
    "locationDetail": "Ruang A206",
    "eventDate": "2026-11-14",
    "imageUrl": null,
    "reporterName": "Raka",
    "contact": { "method": "WHATSAPP", "value": "081200000001" },
    "createdAt": "2026-11-16T03:00:00.000Z",
    "updatedAt": "2026-11-16T03:00:00.000Z"
  }
}
```
Notice `contactInstagram` was submitted but is **not** in the response.

**400 Bad Request**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "itemName", "message": "itemName must be between 3 and 100 characters" },
    { "field": "contactEmail", "message": "contactEmail is required when publicContactMethod is EMAIL" },
    { "field": "eventDate", "message": "eventDate cannot be in the future" }
  ]
}
```

**413 Payload Too Large** (file > 5 MB)
```json
{ "success": false, "message": "Image is too large. Maximum size is 5 MB" }
```

**415 Unsupported Media Type** (not jpeg/png/webp)
```json
{ "success": false, "message": "Unsupported image type. Use JPEG, PNG, or WEBP" }
```

**500 Internal Server Error** (e.g. Cloudinary or database failure; no report is created)
```json
{ "success": false, "message": "Internal server error" }
```

---

## 10. HTTP Status Codes Used

| Code | When |
|------|------|
| 200 OK | Successful `GET` |
| 201 Created | Successful `POST /reports` |
| 400 Bad Request | Validation failed (body, query params) |
| 404 Not Found | Report id not found, or unknown route |
| 413 Payload Too Large | Image larger than 5 MB |
| 415 Unsupported Media Type | Image is not jpeg/png/webp |
| 500 Internal Server Error | Unexpected server error |

## 11. Not Provided on Purpose
`PUT`, `PATCH`, `DELETE` on `/reports`: public users cannot edit or delete reports (Checkpoint 3 requirement). These methods fall through to the 404 handler.
