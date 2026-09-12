# What Changed From the Original Project

Use this as raw material when you write your portfolio case study — it's the "before/after" story.

## Security fixes

| Issue | Before | After |
|---|---|---|
| Admin dashboard | No login — anyone with the URL could view/delete client data | JWT-based login required; all admin API routes verify the token server-side |
| Admin password | N/A | Stored as a bcrypt hash in `.env`, never in code or plain text |
| Input validation | Client-side only (bypassable via direct API calls) | Server-side validation on every public POST route |
| Spam | No protection | Honeypot field on both public forms |
| Abuse / brute force | No rate limiting anywhere | Rate limiting on form submissions and login attempts |
| CORS | Wide open (`cors()` with no config) | Restricted to the deployed frontend origin via `FRONTEND_URL` |
| Secrets | `.env` values used correctly, but no `.gitignore` guarantee | `.gitignore` added at both root and backend level |

## Bug fixes

- `admin.js` called `PATCH /api/consultations/:id/status` to update a request's status, but that route didn't exist in the backend. Added it in `consultationRoutes.js`.
- Removed an unused `totalTestimonials` variable in `script.js`.

## Structural changes

- Introduced `frontend/js/config.js` as a single place to set the API base URL, replacing hardcoded `http://localhost:5001` strings scattered across `script.js`, `chatbot.js`, and `admin.js`.
- Added `backend/middleware/auth.js` and `backend/middleware/validators.js` to separate cross-cutting concerns from route logic.
- Added `backend/generate-admin-hash.js`, a one-off CLI helper so the admin password never needs to be typed in plain text anywhere in the codebase.

## What stayed the same (and was already solid)

- All SQL queries already used parameterized placeholders — no SQL injection risk was found.
- The bilingual i18n system, chatbot fallback logic, and testimonials slider needed no changes.
