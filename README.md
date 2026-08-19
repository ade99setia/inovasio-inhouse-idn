# Backend System Development with AI Advance

REST API Order Management System menggunakan **Layered Architecture** — Node.js, Express, MySQL 8, JWT, Docker.

## Architecture

```
Client (Postman / Frontend)
        ↓
   Middleware (Helmet, CORS, Rate Limit, Auth, Validate)
        ↓
      Router (routing only)
        ↓
    Controller (req/res handling)
        ↓
     Service (business logic, transaction)
        ↓
   Repository (SQL queries, database access)
        ↓
      MySQL 8
```

**Rules:**
- Router → hanya routing, tidak boleh SQL atau business logic
- Controller → handle req/res, panggil service, tentukan HTTP response
- Service → business logic, orchestration, transaction, panggil repository
- Repository → semua akses database, SQL query, CRUD, JOIN

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express app + middleware
│   ├── config/
│   │   └── database.js        # MySQL connection pool
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   └── order.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   └── order.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   └── order.service.js
│   ├── repositories/
│   │   ├── user.repository.js
│   │   ├── product.repository.js
│   │   └── order.repository.js
│   ├── middlewares/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── validations/
│   │   ├── auth.validation.js
│   │   ├── product.validation.js
│   │   └── order.validation.js
│   └── utils/
│       ├── AppError.js
│       ├── asyncHandler.js
│       └── response.js
├── database/
│   └── init/
│       ├── 001_schema.sql
│       └── 002_seed.sql
├── docs/
│   ├── erd.md
│   ├── api-documentation.md
│   └── tech-stack.md
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env.example
└── .gitignore
```

## Installation

### Docker (Recommended)

```bash
git clone https://github.com/adesetiawan/inhouse-training.git
cd inhouse-training/backend
cp .env.example .env
# Edit .env sesuai kebutuhan
docker compose up -d --build
```

API jalan di `http://localhost:8088`

### Local Development

```bash
cd backend
cp .env.example .env
# Edit .env → DB_HOST=localhost, DB_PORT=3309
npm install
npm run dev
```

## Environment Setup

```env
PORT=3000
NODE_ENV=development

DB_HOST=db
DB_PORT=3306
DB_USER=devuser
DB_PASSWORD=your_password
DB_NAME=db_training
DB_CONNECTION_LIMIT=10

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
```

## Database Setup

Schema dan seed otomatis dijalankan saat Docker container pertama kali start.

Manual import:
```bash
mysql -u devuser -p db_training < database/init/001_schema.sql
mysql -u devuser -p db_training < database/init/002_seed.sql
```

## API Endpoints

Base URL: `https://inovasia.ade-setiawan.my.id/api/v1`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | - | Register user baru |
| POST | `/auth/login` | - | Login, dapatkan JWT |
| GET | `/auth/me` | Bearer | Profil user saat ini |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | - | List semua produk (pagination + search) |
| GET | `/products/:id` | - | Detail satu produk |
| POST | `/products` | Admin | Buat produk baru |
| PUT | `/products/:id` | Admin | Update produk |
| DELETE | `/products/:id` | Admin | Hapus produk |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders` | Bearer | List order (admin: semua, customer: milik sendiri) |
| GET | `/orders/:id` | Bearer | Detail order + items |
| POST | `/orders` | Bearer | Buat order baru |
| PATCH | `/orders/:id/status` | Admin | Update status order |

## Authentication Flow

```
Register/Login
      ↓
Password hash (bcrypt, 10 rounds)
      ↓
Generate JWT (payload: id, email, role)
      ↓
Client stores token
      ↓
Subsequent requests: Authorization: Bearer <token>
      ↓
Middleware verifies → sets req.user → next()
```

JWT payload hanya berisi identity (id, email, role). Tidak pernah berisi password, secret, atau data sensitif.

## Authorization

| Role | Products | Orders |
|------|----------|--------|
| admin | Full CRUD | Lihat semua + update status |
| customer | Read only | Buat + lihat order sendiri |

Ownership validation: customer hanya bisa akses order milik sendiri.

## Business Logic - Create Order

```
1. Validate request body (Joi)
2. Authenticate user (JWT)
3. BEGIN TRANSACTION
4. Lock products (SELECT ... FOR UPDATE)
5. Validate setiap product ada
6. Check stock tersedia
7. Snapshot harga saat ini → unit_price
8. Calculate subtotal per item
9. Calculate total order
10. INSERT order
11. INSERT order_items
12. UPDATE stock (decrement)
13. COMMIT
14. Return complete order
```

Jika salah satu step gagal → **ROLLBACK**.

## Transaction Flow

```
getConnection()
      ↓
  beginTransaction()
      ↓
  SELECT ... FOR UPDATE (lock rows)
      ↓
  INSERT / UPDATE operations
      ↓
  ┌─ Success → COMMIT
  └─ Error   → ROLLBACK
      ↓
  connection.release()
