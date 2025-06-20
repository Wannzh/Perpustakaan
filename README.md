# 📚 Sistem Informasi Perpustakaan Digital

Sistem ini dikembangkan sebagai penyelesaian **Tugas Akhir** dan ditujukan untuk mendigitalisasi manajemen perpustakaan di **SMA Negeri 2 Plus Sipirok**, mencakup pengelolaan pengguna, buku, transaksi peminjaman dan pengembalian, serta laporan digital.

---

## 🧪 Teknologi yang Digunakan

### 🔙 Backend
- Java 21
- Spring Boot
- Spring Data JPA
- MySQL
- Spring Security (autentikasi berbasis role)
- Maven

### 🔜 Frontend
- React.js
- Axios
- Tailwind CSS
- React Router DOM
- Vite

---

## 🧩 Fitur Utama

### 1. 🔐 Autentikasi & Login
- Semua pengguna (Kepala Perpustakaan, Pustakawan, Siswa) login melalui portal web.
- Sistem memverifikasi dan mengarahkan ke dashboard berdasarkan **role**:
  - Kepala Perpustakaan ➝ Manajemen global
  - Pustakawan ➝ Pengelolaan buku & transaksi
  - Siswa ➝ Layanan mandiri

---

### 2. 👤 Manajemen Pengguna

#### Kepala Perpustakaan:
- CRUD data pustakawan (input satuan atau batch `.csv`/`.xlsx`)
- Data: Nama, NIP, Email, Username, Password
- Fitur pencarian berdasarkan Nama/NIP

#### Pustakawan:
- CRUD data siswa (input satuan atau massal)
- Data: Nama, NIS, Kelas, Email, Username, Password

---

### 3. 📚 Manajemen Buku
- CRUD data buku: Judul, Pengarang, Penerbit, Tahun Terbit, Kategori, Jumlah Eksemplar
- Update otomatis stok buku berdasarkan transaksi peminjaman/pengembalian

---

### 4. 🔁 Peminjaman Buku

#### Siswa (Layanan Mandiri)
- Cari buku → Klik “Pinjam”
- Validasi stok tersedia
- Simpan transaksi, hitung jatuh tempo (+7 hari), stok berkurang

#### Pustakawan (Manual)
- Cari siswa → Pilih buku → Konfirmasi
- Sistem simpan transaksi dan kurangi stok

---

### 5. 🔄 Pengembalian & Denda

#### Siswa:
- Klik tombol "Kembalikan", pilih status:
  - **Normal** ➝ Denda jika telat: Rp2000/hari
  - **Rusak** ➝ Rp50.000
  - **Hilang** ➝ Rp100.000

#### Pustakawan:
- Konfirmasi pengembalian & status
- Sistem menghitung denda & update transaksi
- Stok tidak dikembalikan jika hilang/rusak

---

### 6. 📧 Notifikasi Otomatis
- Dikirim ke email siswa:
  - H-1 sebelum jatuh tempo
  - Saat telat
- Isi: Judul Buku, Tanggal Jatuh Tempo, Denda (jika ada)

---

### 7. 📊 Laporan Digital
- Diakses oleh Kepala Perpustakaan & Pustakawan
- Jenis laporan:
  - Statistik transaksi
  - Buku terpopuler
  - Daftar siswa sering telat
  - Total denda
- Ekspor PDF / Excel

---

### 8. 📖 Monitoring Ketersediaan Buku
- Semua pengguna dapat melihat status buku secara **real-time**
- Info: Judul, Jumlah Tersedia, Status: Tersedia/Dipinjam

---

## 🗂️ Struktur Proyek
/Perpustakaan
├── backend/               # Java Spring Boot Project
│   ├── src/main/java/com/perpustakaan
│   ├── src/main/resources
│   └── pom.xml
├── frontend/              # React Project
│   ├── src/
│   └── package.json
└── README.md



---

## 🚀 Cara Menjalankan

### 1. Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run

