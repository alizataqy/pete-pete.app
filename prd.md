# 📄 Product Requirements Document (PRD)
# PETE-PETE

**Version:** 1.0.0  
**Created:** 2026-08-06  
**Author:** Product Team  
**Status:** Draft  
**Tech Stack:** Next.js 14 (App Router), TypeScript, Prisma, PostgreSQL, Auth0, Midtrans / Xendit / Stripe

---

## 1. Ringkasan Eksekutif (Executive Summary)

**SpitBill** adalah aplikasi web berbasis Next.js yang memungkinkan pengguna untuk **memisahkan tagihan bersama** secara otomatis menggunakan teknologi **OCR (Optical Character Recognition)** untuk memindai struk/nota, lalu **membagi biaya** ke anggota grup, dan melakukan **pembayaran langsung** melalui payment gateway yang terintegrasi.

### Problem Statement
- Membagi tagihan secara manual membutuhkan waktu dan sering terjadi kesalahan perhitungan.
- Penghitungan ulang struk restoran atau belanja bersama sangat tidak efisien.
- Transfer manual antar teman rentan terhadap miskomunikasi dan kelupaan.

### Solution
Aplikasi yang secara otomatis:
1. Memindai struk menggunakan OCR
2. Mengidentifikasi item dan harga secara otomatis
3. Memungkinkan pengguna mengalokasikan item ke masing-masing orang
4. Menghitung total tagihan per orang termasuk pajak dan tips
5. Mengirim tagihan dan menerima pembayaran langsung melalui app

---

## 2. Tujuan & Sasaran (Goals & Objectives)

### Business Goals
- Menjadi aplikasi split bill #1 di Indonesia
- Mengurangi gesekan dalam proses pembayaran bersama
- Monetisasi melalui fee transaksi (0.5–1%) atau subscription premium

### Product Goals
- Akurasi OCR ≥ 90% untuk struk umum
- Waktu proses dari upload struk hingga pembagian < 10 detik
- Pengalaman pembayaran yang mulus dalam 1–3 langkah
- Mendukung hingga 20 orang dalam satu sesi split

### Key Metrics (KPI)
| Metrik | Target 3 Bulan | Target 6 Bulan |
|---|---|---|
| Monthly Active Users | 5.000 | 25.000 |
| Transaksi per bulan | 15.000 | 80.000 |
| Nilai transaksi per bulan | Rp 500jt | Rp 2,5M |
| OCR Accuracy Rate | ≥ 90% | ≥ 95% |
| User Retention (D30) | 25% | 40% |

---

## 3. Target Pengguna (User Personas)

### Persona 1 — "Si Organizer" (Primary)
- **Usia:** 22–35 tahun
- **Profil:** Mahasiswa atau pekerja muda yang sering makan bersama, nongkrong, atau travelling bareng
- **Pain Points:** Capek ngitung manual, malu nagih teman, sering ada yang lupa bayar
- **Needs:** Cara cepat dan adil untuk membagi tagihan tanpa drama

### Persona 2 — "Si Anggota" (Secondary)
- **Usia:** 18–40 tahun
- **Profil:** Anggota grup yang menerima tagihan dan harus membayar bagiannya
- **Pain Points:** Tidak tahu harus bayar berapa, tidak tahu mau transfer ke mana
- **Needs:** Tagihan yang jelas dan link pembayaran yang mudah

### Persona 3 — "Si Bisnis" (Tertiary/Future)
- **Profil:** Pemilik UKM atau event organizer yang mengelola pengeluaran grup
- **Pain Points:** Reimbursement karyawan yang lambat dan tidak terstruktur
- **Needs:** Dashboard pengeluaran dan laporan split bill

---

## 4. Fitur Utama (Feature Requirements)

### 4.1 Autentikasi & Manajemen Akun

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| AUTH-01 | Register / Login Email | P0 | Pendaftaran dengan email & password |
| AUTH-02 | OAuth Google | P0 | Login cepat dengan akun Google |
| AUTH-03 | Login via WhatsApp OTP | P1 | OTP ke nomor WA untuk autentikasi |
| AUTH-04 | Profil Pengguna | P0 | Edit nama, foto, nomor rekening/e-wallet |
| AUTH-05 | Linked Payment Account | P1 | Simpan metode pembayaran (QRIS, GoPay, dll) |

