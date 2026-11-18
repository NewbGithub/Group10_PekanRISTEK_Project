# Project Plan — Campus Lost & Found Web App

## 1. Latar Belakang & Tujuan
Aplikasi web *full-stack* untuk membantu mahasiswa melaporkan barang hilang (*Lost*) maupun barang ditemukan (*Found*) di lingkungan kampus secara terpusat, sehingga informasi tidak tenggelam di grup chat dan pelapor dapat langsung dihubungi.

## 2. Pembagian Tugas Tim & Tech Stack

| Peran | Fokus Tanggung Jawab (CP1 - CP3) | Tech Stack |
| --- | --- | --- |
| Gwein Antaresya Al Farabi | Desain database & Prisma schema, membuat REST API (`GET /reports`, `GET /reports/:id`, `POST /reports`), setup CORS, integrasi PostgreSQL & Cloudinary, serta deploy API. | Node.js, Express.js, PostgreSQL, Prisma ORM, Cloudinary |
| Hania Aisyatu Zahra | Membangun halaman Report Detail Page (/reports/:id), membangun halaman Report Submission Form (/create) | HTML, CSS, JavaScript, Tailwind, React.js, Vite |
| Avatar Benedict Sengkey | Setup proyek React + Vite + Tailwind, membuat komponen Navbar dan Report Card, membangun halaman Public Report Listing (/reports) ( ?? beserta fitur Search & Filtering ) | HTML, CSS, JavaScript, Tailwind, React.js, Vite |

## 3. Linimasa Pengerjaan (Checkpoints)
- **Checkpoint 1 (16 November 2026):** Inisialisasi repositori GitHub, setup lokal, `README.md`, perencanaan fitur, desain database, kontrak API, dan *mock data*.
- **Checkpoint 2 (19 November 2026):** Implementasi seluruh halaman UI responsif di Frontend menggunakan *mock data* serta pembuatan endpoint REST API dasar di Backend dengan *in-memory storage* dan CORS.
- **Checkpoint 3 (22 November 2026):** Integrasi penuh Frontend–Backend, migrasi database PostgreSQL dengan Prisma ORM, integrasi upload foto Cloudinary, dan deployment produksi.