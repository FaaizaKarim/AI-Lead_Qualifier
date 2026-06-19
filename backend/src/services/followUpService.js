const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { sendFollowUp } = require('./emailService');
const Lead = require('../models/Lead');

// Schedule follow-up emails after a booking link is sent
async function scheduleFollowUps(leadId) {
  const db = getDb();
  const now = new Date();

  const followUps = [
    { type: 'email_24h', hoursFromNow: 24 },
    { type: 'email_72h', hoursFromNow: 72 },
    { type: 'email_week', hoursFromNow: 168 }
  ];

  for (const fu of followUps) {
    const scheduledAt = new Date(now.getTime() + fu.hoursFromNow * 60 * 60 * 1000).toISOString();
    const existing = db.prepare(
      'SELECT id FROM follow_ups WHERE lead_id = ? AND type = ? AND status = ?'
    ).get(leadId, fu.type, 'pending');

    if (!existing) {
      db.prepare(
        'INSERT INTO follow_ups (id, lead_id, type, scheduled_at) VALUES (?, ?, ?, ?)'
      ).run(uuidv4(), leadId, fu.type, scheduledAt);
    }
  }
  console.log(`📬 Follow-up sequence scheduled for lead ${leadId}`);
}

// Process pending follow-ups — call this on a cron/interval
async function processPendingFollowUps() {
  const db = getDb();
  const now = new Date().toISOString();

  const pending = db.prepare(
    "SELECT * FROM follow_ups WHERE status = 'pending' AND scheduled_at <= ?"
  ).all(now);

  if (!pending.length) return;

  console.log(`📤 Processing ${pending.length} pending follow-up(s)...`);

  for (const fu of pending) {
    try {
      const lead = Lead.findById(fu.lead_id);

      // Skip if meeting already confirmed — no need to follow up
      if (!lead || lead.status === 'booked') {
        db.prepare("UPDATE follow_ups SET status = 'skipped', sent_at = ? WHERE id = ?")
          .run(now, fu.id);
        continue;
      }

      const result = await sendFollowUp(lead, fu.type);

      db.prepare("UPDATE follow_ups SET status = ?, sent_at = ? WHERE id = ?")
        .run(result.sent ? 'sent' : 'failed', now, fu.id);

      if (result.sent) {
        console.log(`✅ Follow-up ${fu.type} sent to ${lead.email}`);
      }
    } catch (err) {
      console.error(`Follow-up error for ${fu.id}:`, err.message);
      db.prepare("UPDATE follow_ups SET status = 'failed' WHERE id = ?").run(fu.id);
    }
  }
}

module.exports = { scheduleFollowUps, processPendingFollowUps };