### 4.2 OCR & Pemindaian Struk

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| OCR-01 | Upload Foto Struk | P0 | Upload gambar JPG/PNG/HEIC dari device |
| OCR-02 | Kamera Langsung | P1 | Capture langsung via kamera browser |
| OCR-03 | Ekstraksi Item & Harga | P0 | OCR mengidentifikasi nama item dan harga |
| OCR-04 | Deteksi Pajak & Service | P0 | Otomatis mendeteksi PPN, service charge |
| OCR-05 | Deteksi Nama Merchant | P1 | Mengidentifikasi nama restoran/toko |
| OCR-06 | Edit Manual Hasil OCR | P0 | Pengguna bisa koreksi item yang salah terbaca |
| OCR-07 | Multi-halaman Struk | P2 | Struk panjang yang terdiri dari beberapa foto |
| OCR-08 | Riwayat Pemindaian | P1 | Simpan hasil OCR untuk digunakan ulang |

### 4.3 Manajemen Grup & Sesi

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| GRP-01 | Buat Sesi Split Bill | P0 | Buat sesi baru dengan nama dan deskripsi |
| GRP-02 | Undang Anggota | P0 | Undang via link, WhatsApp, atau email |
| GRP-03 | Tambah Anggota Manual | P0 | Tambah orang tanpa akun (tamu/guest) |
| GRP-04 | Daftar Grup Tersimpan | P1 | Simpan grup favorit (misal: "Geng Kantor") |
| GRP-05 | Maksimal 20 Anggota | P0 | Limit 20 orang per sesi |
| GRP-06 | Join via Link | P0 | Anggota join sesi lewat link undangan |

### 4.4 Pembagian Tagihan (Bill Splitting)

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| SPLIT-01 | Alokasi Item per Orang | P0 | Drag & drop / checkbox item ke orang tertentu |
| SPLIT-02 | Split Rata (Equal Split) | P0 | Bagi total secara merata ke semua anggota |
| SPLIT-03 | Split Kustom (%) | P1 | Tentukan persentase tagihan per orang |
| SPLIT-04 | Split per Item | P0 | Setiap orang bayar item yang dipilihnya |
| SPLIT-05 | Split Item Bersama | P0 | Item bisa di-split ke beberapa orang |
| SPLIT-06 | Tambah Biaya Ekstra | P1 | Tambah biaya parkir, tip, dll secara manual |
| SPLIT-07 | Kalkulasi Otomatis | P0 | Hitung total per orang otomatis real-time |
| SPLIT-08 | Preview Tagihan | P0 | Tampilkan ringkasan sebelum finalisasi |
| SPLIT-09 | Tips Calculator | P1 | Slider untuk menentukan % tips |
| SPLIT-10 | Multi-Mata Uang | P2 | Dukungan IDR, USD, SGD, MYR |

### 4.5 Payment Gateway & Pembayaran

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| PAY-01 | Generate Payment Link | P0 | Buat link pembayaran unik per anggota |
| PAY-02 | QRIS | P0 | Pembayaran via QRIS (GoPay, OVO, Dana, dll) |
| PAY-03 | Transfer Bank | P0 | Virtual Account BCA, BNI, BRI, Mandiri |
| PAY-04 | GoPay / OVO Direct | P1 | Deep-link ke app e-wallet |
| PAY-05 | Kartu Kredit/Debit | P1 | Pembayaran via Visa/Mastercard |
| PAY-06 | Konfirmasi Otomatis | P0 | Status bayar update otomatis via webhook |
| PAY-07 | Reminder Otomatis | P1 | Kirim reminder ke yang belum bayar via WA/email |
| PAY-08 | Riwayat Transaksi | P0 | Log semua transaksi per sesi dan per user |
| PAY-09 | Refund / Koreksi | P2 | Proses refund jika ada kesalahan |
| PAY-10 | Bukti Pembayaran | P1 | Kirim struk digital setelah pembayaran |

### 4.6 Notifikasi

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| NOTIF-01 | Email Notifikasi | P0 | Email konfirmasi, tagihan, dan pembayaran |
| NOTIF-02 | WhatsApp Notifikasi | P1 | Kirim tagihan & reminder via WA Business API |
| NOTIF-03 | Push Notification | P1 | Browser push notification |
| NOTIF-04 | In-App Notification | P0 | Bell notification di dalam aplikasi |

