/**
 * Lightweight server-side validation. Client-side checks in script.js can be
 * bypassed by anyone calling the API directly (curl, Postman, etc.), so every
 * public POST route re-checks input here before touching the database.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value, maxLen = 500) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLen;
}

function isValidEmail(value) {
  return typeof value === "string" && value.length <= 200 && EMAIL_RE.test(value.trim());
}

function isValidPhone(value) {
  // Accepts digits, spaces, +, -, () — 6 to 20 chars.
  return typeof value === "string" && /^[0-9+\-()\s]{6,20}$/.test(value.trim());
}

/** Honeypot check — a hidden field real users never fill in. If it has a
 * value, the submission almost certainly came from a bot. */
function isHoneypotTripped(req) {
  return Boolean(req.body.website && String(req.body.website).trim().length > 0);
}

function validateConsultation(req, res, next) {
  if (isHoneypotTripped(req)) {
    // Pretend success so the bot doesn't learn its submission was rejected.
    return res.status(201).json({ message: "Consultation saved.", id: 0 });
  }

  const { full_name, email, phone, legal_service, preferred_date, preferred_time, message } = req.body;

  if (!isNonEmptyString(full_name, 100)) return res.status(400).json({ error: "Please provide a valid full name." });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Please provide a valid email address." });
  if (!isValidPhone(phone)) return res.status(400).json({ error: "Please provide a valid phone number." });
  if (!isNonEmptyString(legal_service, 100)) return res.status(400).json({ error: "Please select a service." });
  if (!isNonEmptyString(preferred_date, 20)) return res.status(400).json({ error: "Please provide a preferred date." });
  if (!isNonEmptyString(preferred_time, 20)) return res.status(400).json({ error: "Please provide a preferred time." });
  if (message && (typeof message !== "string" || message.length > 2000)) {
    return res.status(400).json({ error: "Message is too long." });
  }

  next();
}

function validateContact(req, res, next) {
  if (isHoneypotTripped(req)) {
    return res.status(201).json({ message: "Message saved.", id: 0 });
  }

  const { name, email, phone, subject, message } = req.body;

  if (!isNonEmptyString(name, 100)) return res.status(400).json({ error: "Please provide a valid name." });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Please provide a valid email address." });
  if (phone && !isValidPhone(phone)) return res.status(400).json({ error: "Please provide a valid phone number." });
  if (!isNonEmptyString(subject, 150)) return res.status(400).json({ error: "Please provide a subject." });
  if (!isNonEmptyString(message, 2000)) return res.status(400).json({ error: "Please provide a message." });

  next();
}

function validateChatbotMessage(req, res, next) {
  const { user_message } = req.body;
  if (!isNonEmptyString(user_message, 500)) {
    return res.status(400).json({ error: "user_message is required." });
  }
  next();
}

module.exports = {
  validateConsultation,
  validateContact,
  validateChatbotMessage
};
