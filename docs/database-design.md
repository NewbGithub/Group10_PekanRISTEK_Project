# Database Design

## 1. Struktur Tabel `Report`
Aplikasi tidak menggunakan sistem akun/autentikasi sehingga seluruh data disimpan dalam satu entitas utama bernama `Report`.

| Nama Field | Tipe Data (Prisma/DB) | Sifat | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `Int` (Primary Key) | Wajib (Auto) | ID unik laporan (*auto-increment*). |
| `type` | `Enum` (`LOST` / `FOUND`) | Wajib | Jenis laporan: barang hilang atau ditemukan. |
| `itemName` | `String` | Wajib | Nama barang yang hilang atau ditemukan. |
| `category` | `String` | Wajib | Kategori barang (Elektronik, Dokumen/KTM, Alat Makan & Minum, dll.). |
| `location` | `String` | Wajib | Lokasi terakhir barang terlihat atau ditemukan. |
| `description` | `String` | Wajib | Deskripsi ciri barang dan kronologi singkat. |
| `imageUrl` | `String?` (Nullable) | Opsional | URL foto dari Cloudinary; bernilai `null` jika tidak ada foto. |
| `contact` | `String` | Wajib | Kontak pelapor yang bisa dihubungi (WA / LINE / Instagram). |
| `createdAt` | `DateTime` | Wajib (Auto) | Waktu laporan dibuat (`@default(now())`). |

## 2. Rancangan Prisma Schema (Untuk Checkpoint 3)

```prisma
enum ReportType {
  LOST
  FOUND
}

model Report {
  id          Int        @id @default(autoincrement())
  type        ReportType
  itemName    String
  category    String
  location    String
  description String
  imageUrl    String?
  contact     String
  createdAt   DateTime   @default(now())
}
```