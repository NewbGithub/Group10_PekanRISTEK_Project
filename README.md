# Community Issue / Lost & Found Reporting System

A full-stack application enabling users to report and track lost or found items with photo uploads and category filtering.

## 1. Pembagian Tugas, Tim, dan Tech Stack

| Peran | Fokus Tanggung Jawab (CP1 - CP3) | Tech Stack |
| --- | --- | --- |
| Gwein Antaresya Al Farabi | Desain database & Prisma schema, membuat REST API (`GET /reports`, `GET /reports/:id`, `POST /reports`), setup CORS, integrasi PostgreSQL & Cloudinary, serta deploy API. | Node.js, Express.js, PostgreSQL, Prisma ORM, Cloudinary |
| Hania Aisyatu Zahra | Membangun halaman Report Detail Page (/reports/:id), membangun halaman Report Submission Form (/create) | HTML, CSS, JavaScript, Tailwind, React.js, Vite |
| Avatar Benedict Sengkey | Setup proyek React + Vite + Tailwind, membuat komponen Navbar dan Report Card, membangun halaman Public Report Listing (/reports) beserta fitur Search & Filtering | HTML, CSS, JavaScript, Tailwind, React.js, Vite |

## 2. Daftar Halaman dan Fitur (Sesuai Perubahan Terbaru)

| Halaman / Fitur | Rute URL (FE) | Status | Keterangan |
| --- | :--- | :--- | :--- |
| Home | `/` | Wajib | Halaman utama aplikasi. |
| Halaman Utama / List of reports | `/reports` | Wajib | Menampilkan seluruh laporan Lost dan Found secara publik. |
| Report Detail Page | `/reports/:id` | Wajib | Halaman detail khusus untuk menampilkan informasi lengkap 1 laporan. |
| Report Submission Form | `/create` | Wajib | Formulir kirim laporan Lost atau Found dengan opsi unggah foto. |
| Search & Filtering | `/reports` (Query) | Opsional | Cari nama barang & filter tipe/kategori/lokasi (dikerjakan jika waktu cukup). |
| Image Placeholder & Contact Privacy | - | Wajib | Jika `imageUrl` bernilai `null`, frontend menampilkan placeholder. API hanya mengembalikan kontak publik yang dipilih pelapor (`contact.method` + `contact.value`). |

## 3. Desain Database (Tabel Report)

Schema mengikuti backend: lihat `lostfound-backend/docs/DATABASE_DESIGN.md` sebagai **source of truth**.

| Nama Field | Tipe Data (Prisma/DB) | Sifat | Keterangan |
| --- | --- | --- | --- |
| `id` | `String` (UUID, Primary Key) | Wajib (Auto) | ID unik laporan berupa **UUID string**, bukan integer. |
| `type` | Enum (`LOST` / `FOUND`) | Wajib | Jenis laporan: barang hilang atau ditemukan. |
| `itemName` | `String` (VarChar 100) | Wajib | Nama barang, 3–100 karakter. |
| `description` | `String` (VarChar 1000) | Wajib | Deskripsi ciri barang dan kronologi, 10–1000 karakter. |
| `categoryId` | `Int` (FK ke `Category`) | Wajib | API mengembalikan `category: { slug, name }`. |
| `locationId` | `Int` (FK ke `Location`) | Wajib | API mengembalikan `location: { slug, name }`. |
| `locationDetail` | `String?` (VarChar 100) | Opsional | Detail lokasi, mis. "Ruang A206". |
| `eventDate` | `DateTime` (`DATE`) | Wajib | Tanggal barang hilang/ditemukan, format `YYYY-MM-DD`, tidak boleh di masa depan. |
| `imageUrl` | `String?` (Nullable) | Opsional | Link foto dari Cloudinary; `null` berarti tidak ada foto dan frontend menampilkan placeholder. |
| `imagePublicId` | `String?` | Opsional | ID Cloudinary untuk cleanup; **tidak pernah** dikembalikan API. |
| `reporterName` | `String` (VarChar 60) | Wajib | Nama pelapor, 2–60 karakter. |
| `contactWhatsapp` / `contactInstagram` / `contactLine` / `contactEmail` | `String?` | Salah satu wajib | Hanya kontak yang dipilih di `publicContactMethod` yang harus diisi. |
| `publicContactMethod` | Enum (`WHATSAPP` / `INSTAGRAM` / `LINE` / `EMAIL`) | Wajib | API mengembalikan `contact: { method, value }`. |
| `createdAt` | `DateTime` | Wajib (Auto) | Waktu laporan dibuat. |
| `updatedAt` | `DateTime` | Wajib (Auto) | Waktu laporan terakhir diubah. |

