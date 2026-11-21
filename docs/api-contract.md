# REST API Contract — Frontend View

The **source of truth** is the backend contract:

- [`lostfound-backend/docs/API_CONTRACT.md`](../lostfound-backend/docs/API_CONTRACT.md)
- [`lostfound-backend/docs/DATABASE_DESIGN.md`](../lostfound-backend/docs/DATABASE_DESIGN.md)

This file only records how the frontend calls that contract. If the two ever
disagree, the backend document wins and the frontend must follow it.

**Base URL:** `VITE_API_BASE_URL` (default in `frontend/.env.example`:
`http://localhost:3000`).

> Mock mode is the default (`VITE_USE_MOCK !== 'false'`). Set
> `VITE_USE_MOCK=false` once the backend `/reports` routes are implemented.

## 1. Response envelope

Every successful response uses `success`, not `status`:

```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {},
  "meta": {}
}
```

Errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "itemName", "message": "itemName must be between 3 and 100 characters" }]
}
```

The frontend's `reportService.js` checks `json.success === true` and throws the
backend `message` on failure.

## 2. Endpoints used by the frontend

| Method | Path | Used by |
|--------|------|---------|
| `GET` | `/reports` | Home (recent 4), `/reports` listing |
| `GET` | `/reports/:id` | `/reports/:id` detail page |
| `POST` | `/reports` | `/create` submission |

`GET /categories` and `GET /locations` are loaded by `useReferenceData()` into
the filter and location dropdowns. `frontend/src/constants/filters.js` holds a
local mirror of `lostfound-backend/mock-data/meta.json` as a fallback so the UI
renders immediately and still works while those endpoints are unimplemented.

## 3. `GET /reports`

### Backend query parameters

| Param | Type | Notes |
|-------|------|-------|
| `q` | string | Search by item name (not `search`). Max 100 chars. |
| `type` | string | `LOST` or `FOUND`. |
| `category` | string | **One category slug**, e.g. `electronics`. |
| `location` | string | Location slug, e.g. `gedung-a`. |
| `page` | integer | Default `1`, min `1`. |
| `limit` | integer | Default `10`, max `50`. |
| `sort` | string | `newest` (default) or `oldest`. |

`meta.pagination` is what the frontend uses:

```json
{
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 12,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

The frontend reads `totalItems` / `totalPages`; it does **not** derive totals
from the length of `data`.

### Frontend URL parameters → backend parameters

The `/reports` URL uses **slugs** for category and location; `reportService.js`
only translates the search parameter name:

| Frontend URL | Backend request | Why |
|--------------|-----------------|-----|
| `?search=charger` | `?q=charger` | Backend uses `q`. |
| `?type=LOST` | `?type=LOST` | Same. |
| `?location=gedung-a` | `?location=gedung-a` | Same slug. |
| `?category=keys` (legacy) | `?category=keys` | Same slug. |
| `?categories=electronics` | `?category=electronics` | Single category maps directly. |
| `?categories=electronics,keys` | One request per slug, merged and deduplicated client-side | Backend supports one `category` only (AND semantics). |
| `?dateRange=7d` | Client-side filter on `createdAt` | Backend has no date-range parameter. |

Legacy display names in shared URLs (e.g. `?location=Gedung A`) are still
converted to slugs by the converter helpers in `constants/filters.js`.

`categories` and `dateRange` are **frontend-only** conveniences. The backend
contract does not define them. Multi-category and date-range filtering fetch
the matching reports (in pages of 50) and paginate client-side.

## 4. `GET /reports/:id`

- Success: `{ "success": true, "data": { ...report } }`.
- Missing or invalid UUID: HTTP 404 with `{ "success": false, "message": "Report not found" }`.
- The frontend returns `null` on 404 instead of throwing, so the detail page can
  show a "not found" state.

## 5. `POST /reports`

`multipart/form-data` only. Do **not** set `Content-Type` manually; the browser
adds the multipart boundary. The frontend builds the form in
`createReport()`.

| Field | Required | Notes |
|-------|----------|-------|
| `type` | yes | `LOST` / `FOUND` |
| `itemName` | yes | 3–100 chars |
| `description` | yes | 10–1000 chars |
| `category` | yes | Category **slug** |
| `location` | yes | Location **slug** |
| `locationDetail` | no | Max 100 chars |
| `eventDate` | yes | `YYYY-MM-DD`, not in the future |
| `reporterName` | yes | 2–60 chars |
| `contactWhatsapp` / `contactInstagram` / `contactLine` / `contactEmail` | one required | The one selected in `publicContactMethod` |
| `publicContactMethod` | yes | `WHATSAPP`, `INSTAGRAM`, `LINE`, `EMAIL` |
| `image` | no | `image/jpeg`, `image/png`, or `image/webp`, max 5 MB |

The response `contact` contains only the public method/value. Other contact
values are never returned.

## 6. Report object (what the API returns)

```json
{
  "id": "a1b2c3d4-0000-4000-8000-000000000001",
  "type": "LOST",
  "itemName": "Tumbler Tupperware Biru",
  "description": "Tumbler biru merek Tupperware...",
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

Notes for the UI:

- `id` is a **UUID string**, not an integer.
- `category` and `location` are objects; the UI reads `category.name` /
  `location.name` and uses `.slug` for query parameters. There is no
  `normalizeReport` layer — the backend shape is used as-is.
- `imageUrl: null` means "no photo"; the frontend shows a placeholder.
- There is **no `status` field** and no `PATCH`/`PUT`/`DELETE` endpoint.

## 7. HTTP status codes

| Code | When |
|------|------|
| `200` | Successful `GET` |
| `201` | Successful `POST /reports` |
| `400` | Validation failed (body or query params) |
| `404` | Report id not found, or unknown route |
| `413` | Image larger than 5 MB |
| `415` | Image is not jpeg/png/webp |
| `500` | Unexpected server error |

## 8. Reference values

Categories and locations come from `GET /categories` and `GET /locations`.
`lostfound-backend/mock-data/meta.json` is mirrored in
`frontend/src/constants/filters.js` only as the offline/mock fallback.

| Category name | Slug |
|---------------|------|
| Kartu & Dokumen | `card-document` |
| Elektronik | `electronics` |
| Tas & Dompet | `bags-wallets` |
| Tumbler & Botol | `drinkware` |
| Kunci | `keys` |
| Pakaian & Aksesori | `clothing` |
| Buku & Alat Tulis | `stationery` |
| Lainnya | `other` |

| Location name | Slug |
|---------------|------|
| Gedung A | `gedung-a` |
| Gedung B | `gedung-b` |
| Perpustakaan | `perpustakaan` |
| Kantin | `kantin` |
| Sekretariat (Sekre) | `sekretariat` |
| Pos Satpam | `pos-satpam` |
| Musholla | `musholla` |
| Area Parkir | `area-parkir` |
| Lainnya | `lainnya` |
