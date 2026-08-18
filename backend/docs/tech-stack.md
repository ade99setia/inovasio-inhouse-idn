# Tech Stack - Inhouse Training Backend

## Runtime & Framework

| Layer | Teknologi | Versi | Keterangan |
|-------|-----------|-------|------------|
| Runtime | Node.js | 20 LTS (Alpine) | JavaScript runtime |
| Framework | Express.js | 4.21.0 | Minimalist web framework |
| Database | MySQL | 8.0 | Relational database |
| Container | Docker + Docker Compose | Latest | Containerization & orchestration |

## Dependencies (Production)

| Package | Versi | Fungsi |
|---------|-------|--------|
| `express` | 4.21.0 | HTTP server & routing |
| `mysql2` | 3.11.0 | MySQL driver (promise-based) |
| `bcryptjs` | 2.4.3 | Password hashing |
| `jsonwebtoken` | 9.0.2 | JWT token generation & verification |
| `cors` | 2.8.5 | Cross-Origin Resource Sharing |
| `dotenv` | 16.4.5 | Environment variables loader |
| `uuid` | 10.0.0 | Generate unique order numbers |

## Dependencies (Development)

| Package | Versi | Fungsi |
|---------|-------|--------|
| `nodemon` | 3.1.4 | Auto-restart saat file berubah |

## Infrastructure

| Komponen | Detail |
|----------|--------|
| Server | Home Server (Kubuntu) via Tailscale |
| IP Private | 100.97.152.1 |
| API Port | 8088 (external) → 3000 (internal) |
| DB Port | 3309 (external) → 3306 (internal) |
| Domain | https://inovasia.ade-setiawan.my.id |
| Tunnel | Cloudflare Tunnel → shared_web_network |
| Network (isolated) | app_network_inhouse_training |
| Network (shared) | shared_web_network |

## Arsitektur Aplikasi

```
├── src/
│   ├── app.js                 # Entry point, middleware, routes
│   ├── config/
│   │   └── database.js        # MySQL connection pool
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, Login, Profile
│   │   ├── product.controller.js # CRUD Products
│   │   └── order.controller.js   # CRUD Orders
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT verify + role-based access
│   ├── models/
│   │   ├── user.model.js        # User queries
│   │   ├── product.model.js     # Product queries + pagination
│   │   └── order.model.js       # Order + transaction
│   └── routes/
│       ├── auth.routes.js
│       ├── product.routes.js
│       └── order.routes.js
├── database/
│   └── init/
│       ├── 001_schema.sql       # DDL: tables, FK, indexes
│       └── 002_seed.sql         # Sample data
├── docs/
│   ├── erd.md                   # Database design & ERD
│   ├── api-documentation.md     # API endpoint reference
│   └── tech-stack.md            # This file
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env
└── .env.example
```

## Design Patterns

| Pattern | Implementasi |
|---------|-------------|
| MVC | Model → Controller → Route (tanpa view, API only) |
| Repository Pattern | Model class sebagai data access layer |
| Middleware Chain | Auth → Authorize → Controller |
| Connection Pool | mysql2 pool (max 10 connections) |
| Transaction | Order creation dengan rollback on failure |
| Price Snapshot | unit_price disimpan saat transaksi, independen dari perubahan harga |

## Security

| Fitur | Detail |
|-------|--------|
| Password Hashing | bcrypt (10 salt rounds) |
| Authentication | JWT (expires 24h) |
| Authorization | Role-based (admin, customer) |
| Input Validation | Controller-level validation |
| DB Constraints | FK, CHECK, UNIQUE di level database |
| Container Security | Non-root user di Dockerfile |
| Network Isolation | Service terpisah dari container lain |

## Docker Containers

| Container | Image | Status |
|-----------|-------|--------|
| `inhouse_training_api` | `backend-api:latest` (build local) | Running |
| `inhouse_training_db` | `mysql:8.0` | Running (Healthy) |
