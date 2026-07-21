# BookStore — Full Stack Books Website

A full stack web application for browsing, managing, and favoriting books. Built with React on the frontend and Node.js + Express + MySQL on the backend.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Local Setup](#local-setup)
- [Default Accounts](#default-accounts)
- [Environment Variables](#environment-variables)
- [Deploying to Production](#deploying-to-production-vercel--railway)

---

## What It Does

BookStore is a two-role web application (Admin and User) with the following capabilities:

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
- View a reports dashboard showing:
  - Total books, total users, total favorites
  - Number of books favorited in the last month
  - A line chart of daily favorites over the past 30 days

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7 |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend | Node.js, Express 4 |
| Database | MySQL (via XAMPP) |
| DB Driver | mysql2 |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| File Upload | Multer |
| Dev Server | Nodemon |

---

## Project Structure

```
books-website/
├── backend/
│   ├── database/
│   │   ├── init.sql          # Creates all tables
│   │   ├── seed.js           # Seeds 45 books, categories, and users
│   │   └── seed.sql          # SQL-only alternative seed (no bcrypt)
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
│   │   │   └── multer.js             # File upload config
│   │   ├── db.js                     # mysql2 connection pool
│   │   └── index.js                  # Express app entry point
│   ├── uploads/                      # Uploaded cover images (git-ignored)
│   ├── .env                          # Your local environment variables
│   ├── .env.example                  # Template for env variables
│   └── package.json
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js              # Axios instance with JWT interceptor
        ├── components/
        │   ├── layout/
        │   │   ├── AdminLayout.jsx   # Dark sidebar for admin pages
        │   │   └── Navbar.jsx        # Top navigation bar
        │   ├── BookCard.jsx          # Book grid card
        │   └── ProtectedRoute.jsx    # Auth + admin route guards
        ├── context/
        │   └── AuthContext.jsx       # Global auth state (login/logout)
        ├── pages/
        │   ├── admin/
        │   │   ├── Books.jsx         # Admin book management table
        │   │   ├── Categories.jsx    # Category tree + add form
        │   │   └── Reports.jsx       # Stats cards + line chart
        │   ├── BookDetail.jsx        # Single book page with favorite toggle
        │   ├── BookList.jsx          # Paginated homepage
        │   ├── Favorites.jsx         # User's saved books
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── App.jsx                   # All routes defined here
        └── main.jsx
```

---

## Features

### Book List (Homepage)
- Displays books in a responsive 5-column grid
- 20 books per page with numbered pagination
- Shows cover image, title, author, and category breadcrumb
- No login required

### Book Details
- Full book information including description
- Category breadcrumb path (e.g. `Fiction > Quest`)
- Authenticated users can toggle ❤️ favorite / remove with one click
- Guests are prompted to log in to use favorites

### My Favorites
- Lists all books the logged-in user has saved
- Shows cover thumbnail, title, author, category path
- Remove button removes instantly without page reload

### Admin — Book Management
- Paginated table of all books with cover thumbnail
- Inline add/edit form (no separate page)
- Cover image upload (JPEG, PNG, WebP up to 5MB)
- Deleting a book also removes its uploaded cover file from disk

### Admin — Category Management
- Visual collapsible tree (📂 folders, 📄 leaves)
- Three levels: Root (L1) → Sub (L2) → Leaf (L3)
- Add form with automatic level detection based on parent selection
- Hover a category to reveal delete button

### Admin — Reports Dashboard
- Stat cards: Total Books, Total Users, Total Favorites, Favorites Last Month
- Line chart (Recharts) showing daily favorite activity over the last 30 days

### Authentication
- JWT stored in `localStorage`, sent as `Authorization: Bearer <token>` header
- Token verified on every protected request
- Auto-refresh check on app load via `/api/auth/me`
- Admin login redirects to `/admin/reports`, users go to homepage

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create a new user account |
| `POST` | `/login` | Public | Login and receive JWT |
| `GET` | `/me` | User | Get current user info |

### Books — `/api/books`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | List books (paginated, `?page=1&limit=20`) |
| `GET` | `/:id` | Optional | Get single book + `isFavorited` flag |
| `POST` | `/` | Admin | Create book (multipart/form-data) |
| `PUT` | `/:id` | Admin | Update book (multipart/form-data) |
| `DELETE` | `/:id` | Admin | Delete book + cover image |

### Categories — `/api/categories`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | Get all categories as flat list + nested tree |
| `GET` | `/leaves` | Public | Get leaf-level categories only (for book form) |
| `POST` | `/` | Admin | Create a category |
| `PUT` | `/:id` | Admin | Update a category |
| `DELETE` | `/:id` | Admin | Delete a category (cascades to children) |

### Favorites — `/api/favorites`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | User | Get all favorites for current user |
| `POST` | `/` | User | Add a book to favorites `{ bookId }` |
| `DELETE` | `/:bookId` | User | Remove a book from favorites |

### Reports — `/api/reports`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/stats` | Admin | Total books, users, favorites, last-month count |
| `GET` | `/favorites-timeline` | Admin | Daily counts for last 30 days |
| `GET` | `/favorites-last-month` | Admin | Single count for last month |

---

## Local Setup

### Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [XAMPP](https://www.apachefriends.org/) (for MySQL + phpMyAdmin)
- A terminal (Command Prompt, PowerShell, or Git Bash)

---

### Step 1 — Start XAMPP

1. Open XAMPP Control Panel
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**

Both should show green. Apache is needed for phpMyAdmin, MySQL is the database.

---

### Step 2 — Create the Database

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar
3. Enter database name: `booksdb`
4. Set collation to: `utf8mb4_unicode_ci`
5. Click **Create**

Now click on `booksdb` in the sidebar, then click the **SQL** tab and paste the following:

```sql
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(191) NOT NULL,
  `email`      VARCHAR(191) NOT NULL,
  `password`   VARCHAR(191) NOT NULL,
  `role`       ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(191) NOT NULL,
  `level`     TINYINT      NOT NULL,
  `parent_id` INT          NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_parent_id_idx` (`parent_id`),
  CONSTRAINT `categories_parent_fk`
    FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `books` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(191) NOT NULL,
  `author`      VARCHAR(191) NOT NULL,
  `description` TEXT         NULL,
  `cover_image` VARCHAR(512) NULL,
  `category_id` INT          NULL DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `books_category_id_idx` (`category_id`),
  CONSTRAINT `books_category_fk`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `favorites` (
  `id`         INT      NOT NULL AUTO_INCREMENT,
  `user_id`    INT      NOT NULL,
  `book_id`    INT      NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_user_book_unique` (`user_id`, `book_id`),
  KEY `favorites_book_id_idx` (`book_id`),
  CONSTRAINT `favorites_user_fk`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `favorites_book_fk`
    FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Click **Go**. You should see 4 tables created in the left sidebar.

---

### Step 3 — Configure Backend Environment

Open `backend/.env` and verify it matches your XAMPP setup:

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

> **Note:** XAMPP's default MySQL has no password for root. If you set a password in phpMyAdmin, add it to `DB_PASSWORD`.

---

### Step 4 — Install Backend Dependencies

Open a terminal in the project root:

```bash
cd books-website/backend
npm install
```

---

### Step 5 — Seed the Database

This creates 2 user accounts, 10 categories, and 45 books with cover images:

```bash
node database/seed.js
```

You should see:
```
Connected. Seeding...
✓ Users seeded
✓ Categories seeded
✓ 45 books seeded with cover images
✓ Sample favorites added
✓ Seeding complete!
```

---

### Step 6 — Start the Backend

```bash
npm run dev
```

The API starts on `http://localhost:5000`. You can verify it's running by visiting:
```
http://localhost:5000/api/health
```
It should return `{ "status": "ok", "message": "Books API is running" }`.

---

### Step 7 — Install Frontend Dependencies

Open a **second terminal**:

```bash
cd books-website/frontend
npm install
```

---

### Step 8 — Start the Frontend

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

---

### You're Done

Open `http://localhost:5173` in your browser. The book grid should load with cover images.

---

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@bookstore.com` | `admin123` |
| User | `user@bookstore.com` | `user123` |

Log in as **Admin** to access the management panels at `/admin/books`, `/admin/categories`, and `/admin/reports`.

Log in as **User** to favorite books and view them at `/favorites`.

---

## Environment Variables

All backend configuration lives in `backend/.env`:

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | MySQL server host |
| `DB_PORT` | `3306` | MySQL server port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | _(empty)_ | MySQL password (empty for XAMPP default) |
| `DB_NAME` | `booksdb` | MySQL database name |
| `JWT_SECRET` | — | Secret key used to sign JWT tokens (change in production) |
| `JWT_EXPIRES_IN` | `7d` | How long a login token stays valid |
| `PORT` | `5000` | Port the Express server listens on |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin (your frontend URL) |

---

## Common Issues

**Books not loading on homepage**
- Make sure the backend is running (`npm run dev` in `backend/`)
- Check the terminal for a `✓ Database connected` message
- Verify XAMPP MySQL is started (green in XAMPP Control Panel)

**"Database connection failed" in terminal**
- Confirm `booksdb` database exists in phpMyAdmin
- Check `DB_PASSWORD` in `.env` — leave it empty if you haven't set a MySQL root password

**Cover images not showing**
- Cover images are served from Open Library (external URLs) — requires an internet connection
- Locally uploaded covers are served from `backend/uploads/` via `http://localhost:5000/uploads/`

**Port already in use**
- Another process is using port 5000 or 5173
- Change `PORT=5001` in `.env` and update `vite.config.js` proxy target accordingly

**Re-seeding the database**
- Run `node database/seed.js` again — it clears favorites and books before re-inserting, so it's safe to run multiple times

---

## Deploying to Production (Vercel + Railway)

The app is split across two platforms:

| Layer | Platform | Free tier |
|---|---|---|
| Frontend (React) | Vercel | Yes — unlimited |
| Backend (Express) | Railway | Yes — $5 credit/month |
| Database (MySQL) | Railway MySQL plugin | Yes — included |

---

### Step 1 — Deploy MySQL on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Database → MySQL**
3. Once created, click the MySQL service → **Variables** tab
4. Copy the `DATABASE_URL` value — you will need it shortly

**Create tables:** click the MySQL service → **Query** tab, paste the full contents of `backend/database/init.sql`, and click **Run**.

**Seed books and users:** temporarily copy the Railway `DATABASE_URL` into your local `backend/.env`:
```env
DATABASE_URL=mysql://root:xxxx@xxxx.railway.app:3306/railway
```
Then run locally:
```bash
cd backend
node database/seed.js
```
Remove `DATABASE_URL` from local `.env` afterwards and restore the original variables.

---

### Step 2 — Deploy the Backend on Railway

1. In the same Railway project click **New Service → GitHub Repo**
2. Select your repository and set **Root Directory** → `backend`
3. Railway detects Node.js automatically and runs `node src/index.js` via `railway.json`
4. Go to **Variables** tab and add:

| Key | Value |
|---|---|
| `DATABASE_URL` | _(paste from MySQL service)_ |
| `JWT_SECRET` | any long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `5000` |
| `CLIENT_URL` | `https://your-app.vercel.app` _(fill in after Step 3)_ |

5. Click **Deploy**. Once green, copy the public domain Railway assigns, e.g.:
   `https://books-backend-production.up.railway.app`

---

### Step 3 — Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project** → import your GitHub repository
3. Set **Root Directory** → `frontend`
4. Framework preset will auto-detect as **Vite**
5. Under **Environment Variables** add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://books-backend-production.up.railway.app` |

   _(your Railway backend URL from Step 2 — no trailing slash)_

6. Click **Deploy**. Vercel gives you a URL like `https://books-website.vercel.app`

---

### Step 4 — Connect CORS

1. Go back to Railway → backend service → Variables
2. Update `CLIENT_URL` to your Vercel URL:
```
CLIENT_URL=https://books-website.vercel.app
```
3. Railway redeploys automatically

Your app is fully live. Open the Vercel URL in your browser.

---

### Quick Checklist

- [ ] MySQL tables created on Railway (init.sql)
- [ ] Seed run against Railway DB (node database/seed.js)
- [ ] Backend deployed on Railway with all env vars set
- [ ] `VITE_API_URL` set on Vercel pointing to Railway backend
- [ ] `CLIENT_URL` on Railway updated to Vercel frontend URL
- [ ] Visit Vercel URL — books load, login works

---

### File Upload Note

The local `uploads/` folder **does not persist** on Railway — the filesystem resets on each deploy. Books seeded with Open Library cover URLs are not affected. If you want admins to upload custom covers in production, integrate [Cloudinary](https://cloudinary.com) (free tier available) and replace the Multer disk storage with Cloudinary's Node SDK.