## 4. Kontrak REST API

Kontrak lengkap: `lostfound-backend/docs/API_CONTRACT.md`. Ringkasan endpoint yang dipakai frontend:

| Metode HTTP | Endpoint | Kegunaan | Format Request (Body / Query) | Format Response Sukses |
| --- | --- | --- | --- | --- |
| `GET` | `/reports` | Ambil daftar laporan (newest first) | Query opsional: `?q=...&type=...&category=<slug>&location=<slug>&page=1&limit=10&sort=newest` | `200 OK` — `{ "success": true, "data": [ ... ], "meta": { "pagination": { ... } } }` |
| `GET` | `/reports/:id` | Ambil detail 1 laporan | URL Param: `id` (UUID string) | `200 OK` — `{ "success": true, "data": { ... } }` |
| `POST` | `/reports` | Kirim laporan baru | `multipart/form-data` (`type`, `itemName`, `description`, `category`, `location`, `locationDetail`, `eventDate`, `reporterName`, `contactWhatsapp`/`contactInstagram`/`contactLine`/`contactEmail`, `publicContactMethod`, dan `image` [opsional]) | `201 Created` — `{ "success": true, "data": { ... } }` |

Catatan frontend:

- Pencarian memakai `q`, bukan `search`.
- `category` dan `location` adalah **slug**, bukan nama tampilan (mis. `electronics`, `gedung-a`).
- Pagination dibaca dari `meta.pagination.totalItems` / `meta.pagination.totalPages`.
- URL frontend memakai **slug** untuk kategori dan lokasi (`?categories=keys&location=gedung-a`); daftar slug/name diambil dari `GET /categories` dan `GET /locations` via `useReferenceData()`, dengan fallback lokal dari `mock-data/meta.json`.
- `?dateRange=` tetap filter client-side (backend belum punya parameter ini); multi-kategori digabung client-side karena backend hanya menerima satu `category`.
- Variabel environment frontend: `VITE_API_BASE_URL` (default `http://localhost:3000`) dan `VITE_USE_MOCK` (default `true`).

## 5. Daftar HTTP Status Codes

| Status Code | Nama Status | Kondisi Penggunaan |
| --- | --- | --- |
| `200` | OK | Permintaan `GET /reports` atau `GET /reports/:id` berhasil diambil. |
| `201` | Created | Laporan baru lewat `POST /reports` berhasil dibuat dan disimpan. |
| `400` | Bad Request | Validasi body/query gagal (mis. `type=ABC`, `page=0`, field tidak lengkap). |
| `404` | Not Found | ID laporan tidak ditemukan / bukan UUID valid, atau route tidak dikenal. |
| `413` | Payload Too Large | File gambar lebih dari 5 MB. |
| `415` | Unsupported Media Type | File gambar bukan JPEG/PNG/WEBP. |
| `500` | Internal Server Error | Terjadi gangguan di server Backend, database, atau Cloudinary. |

## 6. MVP (Minimum Viable Product)
...

## 7. Mock Data

Sumber data bersama ada di `lostfound-backend/mock-data/reports.json` dan disalin persis ke `frontend/src/data/mockReports.json`. File `meta.json` berisi daftar kategori, lokasi, tipe laporan, dan metode kontak.