### 4.7 Dashboard & Riwayat

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| DASH-01 | Ringkasan Tagihan Aktif | P0 | Daftar sesi split yang sedang berjalan |
| DASH-02 | Riwayat Sesi | P0 | Semua sesi split yang sudah selesai |
| DASH-03 | Statistik Pengeluaran | P1 | Grafik pengeluaran per bulan/kategori |
| DASH-04 | Export ke CSV/PDF | P1 | Ekspor riwayat untuk keperluan pribadi |
| DASH-05 | Hutang & Piutang | P1 | Rekap siapa yang masih hutang ke siapa |

---

## 5. User Flow

### Flow Utama: Organizer

```
[Landing Page] 
  → [Login / Register]
  → [Dashboard] 
  → [Buat Sesi Baru] 
  → [Upload / Foto Struk]
  → [Review Hasil OCR & Edit]
  → [Undang Anggota (link/WA)]
  → [Alokasi Item ke Anggota]
  → [Atur Pajak, Tips, Biaya Ekstra]
  → [Preview Tagihan per Orang]
  → [Kirim Tagihan]
  → [Monitor Status Pembayaran]
  → [Sesi Selesai]
```

### Flow Pendukung: Anggota (Guest)

```
[Terima Link Undangan]
  → [Buka Link (tanpa login wajib)]
  → [Lihat Detail Tagihan Saya]
  → [Pilih Metode Pembayaran]
  → [Bayar via QRIS / VA / e-Wallet]
  → [Konfirmasi Pembayaran]
  → [Terima Bukti Pembayaran]
```

---

## 6. Arsitektur Teknis

### Stack Teknologi

```
┌─────────────────────────────────────────────┐
│                   Frontend                  │
│  Next.js 14 (App Router) + TypeScript       │
│  Tailwind CSS + Shadcn/ui + Framer Motion   │
│  Zustand (State) + React Query (Data Fetch) │
└──────────────────────┬──────────────────────┘
                       │ API Routes / Server Actions
┌──────────────────────▼──────────────────────┐
│                   Backend                   │
│  Next.js API Routes + Server Actions        │
│  Prisma ORM + PostgreSQL (self-hosted/Neon) │
│  Auth0 (Authentication & Authorization)     │
└──────┬───────────────┬───────────────┬──────┘
       │               │               │
┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│   OCR API   │ │  Payment GW  │ │  Notifikasi │
│  Google     │ │  Midtrans /  │ │  Resend     │
│  Vision AI  │ │  Xendit /    │ │  (Email)    │
│  / Tesseract│ │  Stripe      │ │  Fonnte     │
│  / AWS      │ │              │ │  (WhatsApp) │
│  Textract   │ └─────────────┘ └─────────────┘
└─────────────┘
```

### Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  auth0Id       String    @unique  // sub dari Auth0 JWT token
  name          String
  email         String    @unique
  phone         String?
  avatar        String?
  sessions      BillSession[]
  memberships   BillMember[]
  transactions  Transaction[]
  createdAt     DateTime  @default(now())
}

model BillSession {
  id            String    @id @default(cuid())
  title         String
  description   String?
  merchantName  String?
  receiptUrl    String?
  status        SessionStatus @default(DRAFT)
  totalAmount   Decimal
  taxAmount     Decimal   @default(0)
  tipAmount     Decimal   @default(0)
  currency      String    @default("IDR")
  splitType     SplitType @default(PER_ITEM)
  inviteCode    String    @unique
  createdBy     User      @relation(fields: [userId], references: [id])
  userId        String
  members       BillMember[]
  items         BillItem[]
  createdAt     DateTime  @default(now())
  expiresAt     DateTime?
}

model BillItem {
  id            String    @id @default(cuid())
  name          String
  quantity      Int       @default(1)
  unitPrice     Decimal
  totalPrice    Decimal
  session       BillSession @relation(fields: [sessionId], references: [id])
  sessionId     String
  allocations   ItemAllocation[]
}

