# 🛍️ KUET Mini Market — Frontend

A full-stack role-based e-commerce web application built for the KUET community. This repository contains the **React frontend**. The Spring Boot backend lives in a separate repository.

---

## 🔗 Related Repository

| Layer    | Stack                            | Repo                                                                  |
| -------- | -------------------------------- | --------------------------------------------------------------------- |
| Frontend | React 18 + Vite + React Router   | **This repo**                                                         |
| Backend  | Spring Boot 4 + PostgreSQL + JWT | [KUET-Mini-Market](https://github.com/your-username/KUET-Mini-Market) |

---

## ✨ Features

### Role-Based Access Control

The application supports three distinct roles:

| Role     | Capabilities                                                                      |
| -------- | --------------------------------------------------------------------------------- |
| `BUYER`  | Browse products, add to cart, place orders, view own order history, cancel orders |
| `SELLER` | List & manage own products, view sales orders, mark orders as completed/cancelled |
| `ADMIN`  | View all orders, manage all users (activate / deactivate)                         |

> A user can hold multiple roles (e.g., BUYER + SELLER simultaneously).

### Core Features

- **Authentication** — JWT-based login & registration with role selection
- **Product Browsing** — Public product listing with search & status filter (ACTIVE / SOLD_OUT / REMOVED)
- **Product Management** — SELLER can create, edit, delete their own products
- **Shopping Cart** — Client-side cart with quantity controls, persists during session
- **Order Placement** — BUYER checks out cart → creates order → stock is auto-decremented on backend
- **Order History** — BUYER sees their purchases; SELLER sees sales containing their products
- **Order Lifecycle** — Orders can be completed (SELLER) or cancelled (BUYER / SELLER / ADMIN)
- **Admin Panel** — View all users, activate or deactivate accounts
- **Automatic 401 Handling** — Expired/invalid tokens redirect to login automatically

---

## 🖥️ Tech Stack

| Technology       | Version | Purpose                             |
| ---------------- | ------- | ----------------------------------- |
| React            | 18.2    | UI framework                        |
| Vite             | 5.1     | Build tool & dev server             |
| React Router DOM | 6.22    | Client-side routing                 |
| Axios            | 1.6     | HTTP client with interceptors       |
| Context API      | —       | Global auth & cart state management |

---

## 📁 Project Structure

```
mini-market-ui/
├── src/
│   ├── api/
│   │   └── axios.js              # Axios instance — JWT injector, 401 handler,
│   │                             # snake_case → camelCase response normalizer
│   ├── context/
│   │   ├── AuthContext.jsx       # Login, register, logout, JWT decoder, hasRole()
│   │   └── CartContext.jsx       # Cart state — add, remove, update qty, clear
│   ├── components/
│   │   ├── Navbar.jsx            # Role-aware navigation bar with cart badge
│   │   ├── ProductCard.jsx       # Product card with role-aware action buttons
│   │   └── ProtectedRoute.jsx    # Route guard — blocks access by role
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx      # Role selection (BUYER / SELLER / both)
│   │   ├── ProductsPage.jsx      # Public listing with search & status filter
│   │   ├── ProductDetailPage.jsx # Detail view — add to cart / edit / delete
│   │   ├── ProductFormPage.jsx   # Create & edit product (SELLER)
│   │   ├── MyProductsPage.jsx    # Seller's own products table (SELLER)
│   │   ├── CartPage.jsx          # Cart review + checkout (BUYER)
│   │   ├── MyOrdersPage.jsx      # Order history with cancel (BUYER)
│   │   ├── SalesOrdersPage.jsx   # Incoming orders — complete/cancel (SELLER)
│   │   ├── AllOrdersPage.jsx     # All orders with filter (ADMIN)
│   │   └── AdminUsersPage.jsx    # User management — activate/deactivate (ADMIN)
│   ├── App.jsx                   # Route definitions with ProtectedRoute wrappers
│   ├── main.jsx                  # React entry point with providers
│   └── index.css                 # Global CSS design system (variables, components)
├── index.html
├── vite.config.js                # Dev proxy → http://localhost:8081
└── package.json
```

---

## 🌐 API Endpoints

All endpoints are prefixed with `/api`. The Vite dev server proxies `/api/*` to the backend.

### Auth — `/api/auth`

| Method | Endpoint         | Access | Description                    |
| ------ | ---------------- | ------ | ------------------------------ |
| POST   | `/auth/register` | Public | Register a new user            |
| POST   | `/auth/login`    | Public | Login, receive JWT             |
| POST   | `/auth/logout`   | Any    | Stateless — client drops token |

### Products — `/api/products`

| Method | Endpoint         | Access               | Description                   |
| ------ | ---------------- | -------------------- | ----------------------------- |
| GET    | `/products`      | Public               | List all products             |
| GET    | `/products/{id}` | Public               | Get single product            |
| GET    | `/products/my`   | SELLER               | Get current seller's products |
| POST   | `/products`      | SELLER               | Create a product              |
| PUT    | `/products/{id}` | SELLER (own) / ADMIN | Update a product              |
| DELETE | `/products/{id}` | SELLER (own) / ADMIN | Delete a product              |

### Orders — `/api/orders`

| Method | Endpoint                | Access                 | Description                         |
| ------ | ----------------------- | ---------------------- | ----------------------------------- |
| POST   | `/orders`               | BUYER                  | Place order (stock auto-decrements) |
| GET    | `/orders/my`            | BUYER                  | View own order history              |
| GET    | `/orders/sales`         | SELLER                 | View orders with own products       |
| GET    | `/orders`               | ADMIN                  | View all orders                     |
| PATCH  | `/orders/{id}/complete` | SELLER                 | Mark order as COMPLETED             |
| PATCH  | `/orders/{id}/cancel`   | BUYER / SELLER / ADMIN | Cancel an order                     |

### Admin — `/api/admin`

| Method | Endpoint                       | Access | Description       |
| ------ | ------------------------------ | ------ | ----------------- |
| GET    | `/admin/users`                 | ADMIN  | List all users    |
| PATCH  | `/admin/users/{id}/activate`   | ADMIN  | Activate a user   |
| PATCH  | `/admin/users/{id}/deactivate` | ADMIN  | Deactivate a user |

---

## 🗄️ Database Schema

```
users ──< user_roles >── roles
users ──< products
users ──< orders ──< order_items >── products
```

| Table         | Key Fields                                                         |
| ------------- | ------------------------------------------------------------------ |
| `users`       | id, full_name, email, password (BCrypt), enabled, created_at       |
| `roles`       | id, name (`ADMIN` / `SELLER` / `BUYER`)                            |
| `user_roles`  | user_id, role_id (composite PK)                                    |
| `products`    | id, title, description, price, stock, image_url, status, seller_id |
| `orders`      | id, buyer_id, total_amount, status, created_at                     |
| `order_items` | id, order_id, product_id, quantity, unit_price                     |

**Product statuses:** `ACTIVE` · `SOLD_OUT` · `REMOVED`  
**Order statuses:** `PLACED` · `COMPLETED` · `CANCELLED`

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Backend running on `http://localhost:8081` (see [backend setup](#-backend-setup))

### Run the Frontend

```bash
git clone https://github.com/your-username/mini-market-ui.git
cd mini-market-ui
npm install
npm run dev
```

App will be available at **http://localhost:5173**.  
All `/api/*` requests are proxied to the backend — no CORS config needed during development.

### Production Build

```bash
npm run build    # output → dist/
npm run preview  # serve the build locally
```

---

## 🔧 Backend Setup

### Option 1 — Docker (Recommended)

```bash
cd KUET-Mini-Market/mini-market
docker compose up --build
```

This starts a PostgreSQL 16 container and the Spring Boot app. Backend is available at **http://localhost:8081**.

### Option 2 — Local (Maven)

**Requirements:** Java 17, PostgreSQL running locally

1. Create a PostgreSQL database: `kuet-mini-market`
2. Update `src/main/resources/application.properties` if your credentials differ
3. Run:

```bash
./mvnw spring-boot:run
```

---

## 🔒 Security Highlights

| Concern                 | Implementation                                                    |
| ----------------------- | ----------------------------------------------------------------- |
| Password storage        | BCrypt hashing                                                    |
| Authentication          | Stateless JWT (24-hour expiry)                                    |
| Token transport         | `Authorization: Bearer <token>` — injected automatically by Axios |
| Route protection        | `@PreAuthorize` on every protected backend endpoint               |
| Frontend route guard    | `ProtectedRoute` component checks role before rendering           |
| Session expiry handling | Axios 401 interceptor clears storage and redirects to `/login`    |
| Native auth dialogs     | `WWW-Authenticate` header suppressed in Vite proxy config         |

---

## 🧪 Testing (Backend)

The backend has unit tests and full integration tests for all four controllers and all services, using H2 in-memory database.

```bash
cd KUET-Mini-Market/mini-market
./mvnw test
```

CI runs on every push and pull request via **GitHub Actions** (`.github/workflows/ci.yml`).

---

## � Team

| Name                  | Roll    |
| --------------------- | ------- |
| Akash Biswas          | 2107013 |
| Md. Ariful Alam Mahim | 2107023 |

**Department of Computer Science & Engineering**  
Khulna University of Engineering & Technology (KUET)

---

## 📄 License

MIT
