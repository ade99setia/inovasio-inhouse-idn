# API Documentation - Order Management System

**Base URL:** `https://inovasia.ade-setiawan.my.id`

## Postman Environment Variables

| Variable | Value |
|----------|-------|
| `base_url` | `https://inovasia.ade-setiawan.my.id` |
| `token` | *(auto-set setelah login)* |

---

## 1. Health Check

### GET `/api/health`

Cek status API dan koneksi database.

**Request:**
```
GET {{base_url}}/api/health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-08-18T04:23:15.404Z",
  "database": "connected",
  "environment": "production"
}
```

---

## 2. Authentication

### POST `/api/auth/register`

Register user baru.

**Request:**
```
POST {{base_url}}/api/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@inovasia.com",
  "password": "password123",
  "role": "customer"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": 5,
      "name": "John Doe",
      "email": "john@inovasia.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 400 | Name, email, and password are required. |
| 400 | Password must be at least 6 characters. |
| 409 | Email already registered. |

---

### POST `/api/auth/login`

Login dan dapatkan JWT token.

**Request:**
```
POST {{base_url}}/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@inovasia.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin Training",
      "email": "admin@inovasia.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Postman Script (auto-set token):**
Tambahkan di tab "Tests" pada request login:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 400 | Email and password are required. |
| 401 | Invalid email or password. |

---

### GET `/api/auth/profile`

Lihat profil user yang sedang login.

**Request:**
```
GET {{base_url}}/api/auth/profile
Authorization: Bearer {{token}}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin Training",
      "email": "admin@inovasia.com",
      "role": "admin",
      "created_at": "2026-08-18T04:16:25.000Z",
      "updated_at": "2026-08-18T04:16:25.000Z"
    }
  }
}
```

---

## 3. Products

### GET `/api/products`

Ambil daftar semua produk (public, tanpa auth).

**Request:**
```
GET {{base_url}}/api/products
```

**Query Parameters:**
| Param | Type | Default | Keterangan |
|-------|------|---------|------------|
| page | int | 1 | Halaman |
| limit | int | 10 | Jumlah per halaman |
| search | string | - | Cari berdasarkan nama/SKU |

**Contoh dengan filter:**
```
GET {{base_url}}/api/products?page=1&limit=5&search=laptop
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "sku": "PROD-001",
      "name": "Laptop Asus VivoBook 14",
      "price": "8500000.00",
      "stock": 25,
      "description": "Laptop ringan untuk produktivitas sehari-hari",
      "created_at": "2026-08-18T04:16:25.000Z",
      "updated_at": "2026-08-18T04:16:25.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "totalPages": 1
  }
}
```

---

### GET `/api/products/:id`

Ambil detail satu produk (public).

**Request:**
```
GET {{base_url}}/api/products/1
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "product": {
      "id": 1,
      "sku": "PROD-001",
      "name": "Laptop Asus VivoBook 14",
      "price": "8500000.00",
      "stock": 25,
      "description": "Laptop ringan untuk produktivitas sehari-hari",
      "created_at": "2026-08-18T04:16:25.000Z",
      "updated_at": "2026-08-18T04:16:25.000Z"
    }
  }
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 404 | Product not found. |

---

### POST `/api/products`

Buat produk baru. **Admin only.**

**Request:**
```
POST {{base_url}}/api/products
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "sku": "PROD-011",
  "name": "Charger Anker 65W USB-C",
  "price": 450000,
  "stock": 50,
  "description": "Fast charger multi-port"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Product created successfully.",
  "data": {
    "product": {
      "id": 11,
      "sku": "PROD-011",
      "name": "Charger Anker 65W USB-C",
      "price": 450000,
      "stock": 50,
      "description": "Fast charger multi-port"
    }
  }
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 400 | SKU, name, and price are required. |
| 401 | Access denied. No token provided. |
| 403 | Forbidden. Insufficient permissions. |
| 409 | SKU already exists. |

---

### PUT `/api/products/:id`

Update produk. **Admin only.**

**Request:**
```
PUT {{base_url}}/api/products/11
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "name": "Charger Anker 65W USB-C (Updated)",
  "price": 475000,
  "stock": 45
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Product updated successfully.",
  "data": {
    "product": { ... }
  }
}
```

---

### DELETE `/api/products/:id`

Hapus produk. **Admin only.** Gagal jika produk sudah direferensikan oleh order.

