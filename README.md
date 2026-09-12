# LegalEase AI – Law Office Client Management System

A bilingual (English/Albanian) client-facing website and admin system for a law office, with an AI-assisted FAQ chatbot, consultation booking, and a secured admin dashboard.

## Live Demo

- Frontend: _add your deployed URL here_
- Backend API: _add your deployed URL here_

## Features

- **Bilingual UI** (English/Albanian) with a custom i18n system (no external library)
- **Consultation booking form** and **general contact form**, both backed by a real REST API
- **Rule-based FAQ chatbot** with a graceful offline fallback if the backend is unreachable
- **Admin dashboard** to view, update status on, and delete consultation requests and contact messages
- **Secured admin login** — JWT-based authentication, no dashboard access without it
- **Server-side validation and rate limiting** on all public form endpoints
- **Honeypot spam protection** on public forms
- **Parameterized SQL queries** throughout (no SQL injection risk)

## Tech Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Auth:** JSON Web Tokens (JWT), bcrypt password hashing

## Project Structure

```
legaleaseai/
├── frontend/          # Static site (deploy to Netlify/Vercel)
│   ├── css/style.css
│   ├── js/
│   │   ├── config.js        # API base URL (edit after deploying backend)
│   │   ├── admin-login.js
│   │   ├── admin.js
│   │   ├── chatbot.js
│   │   ├── language.js
│   │   ├── script.js
│   │   └── translations.js
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── contact.html
│   ├── admin.html
│   └── admin-login.html
└── backend/           # Express API (deploy to Render/Railway)
    ├── db/
    │   ├── connection.js
    │   └── schema.sql
    ├── middleware/
    │   ├── auth.js
    │   └── validators.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── consultationRoutes.js
    │   ├── contactRoutes.js
    │   └── chatbotRoutes.js
    ├── generate-admin-hash.js
    ├── server.js
    ├── package.json
    └── .env.example
```

## Local Setup

### 1. Database

```bash
mysql -u root -p < backend/db/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your MySQL credentials. Then generate your admin password hash:

```bash
node generate-admin-hash.js "YourStrongPassword"
```

Paste the printed hash into `.env` as `ADMIN_PASSWORD_HASH`, and set `JWT_SECRET` to a long random string (e.g. `openssl rand -hex 32`).

Start the server:

```bash
npm run dev
```

### 3. Frontend

The `images/` folder isn't included in this package — copy your original `images/` folder into `frontend/images/` before running the site.

```bash
cd frontend
python3 -m http.server 5500
```

Open `http://localhost:5500/index.html`. Admin login is at `http://localhost:5500/admin-login.html`.

## Deployment Notes

1. Deploy `backend/` to Render or Railway. Set all `.env` values as environment variables in their dashboard — never commit `.env`.
2. Deploy `frontend/` to Netlify or Vercel.
3. Update `PRODUCTION_API_URL` in `frontend/js/config.js` to your deployed backend URL.
4. Set `FRONTEND_URL` in the backend's environment variables to your deployed frontend URL (locks down CORS).

## Security Notes

- Admin routes (`GET`/`DELETE`/`PATCH` on consultations and contact messages) require a valid JWT, obtained by logging in at `/admin-login.html`.
- Public form submission routes are rate-limited (10 requests / 15 min per IP) and include a honeypot field to deter basic bots.
- All SQL queries use parameterized placeholders (`mysql2`'s `?` syntax) — no string concatenation into queries.
- Passwords are never stored in plain text; only a bcrypt hash lives in `.env`.

## Author

Gonxhe Halimi
Computer Science – Software Engineering
North American University
