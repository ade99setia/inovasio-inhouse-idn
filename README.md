# Backend System Development with AI Advance

Repositori ini berisi source code dan materi pelatihan **Backend System Development** menggunakan Node.js, Express, MySQL, JWT, dan Docker.

## Navigasi Materi

Repository ini menggunakan sistem **commit per sesi/challenge**. Untuk berpindah ke materi tertentu, gunakan:

```bash
# Lihat daftar semua commit (materi)
git log --oneline

# Pindah ke materi tertentu
git reset --hard <commit-hash>

# Kembali ke materi terbaru
git pull origin main
```

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/adesetiawan/inhouse-training.git
cd inhouse-training/backend
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` sesuai konfigurasi database kamu:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=devuser
DB_PASSWORD=your_password
DB_NAME=db_training
JWT_SECRET=your_jwt_secret
```

### 3. Jalankan dengan Docker

```bash
docker compose up -d --build
```

Ini akan menjalankan:
- **API** → `http://localhost:8088`
- **MySQL** → `localhost:3309`

Database otomatis ter-setup (schema + seed data) saat pertama kali jalan.

### 4. Verifikasi

```bash
curl http://localhost:8088/api/health
```

Response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## Tanpa Docker (Local Development)

```bash
cd backend
npm install
npm run dev
```

Pastikan MySQL sudah jalan dan `.env` mengarah ke database yang benar. Import schema secara manual:

```bash
mysql -u devuser -p db_training < database/init/001_schema.sql
mysql -u devuser -p db_training < database/init/002_seed.sql
```

## Struktur Project

```
backend/
├── src/
│   ├── app.js                    # Entry point
│   ├── config/database.js        # MySQL connection pool
│   ├── controllers/              # Business logic
│   ├── middleware/               # Auth & authorization
│   ├── models/                   # Data access layer
│   └── routes/                   # API routing
├── database/
│   └── init/
│       ├── 001_schema.sql        # Table definitions
│       └── 002_seed.sql          # Sample data
├── docs/
│   ├── erd.md                    # Database design & ERD
│   ├── api-documentation.md      # API reference (Postman)
│   └── tech-stack.md             # Tech stack & architecture
├── docker-compose.yml
├── Dockerfile
├── package.json
└── .env.example
```

## Testing dengan Postman

### Import Collection

File siap import ada di folder `backend/docs/`:

1. Buka Postman → **Import** (pojok kiri atas)
2. Drag & drop `backend/docs/postman_collection.json` → Import
3. Buka **Environments** (icon gear) → **Import** → drag `backend/docs/postman_environment.json`
4. Pilih environment **"Inhouse Training"** di dropdown kanan atas
5. Hit request **Login (Admin)** → token otomatis tersimpan ke `{{token}}`
6. Semua request lain langsung bisa dipakai

### Collection Structure

| Folder | Requests |
|--------|----------|
| Health | Health Check |
| Auth | Register, Login Admin, Login Customer, Get Profile |
| Products | List, Search, Get by ID, Create, Update, Delete |
| Orders | List, Filter Status, Get by ID, Create, Update Status |

### Auto-Save Token

Script di request Login otomatis simpan token ke environment:
```javascript
if (pm.response.code === 200) {
    const res = pm.response.json();
    pm.environment.set("token", res.data.token);
}
```

## Akun Testing

| Email | Password | Role |
|-------|----------|------|
| admin@inovasia.com | password123 | admin |
| budi@inovasia.com | password123 | customer |
| siti@inovasia.com | password123 | customer |
| andi@inovasia.com | password123 | customer |

## API Endpoints

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | /api/health | - | Health check |
| POST | /api/auth/register | - | Register user |
| POST | /api/auth/login | - | Login (JWT) |
| GET | /api/auth/profile | Bearer | Profil user |
| GET | /api/products | - | List produk |
| GET | /api/products/:id | - | Detail produk |
| POST | /api/products | Admin | Buat produk |
| PUT | /api/products/:id | Admin | Update produk |
| DELETE | /api/products/:id | Admin | Hapus produk |
| GET | /api/orders | Bearer | List order |
| GET | /api/orders/:id | Bearer | Detail order |
| POST | /api/orders | Bearer | Buat order |
| PATCH | /api/orders/:id/status | Admin | Update status |

Dokumentasi lengkap: [`docs/api-documentation.md`](backend/docs/api-documentation.md)

## Tech Stack

- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.21
- **Database:** MySQL 8.0
- **Auth:** JWT + bcryptjs
- **Container:** Docker + Docker Compose

Detail lengkap: [`docs/tech-stack.md`](backend/docs/tech-stack.md)

## Tips untuk Peserta

1. **Lihat commit history** untuk memahami progression materi
2. **Gunakan Postman** untuk testing API — setup guide ada di docs
3. **Jangan takut reset** — `git reset --hard` lalu `docker compose down -v && docker compose up -d --build` untuk fresh start
4. **Baca error message** — API memberikan pesan error yang jelas untuk setiap validasi

## Trainer

**Ade Setiawan** — Backend Developer & System Architect
