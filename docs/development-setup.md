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
VITE_API_URL=http://localhost:3000
```

Jalankan server pengembangan Frontend:
```bash
npm run dev
```
Aplikasi Frontend dapat diakses di `http://localhost:5173`.

## 3. Menjalankan Backend (Node.js + Express)
```bash
cd backend
npm install
```

Salin `.env.example` menjadi `.env` dan lengkapi variabel lingkungan yang dibutuhkan:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/lost_and_found"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

Jalankan server Backend:
```bash
npm run dev
```

## 4. Aturan Kolaborasi Git
- Jangan *push* langsung fitur baru ke `main`.
- Buat *branch* baru sesuai fitur yang dikerjakan (contoh: `feat/report-listing`, `feat/report-detail-create`, `feat/backend-api`).
- Lakukan *Pull Request* ke `main` setelah fitur selesai diuji secara lokal.