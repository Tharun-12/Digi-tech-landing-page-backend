// routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;

// POST /api/contact  -> save a new enquiry
router.post("/", async (req, res) => {
  try {
    const { name, company, phone, email, service, message, source } = req.body;

    // Validation
    if (!name || !phone || !email || !service) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, email and service are required.",
      });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address." });
    }
    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number." });
    }

    const sql = `
      INSERT INTO contact (name, company, phone, email, service, message, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      name.trim(),
      company ? company.trim() : null,
      phone.trim(),
      email.trim().toLowerCase(),
      service.trim(),
      message ? message.trim() : null,
      source || "modal",
    ];

    const [result] = await db.execute(sql, values);

    return res.status(201).json({
      success: true,
      message: "Thank you for your enquiry. Our team will contact you shortly.",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Contact insert error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save your enquiry. Please try again.",
    });
  }
});

// GET /api/contact  -> list enquiries (protect this route with auth before going live)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM contact ORDER BY created_at DESC LIMIT 200"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Contact fetch error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch enquiries." });
  }
});

module.exports = router;