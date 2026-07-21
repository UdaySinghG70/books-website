# BookStore — Full Stack Books Website

A full stack web application for browsing, managing, and favoriting books.

**Live Demo:** [https://books-website-five.vercel.app](https://books-website-five.vercel.app)

| Service | URL |
|---|---|
| Frontend | https://books-website-five.vercel.app |
| Backend API | https://books-website-wdid.vercel.app |
| Database | Aiven MySQL (cloud) |

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Local Setup](#local-setup)
- [Production Deployment](#production-deployment)
- [Default Accounts](#default-accounts)
- [Environment Variables](#environment-variables)
- [Common Issues](#common-issues)

---

## What It Does

BookStore is a two-role web application (Admin and User).

### For Visitors (no login required)
- Browse all books in a paginated grid — 20 books per page
- View book details: title, author, description, cover image, and category breadcrumb (e.g. `Fiction > Romance > Classic`)

### For Registered Users
- Register and log in with email and password
- Mark any book as a favorite with one click
- View a personal "My Favorites" list
- Remove books from favorites

### For Admins
- Add, edit, and delete books (with optional cover image upload)
- Assign a leaf-level category to each book
- Manage a 3-level category tree (e.g. Fiction → Romance → Classic)
- View a reports dashboard:
  - Total books, users, and favorites
  - Books favorited in the last month
  - Line chart of daily favorites over the last 30 days

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7 |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Node.js, Express 4 (Vercel Serverless) |
| Database | MySQL — Aiven (cloud) / XAMPP (local) |
| DB Driver | mysql2 |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| File Upload | Multer (memory storage) |
| Dev Server | Nodemon |

---

## Project Structure

```
books-website/
├── backend/
│   ├── api/
│   │   └── index.js              # Vercel serverless entry point
│   ├── database/
│   │   ├── create_tables.js      # Creates all 4 tables
│   │   ├── init.sql              # Raw SQL table definitions
│   │   ├── seed.js               # Seeds 45 books, categories, users
│   │   └── seed.sql              # SQL-only seed alternative
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── book.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── favorite.controller.js
│   │   │   └── report.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js    # JWT authenticate + requireAdmin
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── book.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── favorite.routes.js
│   │   │   └── report.routes.js
│   │   ├── utils/
│   │   │   └── multer.js             # Memory storage file upload
│   │   ├── app.js                    # Express app (no listen)
│   │   ├── db.js                     # mysql2 connection pool
│   │   └── index.js                  # Local dev server
│   ├── .env                          # Local environment variables (git-ignored)
│   ├── .env.example                  # Template
│   ├── nixpacks.toml                 # Railway build config
│   ├── vercel.json                   # Vercel serverless routing
│   └── package.json
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js              # Axios instance + JWT interceptor
        ├── components/
        │   ├── layout/
        │   │   ├── AdminLayout.jsx   # Dark sidebar for admin pages
        │   │   └── Navbar.jsx        # Top navigation bar
        │   ├── BookCard.jsx          # Book grid card with cover image
        │   └── ProtectedRoute.jsx    # Auth + admin route guards
        ├── context/
        │   └── AuthContext.jsx       # Global auth state
        ├── pages/
        │   ├── admin/
        │   │   ├── Books.jsx         # Book management table + form
        │   │   ├── Categories.jsx    # Category tree + add form
        │   │   └── Reports.jsx       # Stats cards + line chart
        │   ├── BookDetail.jsx        # Single book + favorite toggle
        │   ├── BookList.jsx          # Paginated homepage
        │   ├── Favorites.jsx         # User's saved books
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── App.jsx                   # All routes
        └── main.jsx
```

---

## Features

### Book List
- Responsive 5-column grid, 20 books per page
- Numbered pagination with ellipsis for large page counts
- Cover images from Open Library — no login required

### Book Details
- Cover, title, author, description, category breadcrumb
- Authenticated users can toggle ❤️ / remove from favorites

### My Favorites
- Lists all saved books with cover, author, breadcrumb
- Remove button updates instantly without reload

### Admin — Book Management
- Paginated table with inline add/edit form
- Cover image upload (JPEG, PNG, WebP up to 5MB)
- Delete removes book record from DB

### Admin — Category Management
- Collapsible 3-level tree (📂 → 📄)
- Add categories with auto-level detection from parent
- Hover to reveal delete button

### Admin — Reports Dashboard
- Stat cards: Total Books, Users, Favorites, Last Month
- Recharts line chart — daily favorites over 30 days

### Auth
- JWT in `localStorage`, attached as `Bearer` header
- Token verified on app load via `/api/auth/me`
- Admin → redirected to `/admin/reports`

---

## API Reference

Base URL (production): `https://books-website-wdid.vercel.app/api`

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create account |
| `POST` | `/login` | Public | Login, returns JWT |
| `GET` | `/me` | User | Current user info |

### Books — `/api/books`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | List books (`?page=1&limit=20`) |
| `GET` | `/:id` | Optional | Single book + `isFavorited` |
| `POST` | `/` | Admin | Create book (multipart) |
| `PUT` | `/:id` | Admin | Update book (multipart) |
| `DELETE` | `/:id` | Admin | Delete book |

### Categories — `/api/categories`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | All categories + nested tree |
| `GET` | `/leaves` | Public | Leaf categories only |
| `POST` | `/` | Admin | Create category |
| `PUT` | `/:id` | Admin | Update category |
| `DELETE` | `/:id` | Admin | Delete (cascades to children) |

### Favorites — `/api/favorites`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | User | List user's favorites |
| `POST` | `/` | User | Add `{ bookId }` |
| `DELETE` | `/:bookId` | User | Remove |

### Reports — `/api/reports`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/stats` | Admin | Totals snapshot |
| `GET` | `/favorites-timeline` | Admin | Daily counts 30 days |
| `GET` | `/favorites-last-month` | Admin | Last month count |

---

## Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [XAMPP](https://www.apachefriends.org/) (MySQL + phpMyAdmin)

### Step 1 — Start XAMPP
Open XAMPP Control Panel → Start **Apache** and **MySQL**.

### Step 2 — Create the database
Go to `http://localhost/phpmyadmin` → **New** → name it `booksdb` → collation `utf8mb4_unicode_ci` → **Create**.

Click `booksdb` → **SQL** tab → paste `backend/database/init.sql` → **Go**.

### Step 3 — Configure `.env`
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=booksdb

JWT_SECRET=books_website_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Step 4 — Install and seed
```bash
cd backend
npm install
node database/seed.js
```

Expected output:
```
Connected. Seeding...
✓ Users seeded
✓ Categories seeded
✓ 45 books seeded with cover images
✓ Sample favorites added
✓ Seeding complete!
```

### Step 5 — Start backend
```bash
npm run dev
# → http://localhost:5000/api/health
```

### Step 6 — Start frontend
```bash
cd ../frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Production Deployment

The live app runs on:

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://books-website-five.vercel.app |
| Backend | Vercel (Serverless) | https://books-website-wdid.vercel.app |
| Database | Aiven MySQL | `defaultdb` on Aiven cloud |

### Backend Vercel project (`books-website-wdid`)
- **Root Directory:** `backend`
- **Framework:** Other
- **Build Command:** *(empty)*
- **Install Command:** `npm install`

Environment variables:
| Key | Value |
|---|---|
| `DATABASE_URL` | `mysql://avnadmin:...@mysql-6741e45-book-store.l.aivencloud.com:10612/defaultdb?ssl-mode=REQUIRED` |
| `JWT_SECRET` | your secret |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://books-website-five.vercel.app` |

### Frontend Vercel project (`books-website`)
- **Root Directory:** `frontend`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Environment variables:
| Key | Value |
|---|---|
| `VITE_API_URL` | `https://books-website-wdid.vercel.app` |

> `VITE_API_URL` is baked into the JS bundle at build time — always redeploy the frontend after changing it.

### Aiven Database Setup
Tables were created by running `node database/create_tables.js` and data was seeded with `node database/seed.js` pointed at the Aiven `DATABASE_URL`.

---

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@bookstore.com` | `admin123` |
| User | `user@bookstore.com` | `user123` |

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Local default | Description |
|---|---|---|
| `DATABASE_URL` | — | Full MySQL connection string (Aiven / Railway) |
| `DB_HOST` | `localhost` | Used when `DATABASE_URL` is not set |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `booksdb` | Database name |
| `JWT_SECRET` | — | Token signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token validity period |
| `PORT` | `5000` | Express server port |
| `CLIENT_URL` | `http://localhost:5173` | Comma-separated allowed CORS origins |

### Frontend (`frontend/.env` or Vercel)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL. Omit for local dev (Vite proxy handles it) |

---

## Common Issues

**Books not loading**
- Check `VITE_API_URL` is set and frontend was redeployed after adding it
- Verify backend health: `https://books-website-wdid.vercel.app/api/health`

**500 on `/api/books`**
- `DATABASE_URL` is missing or wrong in backend env vars
- Redeploy the backend after adding it

**CORS error in browser**
- `CLIENT_URL` on the backend must exactly match the frontend origin
- Update and redeploy backend

**Cover images not showing**
- Images are loaded from Open Library (external CDN) — requires internet
- Locally uploaded covers don't persist on Vercel (ephemeral filesystem)

**Re-seed the database**
```bash
cd backend
node database/seed.js
```
Safe to run multiple times — clears books and favorites before re-inserting.