**Request:**
```
DELETE {{base_url}}/api/products/11
Authorization: Bearer {{token}}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Product deleted successfully."
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 404 | Product not found. |
| 409 | Cannot delete product. It is referenced by existing orders. |

---

## 4. Orders

### GET `/api/orders`

Ambil daftar order. **Requires auth.**
- Admin: melihat semua order
- Customer: hanya melihat order milik sendiri

**Request:**
```
GET {{base_url}}/api/orders
Authorization: Bearer {{token}}
```

**Query Parameters:**
| Param | Type | Default | Keterangan |
|-------|------|---------|------------|
| page | int | 1 | Halaman |
| limit | int | 10 | Jumlah per halaman |
| status | string | - | Filter: pending, processing, completed, cancelled |

**Contoh:**
```
GET {{base_url}}/api/orders?status=pending&page=1&limit=5
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "order_number": "ORD-20240101-001",
      "status": "completed",
      "subtotal": "9700000.00",
      "discount": "0.00",
      "total": "9700000.00",
      "created_at": "2026-08-18T04:16:25.000Z",
      "updated_at": "2026-08-18T04:16:25.000Z",
      "user_name": "Budi Santoso",
      "user_email": "budi@inovasia.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### GET `/api/orders/:id`

Detail order beserta items. **Requires auth.**
- Customer hanya bisa lihat order milik sendiri.

**Request:**
```
GET {{base_url}}/api/orders/1
Authorization: Bearer {{token}}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": 1,
      "user_id": 2,
      "order_number": "ORD-20240101-001",
      "status": "completed",
      "subtotal": "9700000.00",
      "discount": "0.00",
      "total": "9700000.00",
      "created_at": "2026-08-18T04:16:25.000Z",
      "updated_at": "2026-08-18T04:16:25.000Z",
      "user_name": "Budi Santoso",
      "user_email": "budi@inovasia.com",
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "product_id": 1,
          "quantity": 1,
          "unit_price": "8500000.00",
          "subtotal": "8500000.00",
          "product_name": "Laptop Asus VivoBook 14",
          "product_sku": "PROD-001"
        },
        {
          "id": 2,
          "order_id": 1,
          "product_id": 2,
          "quantity": 1,
          "unit_price": "1200000.00",
          "subtotal": "1200000.00",
          "product_name": "Mouse Logitech MX Master 3",
          "product_sku": "PROD-002"
        }
      ]
    }
  }
}
```

---

### POST `/api/orders`

Buat order baru. **Requires auth.**
- Harga otomatis di-snapshot dari harga produk saat ini
- Stock otomatis berkurang
- Jika stock tidak cukup, order gagal (rollback)

**Request:**
```
POST {{base_url}}/api/orders
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "items": [
    { "product_id": 1, "quantity": 1 },
    { "product_id": 3, "quantity": 2 }
  ]
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Order created successfully.",
  "data": {
    "order": {
      "id": 4,
      "user_id": 1,
      "order_number": "ORD-20260818-966A23EF",
      "status": "pending",
      "subtotal": "10400000.00",
      "discount": "0.00",
      "total": "10400000.00",
      "items": [...]
    }
  }
}
```

**Error Cases:**
| Status | Message |
|--------|---------|
| 400 | Order items are required. Provide an array of { product_id, quantity }. |
| 400 | Each item must have product_id and quantity > 0. |
| 400 | Insufficient stock for "Product Name". Available: X, Requested: Y. |
| 404 | Product with ID X not found. |

---

### PATCH `/api/orders/:id/status`

Update status order. **Admin only.**

**Request:**
```
PATCH {{base_url}}/api/orders/3/status
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "status": "processing"
}
```

**Valid Status Values:** `pending`, `processing`, `completed`, `cancelled`

**Response (200):**
```json
{
  "status": "success",
  "message": "Order status updated to \"processing\".",
  "data": {
    "order": { ... }
  }
}
```

---

## 5. Error Responses (Global)

### 401 - Unauthorized
```json
{
  "status": "error",
  "message": "Access denied. No token provided."
}
```

### 401 - Token Expired
```json
{
  "status": "error",
  "message": "Token expired. Please login again."
}
```

### 403 - Forbidden
```json
{
  "status": "error",
  "message": "Forbidden. Insufficient permissions."
}
```

### 404 - Not Found
```json
{
  "status": "error",
  "message": "Route GET /api/unknown not found"
}
```

---

## 6. Akun Testing

| Email | Password | Role | Hak Akses |
|-------|----------|------|-----------|
| admin@inovasia.com | password123 | admin | Full CRUD products + manage semua orders |
| budi@inovasia.com | password123 | customer | View products, buat & lihat order sendiri |
| siti@inovasia.com | password123 | customer | View products, buat & lihat order sendiri |
| andi@inovasia.com | password123 | customer | View products, buat & lihat order sendiri |

---

## 7. Postman Tips

### Auto-set Token setelah Login
Tambahkan script ini di tab **Tests** pada request Login:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

### Header Template untuk Protected Routes
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

### Urutan Testing yang Direkomendasikan
1. `GET /api/health` → pastikan API & DB connected
2. `POST /api/auth/login` → dapatkan token
3. `GET /api/auth/profile` → verifikasi token works
4. `GET /api/products` → lihat daftar produk
5. `POST /api/products` → buat produk baru (admin)
6. `POST /api/orders` → buat order
7. `GET /api/orders/:id` → lihat detail order + items
8. `PATCH /api/orders/:id/status` → update status (admin)