model BillMember {
  id            String    @id @default(cuid())
  name          String
  email         String?
  phone         String?
  user          User?     @relation(fields: [userId], references: [id])
  userId        String?
  session       BillSession @relation(fields: [sessionId], references: [id])
  sessionId     String
  shareAmount   Decimal
  isPaid        Boolean   @default(false)
  paymentLink   String?
  transaction   Transaction?
  allocations   ItemAllocation[]
}

model ItemAllocation {
  id            String    @id @default(cuid())
  item          BillItem  @relation(fields: [itemId], references: [id])
  itemId        String
  member        BillMember @relation(fields: [memberId], references: [id])
  memberId      String
  quantity      Int       @default(1)
  splitFraction Decimal   @default(1)
}

model Transaction {
  id            String    @id @default(cuid())
  member        BillMember @relation(fields: [memberId], references: [id])
  memberId      String    @unique
  user          User?     @relation(fields: [userId], references: [id])
  userId        String?
  amount        Decimal
  status        PaymentStatus @default(PENDING)
  paymentMethod String?
  gatewayRef    String?
  paidAt        DateTime?
  createdAt     DateTime  @default(now())
}

enum SessionStatus { DRAFT ACTIVE COMPLETED CANCELLED }
enum SplitType     { EQUAL PERCENTAGE PER_ITEM }
enum PaymentStatus { PENDING PROCESSING PAID FAILED REFUNDED }
```

---

## 7. Integrasi Pihak Ketiga

### Autentikasi — Auth0

| Fitur Auth0 | Deskripsi |
|---|---|
| **Universal Login** | Hosted login page — tidak perlu bangun UI login sendiri |
| **Social Connections** | Google, GitHub, Apple login built-in |
| **Management API** | CRUD user dari backend |
| **Actions / Hooks** | Sync user ke DB PostgreSQL saat pertama login |
| **Machine-to-Machine** | Token untuk komunikasi antar service |
| **RBAC** | Role-based access control (organizer vs member) |

> **Setup:** Gunakan `@auth0/nextjs-auth0` SDK. Saat user pertama login via Auth0, jalankan **Auth0 Action** atau API route untuk upsert data user ke PostgreSQL lokal berdasarkan `sub` (auth0Id).

```typescript
// Contoh: Sync user ke DB saat login (via /api/auth/[auth0]/route.ts)
const session = await getSession();
if (session?.user) {
  await prisma.user.upsert({
    where: { auth0Id: session.user.sub },
    update: { name: session.user.name, avatar: session.user.picture },
    create: {
      auth0Id: session.user.sub,
      email: session.user.email,
      name: session.user.name,
      avatar: session.user.picture,
    },
  });
}
```

### OCR Engine

| Provider | Kelebihan | Kekurangan | Biaya |
|---|---|---|---|
| **Google Cloud Vision AI** | Akurasi tinggi, support HEIC | Berbayar per request | $1.5/1000 req |
| **AWS Textract** | Unggul untuk dokumen terstruktur | Setup lebih kompleks | $1.5/1000 req |
| **Tesseract.js** | Free, open-source | Akurasi lebih rendah | Free |
| **OpenAI GPT-4o Vision** | Fleksibel, bisa ekstrak + parse | Token-based pricing | ~$0.01/struk |

> **Rekomendasi:** Mulai dengan **OpenAI GPT-4o Vision** (prompt engineering untuk ekstrak item) karena fleksibel dan hasilnya langsung dalam format JSON terstruktur.

### Payment Gateway

| Provider | Keunggulan | Biaya MDR |
|---|---|---|
| **Midtrans** | Populer di Indonesia, QRIS, VA lengkap | 0.7% - 2.9% |
| **Xendit** | API developer-friendly, sandbox bagus | 0.7% - 2.9% |
| **Stripe** | Internasional, dokumentasi terbaik | 1.5% + Rp 2.000 |

> **Rekomendasi:** **Midtrans** untuk fokus pasar Indonesia, dengan opsi tambah **Stripe** untuk internasional di fase 2.

### Komunikasi & Notifikasi

| Kebutuhan | Provider |
|---|---|
| Email Transaksional | **Resend** (developer-friendly, free 3000 email/bulan) |
| WhatsApp | **Fonnte** atau **Twilio** (WA Business API) |
| SMS OTP | Auth0 built-in SMS OTP atau **Twilio** |

---

## 8. Struktur Halaman & Routes

```
/                          → Landing Page
/auth/login                → Login
/auth/register             → Register
/auth/callback             → OAuth Callback

