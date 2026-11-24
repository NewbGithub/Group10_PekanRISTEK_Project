# Local Development Setup

## 1. Clone Repositori
```bash
git clone https://github.com/veneurons/Group10_PekanRISTEK_Project.git
cd Group10_PekanRISTEK_Project
```

## 2. Menjalankan Frontend (React + Vite)
```bash
cd frontend
npm install
```

Salin `.env.example` menjadi `.env` (di Windows: `copy .env.example .env`), lalu pastikan alamat server Backend sudah benar:
```env
VITE_API_BASE_URL=http://localhost:3000
```

Jalankan server pengembangan Frontend:
```bash
npm run dev
```
Aplikasi Frontend dapat diakses di `http://localhost:5173`.

## 3. Menjalankan Backend (Node.js + Express)

Folder backend ada di `lost-and-found_backend/` (tersedia di branch `main` dan
`lost-and-found_backend`).
```bash
cd lost-and-found_backend
npm install
```

Salin `.env.example` menjadi `.env`. Untuk Checkpoint 2 cukup `STORAGE=memory`
(tanpa PostgreSQL), dan `CORS_ORIGIN` harus sama dengan alamat frontend:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
APP_TIMEZONE=Asia/Jakarta
STORAGE=memory

# Wajib hanya jika STORAGE=prisma
DATABASE_URL=

# Wajib hanya jika ingin upload foto (Checkpoint 3)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Jalankan server Backend:
```bash
npm run dev
```

Cek `http://localhost:3000/health`. Dengan `STORAGE=memory`, API langsung berisi
12 laporan mock dan tidak butuh database. Jika frontend dijalankan di port lain
(mis. `5174`), tambahkan port itu ke `CORS_ORIGIN` (pisahkan dengan koma) agar
request tidak diblokir CORS.

> Jika folder backend belum punya `package.json` (hanya ada
> `package.reference.json`), buat `package.json` dan install dependency sesuai
> catatan di file referensi tersebut sebelum menjalankan `npm run dev`.

## 4. Aturan Kolaborasi Git
- Jangan *push* langsung fitur baru ke `main`.
- Buat *branch* baru sesuai fitur yang dikerjakan (contoh: `feat/report-listing`, `feat/report-detail-create`, `feat/backend-api`).
- Lakukan *Pull Request* ke `main` setelah fitur selesai diuji secara lokal.