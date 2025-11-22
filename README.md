# TinyLink – URL Shortener (Full Setup Guide)

This README documents the **entire process** for running TinyLink, deploying it, and understanding the project structure. This matches the exact structure you shared and the backend deployment on Render.

---

## 🚀 Overview

TinyLink is a lightweight URL shortener built with:

* **Express.js** backend (API for creating, deleting, redirecting links)
* **PostgreSQL** database
* **Vanilla HTML/CSS/JS** frontend (no Next.js)
* **Tailwind** for styling (optional build or prebuilt CSS)
* **Render** deployment (backend + static files)

This project does *not* require Vercel.

---

## 📂 Project Structure

```
TINYLINK/
├── package.json
├── .env.example
├── scripts/
│    └── migrate.js
├── src/
│    ├── server/
│    │    ├── index.js
│    │    ├── db.js
│    │    └── routes/
│    │         └── links.js
│    ├── pages/
│    │    ├── index.html
│    │    ├── stats.html
│    │    └── layout.css
│    └── public/
│         ├── styles.css
│         └── script.js
```

---

## ⚙️ Environment Variables

Create `.env` based on `.env.example`:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=10000
```

Render will auto-load these.

---

## 🗄️ Database Migration

This project includes a migration script.

Run:

```
node scripts/migrate.js
```

This creates the `links` table:

```
links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP
)
```

---

## 🔌 Backend: Express Server

Key features:

* `/api/links` → GET list, POST create
* `/api/links/:code` → DELETE
* `/code/:code` → Show stats page
* `/:code` → Redirect to original URL
* `/healthz` → health check
* Serves HTML + JS

Backend runs on Render.

---

## 🖥️ Frontend: Vanilla HTML + JS

Frontend is inside:

```
src/pages/index.html
src/public/script.js
```

It calls the backend:

```js
const BASE_URL = window.location.origin.includes("localhost")
  ? "http://localhost:3000"
  : "https://tinylink-backend.onrender.com";
```

### Pages:

* `/` → Dashboard
* `/code/:code` → Stats for a short link

---

## 🚀 Local Development

Run backend locally:

```
npm install
npm run dev
```

Visit:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploying to Render

### 1️⃣ Create a **Web Service**

* Runtime: **Node.js**
* Build Command: `npm install`
* Start Command: `node src/server/index.js`
* Add `DATABASE_URL` env var

### 2️⃣ Create a **PostgreSQL** database

Render → Databases → Create
Then copy connection string to `.env`

### 3️⃣ Run migration

Go to Render → Web Service → Shell:

```
node scripts/migrate.js
```

### 4️⃣ Deploy

Render auto builds & deploys.
Your backend becomes:

```
https://your-backend.onrender.com
```

---

## ✔️ No Need for Vercel

Because:

* You are not using Next.js
* The backend already serves all HTML
* Render does both frontend + backend perfectly

---

## 🧪 Testing Your API

### Create a link:

POST → `/api/links`

```json
{
  "code": "google1",
  "url": "https://google.com"
}
```

### Get all links:

GET → `/api/links`

### Delete a link:

DELETE → `/api/links/google1`

### Redirect:

Visit → `https://your-domain/google1`

---

## 📌 Common Issues & Fixes

### ❌ Empty array `[]` on Render

Cause: DATABASE_URL not set or table not created
Fix:

* Check Render → Environment → DATABASE_URL
* Run: `node scripts/migrate.js`

### ❌ `{ "error": "code must be [A-Za-z0-9]{6,8}" }`

Cause: Code must be 6–8 chars
Fix: Use `google1`, `abc123`, etc.

### ❌ Redirect gives 404

Cause: `/code`, `/api`, `/healthz` are protected
Short codes cannot match those.

---

## 🏁 Conclusion

Your app is a **clean Express + HTML** project hosted 100% on Render — no Vercel required.
Everything works as:

* Render API backend
* Render static hosting or served via Express
* PostgreSQL storage

If you want, I can add:
✅ Screenshots
✅ Deployment badges
✅ Feature list
✅ API documentation

Just tell me!
