# REST API Contract

**Base URL (Local):** `http://localhost:3000`

## 1. Ringkasan Endpoint

| Metode HTTP | Endpoint | Kegunaan | Format Request (Body / Query) | Format Response Sukses |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/reports` | Ambil semua daftar laporan | *Opsional Query:* `?search=...&type=...&category=...&location=...` | `200 OK` — `{ "status": "success", "data": [ ... ] }` |
| `GET` | `/reports/:id` | Ambil detail 1 laporan spesifik | *URL Param:* `id` (angka ID laporan) | `200 OK` — `{ "status": "success", "data": { ... } }` |
| `POST` | `/reports` | Kirim laporan baru | `multipart/form-data` (`type`, `itemName`, `category`, `location`, `description`, `contact`, dan `image` [opsional]) | `201 Created` — `{ "status": "success", "data": { ... } }` |

---

## 2. Detail Spesifikasi Endpoint

### A. `GET /reports`
Mengambil daftar seluruh laporan dengan dukungan pencarian dan penyaringan melalui *query parameters*.

- **Query Parameters (Opsional):**
  - `search`: Kata kunci pencarian pada `itemName` (contoh: `?search=tumbler`)
  - `type`: Filter jenis laporan (`LOST` atau `FOUND`)
  - `category`: Filter kategori barang
  - `location`: Filter lokasi barang
- **Response `200 OK`:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "type": "LOST",
      "itemName": "Tumbler Corkcicle Hitam",
      "category": "Alat Makan & Minum",
      "location": "Ruangan A206",
      "description": "Tertinggal di meja barisan depan setelah kelas pagi.",
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "contact": "WA: 081234567890",
      "createdAt": "2026-11-16T08:30:00.000Z"
    }
  ]
}
```

### B. `GET /reports/:id`
Mengambil detail satu laporan berdasarkan ID.

- **URL Parameter:** `id` (`Int`)
- **Response `200 OK`:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "type": "LOST",
    "itemName": "Tumbler Corkcicle Hitam",
    "category": "Alat Makan & Minum",
    "location": "Ruangan A206",
    "description": "Tertinggal di meja barisan depan setelah kelas pagi.",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "contact": "WA: 081234567890",
    "createdAt": "2026-11-16T08:30:00.000Z"
  }
}
```
- **Response `404 Not Found`:**
```json
{
  "status": "error",
  "message": "Report not found"
}
```

### C. `POST /reports`
Membuat laporan barang hilang atau ditemukan baru.

- **Request Body (`multipart/form-data`):**
  - `type` (String, Wajib): `"LOST"` atau `"FOUND"`
  - `itemName` (String, Wajib)
  - `category` (String, Wajib)
  - `location` (String, Wajib)
  - `description` (String, Wajib)
  - `contact` (String, Wajib)
  - `image` (File, Opsional): File gambar (JPG/PNG/WEBP)
- **Response `201 Created`:**
```json
{
  "status": "success",
  "data": {
    "id": 4,
    "type": "FOUND",
    "itemName": "Kunci Motor Honda",
    "category": "Kunci & Aksesori",
    "location": "Parkiran Motor Fasilkom",
    "description": "Ditemukan menggantung di motor Beat hitam, dititipkan ke satpam.",
    "imageUrl": null,
    "contact": "LINE: fasilkom26",
    "createdAt": "2026-11-17T08:00:00.000Z"
  }
}
```

---

## 3. Daftar HTTP Status Codes

| Status Code | Nama Status | Kondisi Penggunaan |
| :--- | :--- | :--- |
| `200` | `OK` | Permintaan `GET /reports` atau `GET /reports/:id` berhasil diambil. |
| `201` | `Created` | Laporan baru lewat `POST /reports` berhasil dibuat dan disimpan. |
| `400` | `Bad Request` | Data form yang dikirim tidak lengkap atau format file foto tidak valid. |
| `404` | `Not Found` | ID laporan yang dicari pada `GET /reports/:id` tidak ditemukan. |
| `500` | `Internal Server Error` | Terjadi gangguan di server Backend, database, atau Cloudinary. |