```[
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000001",
    "type": "LOST",
    "itemName": "Tumbler Tupperware Biru",
    "description": "Tumbler biru merek Tupperware, ada stiker kecil logo Pacil di bagian bawah. Seingat saya tertinggal di meja pojok setelah kelas.",
    "category": {
      "slug": "drinkware",
      "name": "Tumbler & Botol"
    },
    "location": {
      "slug": "gedung-a",
      "name": "Gedung A"
    },
    "locationDetail": "Ruang A206",
    "eventDate": "2026-11-14",
    "imageUrl": null,
    "reporterName": "Raka",
    "contact": {
      "method": "WHATSAPP",
      "value": "081200000001"
    },
    "createdAt": "2026-11-15T08:30:00.000Z",
    "updatedAt": "2026-11-15T08:30:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000002",
    "type": "FOUND",
    "itemName": "KTM Mahasiswa Fasilkom (nama diawali \"Au\")",
    "description": "Ditemukan KTM mahasiswa Fasilkom, nama diawali 'Au'. Sudah dititipkan di pos satpam, silakan ambil dengan menunjukkan identitas.",
    "category": {
      "slug": "card-document",
      "name": "Kartu & Dokumen"
    },
    "location": {
      "slug": "pos-satpam",
      "name": "Pos Satpam"
    },
    "locationDetail": null,
    "eventDate": "2026-11-15",
    "imageUrl": null,
    "reporterName": "Dimas",
    "contact": {
      "method": "INSTAGRAM",
      "value": "dimas.pacil"
    },
    "createdAt": "2026-11-15T07:15:00.000Z",
    "updatedAt": "2026-11-15T07:15:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000003",
    "type": "LOST",
    "itemName": "Charger Laptop Asus 65W",
    "description": "Charger laptop Asus 65W dengan kabel agak kusut dan ada selotip hitam di dekat colokan. Terakhir dipakai saat rapat di sekre.",
    "category": {
      "slug": "electronics",
      "name": "Elektronik"
    },
    "location": {
      "slug": "sekretariat",
      "name": "Sekretariat (Sekre)"
    },
    "locationDetail": "Meja dekat pintu masuk",
    "eventDate": "2026-11-13",
    "imageUrl": null,
    "reporterName": "Salsa",
    "contact": {
      "method": "LINE",
      "value": "salsa_cs"
    },
    "createdAt": "2026-11-14T13:40:00.000Z",
    "updatedAt": "2026-11-14T13:40:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000004",
    "type": "FOUND",
    "itemName": "Kunci Motor Honda dengan Gantungan Kuning",
    "description": "Kunci motor Honda dengan gantungan kuning berbentuk bebek, ditemukan di dekat tiang parkiran motor.",
    "category": {
      "slug": "keys",
      "name": "Kunci"
    },
    "location": {
      "slug": "area-parkir",
      "name": "Area Parkir"
    },
    "locationDetail": null,
    "eventDate": "2026-11-14",
    "imageUrl": null,
    "reporterName": "Fajar",
    "contact": {
      "method": "WHATSAPP",
      "value": "081200000002"
    },
    "createdAt": "2026-11-14T09:05:00.000Z",
    "updatedAt": "2026-11-14T09:05:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000005",
    "type": "LOST",
    "itemName": "Earphone TWS Putih",
    "description": "Earphone TWS warna putih beserta case-nya, hilang setelah belajar kelompok di perpustakaan.",
    "category": {
      "slug": "electronics",
      "name": "Elektronik"
    },
    "location": {
      "slug": "perpustakaan",
      "name": "Perpustakaan"
    },
    "locationDetail": "Lantai 2, area baca",
    "eventDate": "2026-11-12",
    "imageUrl": null,
    "reporterName": "Nadia",
    "contact": {
      "method": "EMAIL",
      "value": "nadia@example.com"
    },
    "createdAt": "2026-11-13T15:20:00.000Z",
    "updatedAt": "2026-11-13T15:20:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000006",
    "type": "FOUND",
    "itemName": "Payung Lipat Hitam",
    "description": "Payung lipat warna hitam ditemukan di bangku kantin, belum ada yang mengambil.",
    "category": {
      "slug": "other",
      "name": "Lainnya"
    },
    "location": {
      "slug": "kantin",
      "name": "Kantin"
    },
    "locationDetail": null,
    "eventDate": "2026-11-13",
    "imageUrl": null,
    "reporterName": "Bayu",
    "contact": {
      "method": "WHATSAPP",
      "value": "081200000003"
    },
    "createdAt": "2026-11-13T05:50:00.000Z",
    "updatedAt": "2026-11-13T05:50:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000007",
    "type": "LOST",
    "itemName": "Dompet Kulit Cokelat",
    "description": "Dompet kulit cokelat berisi beberapa kartu dan sedikit uang tunai. Tertinggal setelah salat.",
    "category": {
      "slug": "bags-wallets",
      "name": "Tas & Dompet"
    },
    "location": {
      "slug": "musholla",
      "name": "Musholla"
    },
    "locationDetail": "Rak sepatu",
    "eventDate": "2026-11-11",
    "imageUrl": null,
    "reporterName": "Rina",
    "contact": {
      "method": "INSTAGRAM",
      "value": "rina.ananda"
    },
    "createdAt": "2026-11-12T11:00:00.000Z",
    "updatedAt": "2026-11-12T11:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000008",
    "type": "FOUND",
    "itemName": "Buku Catatan Kalkulus",
    "description": "Buku catatan kalkulus sampul biru dengan nama pemilik di halaman pertama. Ditemukan di meja belakang kelas.",
    "category": {
      "slug": "stationery",
      "name": "Buku & Alat Tulis"
    },
    "location": {
      "slug": "gedung-b",
      "name": "Gedung B"
    },
    "locationDetail": "Ruang B105",
    "eventDate": "2026-11-12",
    "imageUrl": null,
    "reporterName": "Kevin",
    "contact": {
      "method": "EMAIL",
      "value": "kevin@example.com"
    },
    "createdAt": "2026-11-12T06:30:00.000Z",
    "updatedAt": "2026-11-12T06:30:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000009",
    "type": "LOST",
    "itemName": "Jaket Hoodie Navy",
    "description": "Hoodie warna navy ukuran L dengan tulisan kecil di bagian dada. Tertinggal saat menunggu kelas.",
    "category": {
      "slug": "clothing",
      "name": "Pakaian & Aksesori"
    },
    "location": {
      "slug": "gedung-b",
      "name": "Gedung B"
    },
    "locationDetail": "Lobby lantai 1",
    "eventDate": "2026-11-10",
    "imageUrl": null,
    "reporterName": "Tari",
    "contact": {
      "method": "WHATSAPP",
      "value": "081200000004"
    },
    "createdAt": "2026-11-11T14:10:00.000Z",
    "updatedAt": "2026-11-11T14:10:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000010",
    "type": "FOUND",
    "itemName": "Tas Ransel Hitam",
    "description": "Tas ransel hitam berisi buku dan alat tulis. Ditemukan di bawah meja, kami simpan dulu agar aman.",
    "category": {
      "slug": "bags-wallets",
      "name": "Tas & Dompet"
    },
    "location": {
      "slug": "gedung-a",
      "name": "Gedung A"
    },
    "locationDetail": "Ruang A101",
    "eventDate": "2026-11-10",
    "imageUrl": null,
    "reporterName": "Hanif",
    "contact": {
      "method": "LINE",
      "value": "hanif_88"
    },
    "createdAt": "2026-11-10T10:25:00.000Z",
    "updatedAt": "2026-11-10T10:25:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000011",
    "type": "LOST",
    "itemName": "Kalkulator Casio fx-991EX",
    "description": "Kalkulator Casio fx-991EX dengan stiker nama di bagian belakang. Dibutuhkan untuk ujian minggu ini.",
    "category": {
      "slug": "stationery",
      "name": "Buku & Alat Tulis"
    },
    "location": {
      "slug": "gedung-a",
      "name": "Gedung A"
    },
    "locationDetail": "Ruang A304",
    "eventDate": "2026-11-09",
    "imageUrl": null,
    "reporterName": "Putri",
    "contact": {
      "method": "WHATSAPP",
      "value": "081200000005"
    },
    "createdAt": "2026-11-09T08:00:00.000Z",
    "updatedAt": "2026-11-09T08:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-0000-4000-8000-000000000012",
    "type": "FOUND",
    "itemName": "Flashdisk Sandisk 64GB",
    "description": "Flashdisk Sandisk 64GB warna hitam-merah ditemukan tertancap di komputer perpustakaan.",
    "category": {
      "slug": "electronics",
      "name": "Elektronik"
    },
    "location": {
      "slug": "perpustakaan",
      "name": "Perpustakaan"
    },
    "locationDetail": null,
    "eventDate": "2026-11-08",
    "imageUrl": null,
    "reporterName": "Gilang",
    "contact": {
      "method": "INSTAGRAM",
      "value": "gilang.dev"
    },
    "createdAt": "2026-11-08T16:45:00.000Z",
    "updatedAt": "2026-11-08T16:45:00.000Z"
  }
]```