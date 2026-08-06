# PETE-PETE 💸

PETE-PETE adalah aplikasi *split bill* (bagi tagihan) modern, asyik, dan gak kaku yang dirancang khusus untuk anak muda dan geng tongkrongan. Aplikasi ini mempermudah perhitungan patungan makan, belanja, atau liburan bersama menggunakan teknologi **AI OCR Scan Struk** dan management multi-rekening/QRIS.

> *"Udah ga perlu ribet ngitung-ngitung tagihan manual lagi. Foto struknya, pilih siapa mesen apa, terus share ke grup. Beres!"*

---

## ✨ Fitur Utama

- 📸 **Scan Foto Struk (AI OCR)**: Cukup upload foto struk makan/belanja, AI akan otomatis mendeteksi nama menu, kuantitas, dan harganya.
- ✍️ **Input Manual ala Tongkrongan**: Form input manual super gampang, bisa tambah anggota geng, pilih siapa split menu apa, dan siapa yang bayar duluan.
- 🏦 **Multi-Rekening / Wallet**: Satu user bisa mendaftarkan banyak nomor rekening bank, e-wallet (GoPay, OVO, Dana), hingga custom URL gambar QRIS dengan logo sharp (menggunakan aset dari [idn-finlogos](https://github.com/hafidznoor/idn-finlogos)).
- 🔗 **Pilih Rekening Sesi**: Pilih rekening transfer spesifik dari profil saat membuat sesi patungan baru.
- 💬 **Bagi Tagihan & Share WA**: Hitung split bill instan dan bagikan rincian patungan langsung ke grup WhatsApp teman-teman lo dengan satu klik.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/) dengan Database PostgreSQL
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **UI Design System**: Built with customized [Untitled UI Components](https://github.com/untitledui) & [React Aria Components](https://react-spectrum.adobe.com/react-aria/react-aria-components.html)
- **Styling**: Tailwind CSS v4
- **Logo Assets**: Cloned from [idn-finlogos](https://github.com/hafidznoor/idn-finlogos)

---

## 🚀 Cara Menjalankan Project Secara Lokal

### 1. Prasyarat (Prerequisites)
Pastikan lo sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 18+ direkomendasikan)
- [PostgreSQL](https://www.postgresql.org/) (running local database)

### 2. Clone Repositori
```bash
git clone https://github.com/username/pete-pete-splitbill.git
cd pete-pete-splitbill
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Setup Environment Variable (`.env`)
Buat file bernama `.env` di root direktori project, lalu isi dengan konfigurasi berikut:
```env
# Koneksi PostgreSQL Database
DATABASE_URL="postgresql://username:password@localhost:5432/spitbill_db?schema=public"

# Better Auth secret & base URL
BETTER_AUTH_SECRET="buat_random_secret_string_lo_di_sini"
BETTER_AUTH_URL="http://localhost:3000"

# Optional: API Key untuk OCR Struk jika ingin menggunakan model AI penuh
GEMINI_API_KEY="api_key_gemini_lo_di_sini"
```

### 5. Setup Database & Prisma Migrations
Jalankan perintah ini untuk generate client Prisma dan sinkronisasi skema ke database:
```bash
npx prisma generate
npx prisma db push
```

### 6. Jalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser lo untuk mencoba aplikasinya secara lokal.

---

## 🤝 Cara Berkontribusi (Open for Contributions)

Kami sangat senang menerima kontribusi dari komunitas! Baik itu memperbaiki bug, menambahkan fitur baru, merapikan UI, atau sekadar memperbaiki typo di dokumentasi. 

Berikut langkah-langkah untuk berkontribusi:

1. **Fork** repositori ini ke akun GitHub lo.
2. **Clone** hasil fork lo ke komputer lokal:
   ```bash
   git clone https://github.com/username-lo/pete-pete-splitbill.git
   ```
3. Buat branch baru untuk fitur atau perbaikan lo:
   ```bash
   git checkout -b feature/fitur-keren-baru
   ```
4. Lakukan perubahan kode, pastikan kode lo rapi dan berjalan dengan baik.
5. Jalankan pengecekan TypeScript & Linter untuk memastikan tidak ada build error:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
6. Commit perubahan lo dengan pesan commit yang jelas:
   ```bash
   git commit -m "feat: tambah integrasi split bill via Line/Telegram"
   ```
7. Push ke branch lo:
   ```bash
   git push origin feature/fitur-keren-baru
   ```
8. Buka halaman repositori asli di GitHub, lalu klik tombol **New Pull Request**. Jelaskan secara detail perubahan yang lo buat dengan menggunakan format template berikut:
   
   ### 📝 Template Deskripsi Pull Request (PR)
   ```markdown
   ## 🎯 Tujuan PR
   Jelaskan secara singkat apa tujuan dari PR ini (misal: "Memperbaiki overflow pada form input manual di mobile" atau "Menambahkan fitur integrasi pembayaran QRIS BCA").
   
   - Closes #issue-number (jika ada issue terkait)
   
   ## 🛠️ Perubahan yang Dilakukan
   Sebutkan file apa saja yang diubah dan detail logika baru yang dimasukkan:
   - [x] Refactor `ProfileForm.tsx` untuk memindahkan form input bank ke page baru.
   - [x] Modifikasi `button.tsx` menggunakan `flex` dibanding `inline-flex` untuk responsivitas layout.
   
   ## 🧪 Langkah Pengujian
   Tuliskan langkah-langkah detail agar reviewer bisa mencoba hasil kodemu secara lokal:
   1. Jalankan development server `npm run dev`.
   2. Masuk ke dashboard, pilih menu profil, lalu klik "Tambah Bank".
   3. Coba isi dengan QRIS dan periksa apakah logo QRIS muncul dengan tajam.
   4. Hapus salah satu rekening dan pastikan datanya hilang di database.
   
   ## 📸 Bukti Visual (Screenshot / GIF)
   > Wajib dilampirkan jika ada perubahan tampilan UI/UX!
   | Sebelum (Before) | Sesudah (After) |
   | --- | --- |
   | [Link/Foto Sebelum] | [Link/Foto Sesudah] |
   ```

   ### ⚠️ Aturan Penting Sebelum Mengajukan PR:
   - Pastikan **tidak ada build/typescript error** (`npx tsc --noEmit` wajib lulus).
   - Jangan memasukkan API key pribadi (seperti `GEMINI_API_KEY`) ke dalam file commit, gunakan `.env`.
   - Gunakan format penulisan commit yang standar (Conventional Commits), seperti `feat: ...`, `fix: ...`, atau `docs: ...`.

---

## 📝 Lisensi
Project ini berlisensi [MIT License](LICENSE). Lo bebas gunain, modifikasi, dan sebarluaskan untuk keperluan belajar atau portofolio pribadi lo.

---

*Grup chat lo nungguin patungan cair? PETE-PETE aja! 💸*
