# Ceban Pertama 💸

Ceban Pertama adalah aplikasi split bill modern untuk nongkrong bareng, makan bareng, atau belanja rame-rame. Aplikasi ini memudahkan kamu untuk: foto struk, otomatis baca item & harga, tentuin siapa pesan apa, dan bagikan tagihan ke grup tanpa ribet.

> “Gak perlu ribet ngitung manual. Foto struknya, pilih siapa pesen apa, terus share ke grup. Beres.”

## Fitur Utama

- 📸 OCR struk otomatis dari foto
  - Baca item, harga, pajak, dan service charge dari struk
  - Cocok untuk resto, cafe, warung, hingga belanja bersama
- 👥 Split bill per orang dan per porsi
  - Pilih siapa yang pesan apa
  - Bagi tagihan secara adil, termasuk pajak dan biaya tambahan
- 🧾 Halaman sesi & detail tagihan
  - Kelola sesi split bill secara terstruktur
  - Lihat ringkasan tagihan per member
- 💬 Share ke WhatsApp
  - Format ringkasan bill siap dibagikan ke grup
  - Mudah kirim ke teman-teman atau member grup
- 🧑‍💻 Profil dan rekening
  - Kelola profil pengguna
  - Simpan atau atur rekening / metode pembayaran yang relevan
- 🔐 Autentikasi dan login
  - Login via Better Auth
  - Dukungan konfigurasi email + Google OAuth
- 📱 PWA-ready
  - Dapat diinstal seperti aplikasi di perangkat
  - Desain mobile-first untuk pengalaman yang lebih nyaman

---

## Tech Stack

- Framework: [Next.js](https://nextjs.org/) 16 (App Router)
- Language: [TypeScript](https://www.typescriptlang.org/)
- Database ORM: [Prisma](https://www.prisma.io/)
- Database: [PostgreSQL](https://www.postgresql.org/)
- Authentication: [Better Auth](https://better-auth.com/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)
- OCR: [Tesseract.js](https://tesseract.projectnaptha.com/)
- Email: [Resend](https://resend.com/)
- Hosting target: Vercel

---

## Struktur Project

```bash
.
├── .env.example
├── .gitignore
├── AGENTS.md
├── README.md
├── docs/
├── prisma/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── agenda/
│   │   ├── bon/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── pete-pete/
│   │   ├── profile/
│   │   ├── register/
│   │   ├── reset-password/
│   │   ├── tongkrongan/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── LandingView.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── utils/
├── package.json
├── prisma.config.ts
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── .oxlintrc.json
├── LICENSE
└── package-lock.json
```

---

## Prasyarat

Pastikan kamu sudah punya:

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) yang sedang berjalan local
- Git

---

## Setup Local

### 1. Clone repository

```bash
git clone https://github.com/alizataqy/cebanpertama.git
cd cebanpertama
```

### 2. Install dependency

```bash
npm install
```

### 3. Setup environment variable

Buat file `.env` di root project dan isi sesuai `.env.example`.

```env
# Database
DATABASE_URL="postgresql://root:root@localhost:5432/spitbill_db?schema=public"

# Better Auth & App Configuration
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Resend Email Configuration
RESEND_API_KEY=""
EMAIL_FROM="Ceban Pertama <onboarding@resend.dev>"

# Google OAuth Configuration
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Setup database Prisma

```bash
npx prisma generate
npx prisma db push
```

### 5. Jalankan aplikasi

```bash
npm run dev
```

Buka browser ke:

- http://localhost:3000

---

## Scripts yang Tersedia

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
npm run db:push
npm run db:generate
```

---

## Workflow Aplikasi

Secara umum alur produk ini adalah:

1. User masuk ke landing page
2. Buat atau join sesi split bill
3. Upload foto struk
4. OCR membaca item, harga, pajak, dan service charge
5. Pilih siapa yang pesan apa
6. Hitung tagihan per orang
7. Share hasilnya ke grup melalui WhatsApp
8. Kelola profil dan data rekening pengguna

---

## Roadmap Singkat

- Split bill dasar untuk nongkrong & makan bareng
- OCR struk dan pengelompokan orang per item
- Sesi bill yang bisa dibagikan ke grup
- Autentikasi, profil, dan payment-related setup
- PWA / experience yang lebih app-like

---

## Kontribusi

Kontribusi sangat terbuka untuk:

- perbaikan bug
- peningkatan UI/UX
- optimasi OCR dan split logic
- dokumentasi
- refactor keamanan dan performa

Langkah umum:

```bash
git checkout -b feature/nama-fiturnya
# lakukan perubahan
npm run lint
npm run build
git push origin feature/nama-fiturnya
```

Buat PR ke branch default repository untuk review.

---

## Lisensi

Project ini menggunakan lisensi MIT. Silakan cek file `LICENSE` untuk detail lengkap.

---

## Catatan

Brand aplikasi yang dipakai di produk adalah `Ceban Pertama`. Repository dapat di-rename sesuai kebutuhan, tetapi pengalaman dan flow produk tetap mengutamakan kemudahan membagi tagihan antar teman.

*Gua mau gampang ngitung bill, bukan ribet.*
