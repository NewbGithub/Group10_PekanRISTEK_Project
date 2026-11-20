# Application Plan & Features

## 1. Daftar Halaman & Fitur

| Halaman / Fitur | Rute URL (FE) | Status | Keterangan |
| :--- | :--- | :--- | :--- |
| **Home** | `/` | **Wajib** | Halaman utama aplikasi. |
| **Public Report Listing** | `/reports` | **Wajib** | Menampilkan seluruh laporan *Lost* dan *Found* secara publik. |
| **Report Detail Page** | `/reports/:id` | **Wajib** | Halaman detail khusus untuk menampilkan informasi lengkap 1 laporan. |
| **Report Submission Form** | `/create` | **Wajib** | Formulir kirim laporan *Lost* atau *Found* dengan opsi unggah foto. |
| **Search & Filtering** | `/reports` *(Query)* | **Opsional (FE 1)** | Cari berdasarkan nama barang serta filter berdasarkan tipe (`LOST`/`FOUND`), kategori, dan lokasi. |
| **Image Placeholder & Contact Privacy** | - | **Dihapus** | Tidak menggunakan gambar default jika foto kosong (`imageUrl: null`), dan kontak pelapor ditampilkan langsung sesuai input. |

## 2. Alur Pengguna (User Flow)
1. **Melihat Laporan:** Pengguna membuka web (`/`) dan melihat halaman Home, lalu dapat menavigasi ke `/reports` untuk melihat daftar barang hilang dan ditemukan.
2. **Mencari & Menyaring Laporan:** Pengguna mengetik kata kunci nama barang atau memilih filter tipe, kategori, dan lokasi pada halaman `/reports`.
3. **Melihat Detail Laporan:** Pengguna mengklik salah satu kartu laporan untuk masuk ke `/reports/:id` dan melihat deskripsi lengkap, foto (jika ada), serta kontak pelapor.
4. **Membuat Laporan Baru:** Pengguna mengklik tombol buat laporan menuju `/create`, mengisi formulir laporan (dengan opsi melampirkan foto), lalu dikirim ke `POST /reports`.