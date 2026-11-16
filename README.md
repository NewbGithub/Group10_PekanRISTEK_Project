# Community Issue / Lost & Found Reporting System

A full-stack application enabling users to report and track lost or found items with photo uploads and category filtering.

## 1. Pembagian Tugas, Tim, dan Tech Stack

| Peran | Fokus Tanggung Jawab (CP1 - CP3) | Tech Stack |
| --- | --- | --- |
| Gwein Antaresya Al Farabi | Desain database & Prisma schema, membuat REST API (`GET /reports`, `GET /reports/:id`, `POST /reports`), setup CORS, integrasi PostgreSQL & Cloudinary, serta deploy API. | Node.js, Express.js, PostgreSQL, Prisma ORM, Cloudinary |
| Hania Aisyatu Zahra | Membangun halaman Report Detail Page (/reports/:id), membangun halaman Report Submission Form (/create) | HTML, CSS, JavaScript, React.js, Vite |
| Avatar Benedict Sengkey | Setup proyek React + Vite, membuat komponen Navbar dan Report Card, membangun halaman Public Report Listing (/reports) ( ?? beserta fitur Search & Filtering ) | HTML, CSS, JavaScript, React.js, Vite |

## 2. Daftar Halaman dan Fitur (Sesuai Perubahan Terbaru)

| Halaman / Fitur | Rute URL (FE) | Status | Keterangan |
| --- | --- | --- | --- |
| Halaman Utama / List of reports | `/reports` | Wajib | Menampilkan seluruh laporan Lost dan Found secara publik. |
| Report Detail Page | `/reports/:id` | Wajib | Halaman detail khusus untuk menampilkan informasi lengkap 1 laporan. |
| Report Submission Form | `/create` | Wajib | Formulir kirim laporan Lost atau Found dengan opsi unggah foto. |
| Search & Filtering | `/reports` (Query) | Opsional | Cari nama barang & filter tipe/kategori/lokasi (dikerjakan jika waktu cukup). |
| Image Placeholder & Contact Privacy | - | Dihapus | Tidak perlu gambar default jika foto kosong, dan kontak langsung ditampilkan apa adanya. |

## 3. Desain Database (Tabel Report)

| Nama Field | Tipe Data (Prisma/DB) | Sifat | Keterangan |
| --- | --- | --- | --- |
| `id` | Int (Primary Key) | Wajib (Auto) | ID unik laporan (auto-increment). |
| `type` | Enum (`LOST` / `FOUND`) | Wajib | Jenis laporan: barang hilang atau ditemukan. |
| `itemName` | String | Wajib | Nama barang yang hilang atau ditemukan. |
| `category` | String | Wajib | Kategori barang (Elektronik, Dokumen/KTM, Alat Minum, dll.). |
| `location` | String | Wajib | Lokasi terakhir barang terlihat atau ditemukan. |
| `description` | String | Wajib | Deskripsi ciri barang dan kronologi singkat. |
| `imageUrl` | String? (Nullable) | Opsional | Link foto dari Cloudinary; bernilai null jika tidak ada foto. |
| `contact` | String | Wajib | Kontak pelapor yang bisa dihubungi (WA / LINE / Instagram). |
| `createdAt` | DateTime | Wajib (Auto) | Waktu laporan dibuat. |

## 4. Kontrak REST API

| Metode HTTP | Endpoint | Kegunaan | Format Request (Body / Query) | Format Response Sukses |
| --- | --- | --- | --- | --- |
| `GET` | `/reports` | Ambil semua daftar laporan | Opsional Query: `?search=...&type=...&category=...&location=...` | `200 OK` — `{ "status": "success", "data": [ ... ] }` |
| `GET` | `/reports/:id` | Ambil detail 1 laporan spesifik | URL Param: `id` (angka ID laporan) | `200 OK` — `{ "status": "success", "data": { ... } }` |
| `POST` | `/reports` | Kirim laporan baru | `multipart/form-data` (`type`, `itemName`, `category`, `location`, `description`, `contact`, dan `image` [opsional]) | `201 Created` — `{ "status": "success", "data": { ... } }` |

## 5. Daftar HTTP Status Codes

| Status Code | Nama Status | Kondisi Penggunaan |
| --- | --- | --- |
| `200` | OK | Permintaan `GET /reports` atau `GET /reports/:id` berhasil diambil. |
| `201` | Created | Laporan baru lewat `POST /reports` berhasil dibuat dan disimpan. |
| `400` | Bad Request | Data form yang dikirim tidak lengkap atau format file foto tidak valid. |
| `404` | Not Found | ID laporan yang dicari pada `GET /reports/:id` tidak ditemukan. |
| `500` | Internal Server Error | Terjadi gangguan di server Backend, database, atau Cloudinary. |

## 6. MVP (Minimum Viable Product)
...

## 7. Mock Data
...