```

## Security

| Feature | Implementation |
|---------|---------------|
| Helmet | HTTP security headers |
| CORS | Cross-origin protection |
| Rate Limiting | 100 req / 15 min per IP |
| Body Limit | 10kb max request body |
| JWT Auth | Token-based authentication |
| Role Authorization | Admin/customer access control |
| Password Hashing | bcrypt 10 rounds |
| Parameterized Queries | Prevent SQL injection |
| Input Validation | Joi schema validation |
| Centralized Errors | No stack trace in production |
| Environment Variables | No hardcoded secrets |

**Never exposed:** password_hash, JWT_SECRET, DB credentials, stack traces (production).

## Validation

Request validation menggunakan **Joi**:
- Required fields
- Data types (string, number, email)
- String length (min/max)
- Numeric range (min: 0 for price/stock)
- Enum values (status: pending, processing, completed, cancelled)
- Array structure (order items)
- Custom error messages (bahasa yang jelas)

## Error Handling

Standardized response format:

**Success:**
```json
{
  "success": true,
  "message": "Products retrieved successfully.",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Product not found.",
  "error": { "code": "NOT_FOUND" }
}
```

HTTP Status Codes: 200, 201, 400, 401, 403, 404, 409, 422, 429, 500

## Testing dengan Postman

### Import Collection

File siap import ada di folder `backend/docs/`:

1. Buka Postman → **Import** (pojok kiri atas)
2. Drag & drop `backend/docs/postman_collection.json` → Import
3. Buka **Environments** (icon gear) → **Import** → drag `backend/docs/postman_environment.json`
4. Pilih environment **"Inhouse Training"** di dropdown kanan atas
5. Hit request **Login (Admin)** → token otomatis tersimpan
6. Semua request lain langsung bisa dipakai

### Collection Structure

| Folder | Requests |
|--------|----------|
| Health | Health Check |
| Auth | Register, Login Admin, Login Customer, Get Profile |
| Products | List, Search, Get by ID, Create, Update, Delete |
| Orders | List, Filter Status, Get by ID, Create, Update Status |
| Error Cases | Validation 422, Unauthorized 401, Forbidden 403, Not Found 404, Insufficient Stock, Wrong Password |

### Environment Variables
```
base_url = https://inovasia.ade-setiawan.my.id/api/v1
token = (auto-set setelah login)
```

### 1. Login

```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@inovasia.com",
  "password": "password123"
}
```

Post-response script (auto-save token):

**Postman:**
```javascript
if (pm.response.code === 200) {
  const res = pm.response.json();
  pm.environment.set("token", res.data.token);
}
```

**Hoppscotch:**

Saat import collection, post-request script tidak otomatis masuk. Paste manual di tab **Post-request Script** pada request Login:
```javascript
const res = pw.response.body;
pw.env.set("token", res.data.token);
```

### 2. Get Profile

```
GET {{base_url}}/auth/me
Authorization: Bearer {{token}}
```

### 3. List Products

```
GET {{base_url}}/products?page=1&limit=5&search=laptop
```

### 4. Create Product (Admin)

```
POST {{base_url}}/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "sku": "PROD-011",
  "name": "Charger Anker 65W",
  "price": 450000,
  "stock": 50,
  "description": "Fast charger USB-C"
}
```

### 5. Create Order

```
POST {{base_url}}/orders
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "items": [
    { "product_id": 1, "quantity": 1 },
    { "product_id": 3, "quantity": 2 }
  ]
}
```

### 6. Update Order Status (Admin)

```
PATCH {{base_url}}/orders/1/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "processing"
}
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

## Navigasi Materi

Repository menggunakan sistem commit per sesi:

```bash
# Lihat daftar materi
git log --oneline

# Pindah ke materi tertentu
git reset --hard <commit-hash>

# Fresh start database setelah reset
docker compose down -v && docker compose up -d --build
```

## Assumptions

- Role hanya `admin` dan `customer` (sesuai seed data)
- Order yang sudah `completed` atau `cancelled` tidak bisa diubah statusnya
- Discount di-set 0 secara default (bisa dikembangkan)
- Price snapshot: `order_items.unit_price` menyimpan harga saat transaksi
- Stock decrement otomatis saat order dibuat
- Tidak ada fitur restore stock saat order di-cancel (bisa dikembangkan)

## Trainer

**Ade Setiawan** — Backend Developer & System Architect