/dashboard                 → Dashboard utama user
/dashboard/history         → Riwayat sesi
/dashboard/profile         → Profil & payment settings
/dashboard/stats           → Statistik pengeluaran

/session/new               → Buat sesi baru
/session/[id]              → Detail sesi (organizer view)
/session/[id]/scan         → Upload/scan struk
/session/[id]/items        → Review & edit item OCR
/session/[id]/members      → Manajemen anggota
/session/[id]/split        → Alokasi & pembagian
/session/[id]/preview      → Preview tagihan final
/session/[id]/payment      → Status pembayaran per anggota

/pay/[inviteCode]          → Public payment page (guest, tanpa login)
/pay/[inviteCode]/success  → Halaman sukses pembayaran
/pay/[inviteCode]/failed   → Halaman gagal pembayaran

/api/ocr/scan              → POST: proses OCR
/api/session               → CRUD sesi
/api/session/[id]/members  → Kelola anggota
/api/payment/create        → Buat payment link
/api/payment/webhook       → Webhook dari payment gateway
/api/notification/send     → Kirim notifikasi
```

---

## 9. Desain & UI/UX Guidelines

### Design Principles
1. **Simplicity First** — Alur utama harus selesai dalam < 5 tap/klik
2. **Mobile-First** — 80% pengguna diperkirakan akses via mobile
3. **Realtime Feedback** — Status pembayaran update real-time tanpa refresh
4. **Trust & Transparency** — Tampilkan detail kalkulasi yang jelas

### Color Palette

```
Primary:   #6366F1 (Indigo)
Secondary: #EC4899 (Pink)
Success:   #10B981 (Emerald)
Warning:   #F59E0B (Amber)
Error:     #EF4444 (Red)
BG Dark:   #0F172A
BG Card:   #1E293B
Text:      #F8FAFC
```

### Komponen UI Kritis
- **Receipt Scanner** — Drag-drop area dengan animasi scan
- **Item Allocation Board** — Kanban-style assignment item ke orang
- **Bill Summary Card** — Kartu tagihan per orang dengan status pembayaran
- **Payment Status Badge** — Badge realtime (Menunggu / Diproses / Lunas)
- **Split Visualizer** — Pie chart distribusi tagihan

---

## 10. Keamanan (Security)

| Area | Implementasi |
|---|---|
| Autentikasi | **Auth0** — managed auth, JWT RS256, token rotation |
| Otorisasi | Auth0 RBAC + middleware Next.js (owner vs member) |
| Session | Auth0 session cookie + `getSession()` di Server Components |
| Payment | Validasi webhook signature dari payment gateway |
| Data | Enkripsi data sensitif (nomor rekening) |
| File Upload | Validasi MIME type, max 10MB, scan malware |
| Rate Limiting | Upstash Redis rate limiter di API routes |
| HTTPS | Wajib HTTPS di semua environment |
| Input Validation | Zod schema validation di semua API |

---

## 11. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| **Performance** | LCP < 2.5 detik, FID < 100ms |
| **Availability** | Uptime 99.9% |
| **Skalabilitas** | Support 1000 concurrent users di fase 1 |
| **OCR Response** | < 5 detik per struk |
| **Payment Process** | Konfirmasi dalam < 30 detik |
| **Mobile** | Fully responsive, PWA-ready |
| **Browser** | Chrome, Firefox, Safari, Edge (2 versi terakhir) |
| **Aksesibilitas** | WCAG 2.1 Level AA |

---

## 12. Roadmap Pengembangan

### Phase 1 — MVP (Bulan 1–3)
- [ ] Setup project Next.js + Auth + DB
- [ ] Upload & OCR struk (Google Vision / GPT-4o)
- [ ] Edit manual hasil OCR
- [ ] Buat sesi, undang anggota via link
- [ ] Split rata & split per item
- [ ] Integrasi Midtrans (QRIS + Virtual Account)
- [ ] Webhook konfirmasi pembayaran
- [ ] Halaman pembayaran publik (tanpa login)
- [ ] Email notifikasi (Resend)
- [ ] Dashboard dasar

### Phase 2 — Growth (Bulan 4–6)
- [ ] Login via Google OAuth
- [ ] WhatsApp notifikasi & reminder
- [ ] Split kustom (persentase)
- [ ] Grup tersimpan
- [ ] Tips calculator
- [ ] Statistik pengeluaran
- [ ] Export CSV/PDF
- [ ] PWA (offline support)

### Phase 3 — Scale (Bulan 7–12)
- [ ] Multi-currency support
- [ ] Integrasi Stripe (internasional)
- [ ] Fitur hutang-piutang rekap
- [ ] API publik untuk bisnis
- [ ] Mobile App (React Native / Expo)
- [ ] AI Smart Split (saran alokasi otomatis)
- [ ] Fitur grup standing (langganan split rutin)

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|
| Akurasi OCR rendah | Tinggi | Sedang | Selalu sediakan mode edit manual; retrain/ganti engine |
| Gagal pembayaran | Tinggi | Rendah | Retry mechanism, notifikasi ke user, dukungan CS |
| Skalabilitas DB | Sedang | Sedang | Indexing yang baik, PgBouncer connection pooling |
| Keamanan data | Sangat Tinggi | Rendah | Enkripsi, audit reguler, tidak menyimpan data kartu |
| Auth0 rate limit | Rendah | Rendah | Monitor Auth0 quota, upgrade plan jika MAU bertumbuh |
| Vendor lock-in OCR | Sedang | Sedang | Abstraksi layer OCR agar mudah ganti provider |
| Regulasi Fintech | Tinggi | Sedang | Konsultasi OJK, pastikan bukan termasuk payment processor |

---

## 14. Estimasi Biaya Infrastruktur (Bulanan)

| Layanan | Plan | Estimasi Biaya |
|---|---|---|
| Vercel (Hosting) | Pro | $20/bulan |
| PostgreSQL (Neon / Railway) | Free → Pro | $0–$20/bulan |
| File Storage (Cloudflare R2) | Pay-as-you-go | ~$5/bulan |
| **Auth0** | Free (≤7.500 MAU) → Essential ($35) | $0–$35/bulan |
| OpenAI API (OCR) | Pay-as-you-go | ~$50/bulan (5000 struk) |
| Midtrans | Pay-per-transaction | 0.7–2.9% per transaksi |
| Resend (Email) | Free → Pro | $0–$20/bulan |
| Upstash Redis | Free → Pay-as-you-go | $0–$10/bulan |
| **Total Estimasi** | | **~$75–$160/bulan** |

---

## 15. Definisi Done (Definition of Done)

Sebuah fitur dianggap selesai jika:
1. ✅ Kode telah di-review dan di-merge ke `main`
2. ✅ Unit test dan integration test tersedia
3. ✅ Berjalan di environment staging tanpa error
4. ✅ Desain sesuai dengan guidelines UI/UX
5. ✅ Dokumentasi API diperbarui
6. ✅ Tidak ada regresi pada fitur yang sudah ada

---

## 16. Glosarium

| Istilah | Definisi |
|---|---|
| OCR | Optical Character Recognition — teknologi membaca teks dari gambar |
| Split Bill | Proses membagi tagihan ke beberapa orang |
| QRIS | QR Code Indonesian Standard — standar QR pembayaran Indonesia |
| Virtual Account | Nomor rekening virtual untuk menerima pembayaran |
| MDR | Merchant Discount Rate — biaya yang dikenakan payment gateway |
| Webhook | HTTP callback dari payment gateway untuk konfirmasi pembayaran |
| Session | Satu sesi split bill dari scan struk hingga semua lunas |
| PWA | Progressive Web App — web app yang bisa di-install seperti native app |
| Auth0 | Identity provider SaaS — mengelola autentikasi & otorisasi |
| auth0Id | Field `sub` dari JWT Auth0, dipakai sebagai foreign key ke tabel User |
| RBAC | Role-Based Access Control — otorisasi berdasarkan peran pengguna |

---

*Dokumen ini adalah dokumen hidup dan akan terus diperbarui seiring perkembangan produk.*

**Last Updated:** 2026-08-06 (v1.1 — Auth0 + PostgreSQL) | **Next Review:** 2026-09-01
