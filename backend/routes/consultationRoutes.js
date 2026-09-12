const express = require("express");
const rateLimit = require("express-rate-limit");
const { pool } = require("../db/connection");
const { requireAdminAuth } = require("../middleware/auth");
const { validateConsultation } = require("../middleware/validators");

const router = express.Router();

// Public form submissions: cap at 10 per 15 min per IP to deter spam/abuse.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." }
});

// POST /api/consultations  (public — used by the booking form)
router.post("/", submitLimiter, validateConsultation, async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      legal_service,
      preferred_date,
      preferred_time,
      message
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO consultations
      (full_name, email, phone, legal_service, preferred_date, preferred_time, message)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        phone,
        legal_service,
        preferred_date,
        preferred_time,
        message || null
      ]
    );

    res.status(201).json({
      message: "Consultation saved.",
      id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save consultation (check MySQL)." });
  }
});

// GET /api/consultations  (admin only)
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM consultations ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load consultations (check MySQL)." });
  }
});

// PATCH /api/consultations/:id/status  (admin only)
router.patch("/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Approved", "Rejected"];

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid id." });
    }
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const [result] = await pool.execute(
      "UPDATE consultations SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found." });
    }
    res.json({ message: "Status updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update status (check MySQL)." });
  }
});

// DELETE /api/consultations/:id  (admin only)
router.delete("/:id", requireAdminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid id." });
    }
    const [result] = await pool.execute("DELETE FROM consultations WHERE id = ?", [
      id
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found." });
    }
    res.json({ message: "Deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete (check MySQL)." });
  }
});

module.exports = router;
