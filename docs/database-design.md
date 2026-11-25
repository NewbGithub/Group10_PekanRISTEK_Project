# Database Design — Frontend View

The **source of truth** is
[`lost-and-found_backend/docs/DATABASE_DESIGN.md`](../lost-and-found_backend/docs/DATABASE_DESIGN.md).
The frontend does not own the schema; this file only summarizes what the UI can
expect from the API.

## Entities

- **Category** (1) — (N) **Report**
- **Location** (1) — (N) **Report**
- A report belongs to exactly one category and one location.

Separate reference tables prevent typos like `Gedung A` vs `gedung a` and give
the API stable slugs for filtering.

## Report fields

| Field | Prisma / DB type | Required | Returned by API? | Notes |
|-------|------------------|----------|------------------|-------|
| `id` | `String @id @default(uuid())` | auto | yes | **UUID string**, not an integer. |
| `type` | enum `ReportType` | yes | yes | `LOST` / `FOUND` |
| `itemName` | `String @db.VarChar(100)` | yes | yes | 3–100 chars |
| `description` | `String @db.VarChar(1000)` | yes | yes | 10–1000 chars |
| `categoryId` | `Int` FK | yes | as `category { slug, name }` | Must exist. |
| `locationId` | `Int` FK | yes | as `location { slug, name }` | Must exist. |
| `locationDetail` | `String? @db.VarChar(100)` | no | yes | e.g. "Ruang A206" |
| `eventDate` | `DateTime @db.Date` | yes | yes (`YYYY-MM-DD`) | Not in the future. |
| `imageUrl` | `String?` | no | yes | Cloudinary `secure_url`; `null` = no photo. |
| `imagePublicId` | `String?` | no | **no** | Cloudinary id for cleanup. |
| `reporterName` | `String @db.VarChar(60)` | yes | yes | 2–60 chars |
| `contactWhatsapp` | `String?` | one required | **no** (only via `contact`) | The public contact method must be filled. |
| `contactInstagram` | `String?` | one required | **no** (only via `contact`) | Stored without a leading `@`. |
| `contactLine` | `String?` | one required | **no** (only via `contact`) | |
| `contactEmail` | `String?` | one required | **no** (only via `contact`) | |
| `publicContactMethod` | enum `ContactMethod` | yes | as `contact.method` | `WHATSAPP`, `INSTAGRAM`, `LINE`, `EMAIL` |
| `createdAt` | `DateTime @default(now())` | auto | yes | ISO 8601 UTC |
| `updatedAt` | `DateTime @updatedAt` | auto | yes | ISO 8601 UTC |

## Enums

| Enum | Values |
|------|--------|
| `ReportType` | `LOST`, `FOUND` |
| `ContactMethod` | `WHATSAPP`, `INSTAGRAM`, `LINE`, `EMAIL` |

## Reference data

Seeded from `lost-and-found_backend/mock-data/meta.json`:

- **Categories:** `card-document`, `electronics`, `bags-wallets`, `drinkware`,
  `keys`, `clothing`, `stationery`, `other`
- **Locations:** `gedung-a`, `gedung-b`, `perpustakaan`, `kantin`,
  `sekretariat`, `pos-satpam`, `musholla`, `area-parkir`, `lainnya`

The frontend loads the names and slugs from `GET /categories` and
`GET /locations`, and keeps a local mirror of
`lost-and-found_backend/mock-data/meta.json` in
`frontend/src/constants/filters.js` as a fallback.

## Important differences from the old draft

The previous version of this document described a single `Report` table with:

- `id Int @default(autoincrement())` → **now a UUID string**
- `category String` / `location String` → **now `categoryId` / `locationId` FKs**
- `contact String` → **now split contact columns + `publicContactMethod`**
- no `locationDetail`, `eventDate`, `reporterName`, `updatedAt` → **all required by the backend contract**

There is no `status` field and no public `PUT` / `PATCH` / `DELETE`.
