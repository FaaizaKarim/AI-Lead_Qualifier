const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { bookMeeting } = require('../services/meetingService');
const { sendBookingConfirmation } = require('../services/emailService');
const { requireApiKey } = require('../middleware/auth');

// POST /api/meetings/book — manually trigger booking for a session
// FIX: Added requireApiKey guard (was missing, allowing unauthenticated booking)
router.post('/book', requireApiKey, async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const result = await bookMeeting(sessionId);
    const lead = Lead.findBySession(sessionId);

    if (lead?.email) {
      await sendBookingConfirmation(lead, result.bookingUrl);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meetings/webhook — Calendly webhook (invitee.created) — no auth, verified by signature
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const payload = JSON.parse(req.body.toString());
    const event = payload.event;

    if (event === 'invitee.created') {
      const invitee = payload.payload?.invitee;
      const email = invitee?.email;
      const name = invitee?.name;
      const startTime = payload.payload?.event?.start_time;

      console.log(`📅 Meeting booked via Calendly: ${name} <${email}> at ${startTime}`);

      // FIX: Find lead by email and update status when Calendly confirms
      if (email) {
        const { getDb } = require('../db/database');
        const db = getDb();
        const lead = db.prepare('SELECT * FROM leads WHERE email = ? ORDER BY created_at DESC LIMIT 1').get(email);
        if (lead) {
          db.prepare(`UPDATE leads SET status = 'booked', meeting_booked = 1, meeting_time = ?, updated_at = datetime('now') WHERE id = ?`)
            .run(startTime || null, lead.id);
          console.log(`✅ Lead ${lead.id} status updated to booked`);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: 'Webhook parse error' });
  }
});

// GET /api/meetings — list all booked meetings (protected)
router.get('/', requireApiKey, (req, res) => {
  try {
    const { getDb } = require('../db/database');
    const db = getDb();
    const meetings = db.prepare(`
      SELECT id, name, email, company, meeting_url, meeting_time, created_at
      FROM leads WHERE meeting_booked = 1
      ORDER BY created_at DESC
    `).all();
    res.json({ meetings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
