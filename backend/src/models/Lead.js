const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const Lead = {
  // Create a new lead from a session
  create(sessionId, meta = {}) {
    const db = getDb();
    const id = uuidv4();
    db.prepare(`
      INSERT INTO leads (id, session_id, page_url, ip_address, user_agent, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, sessionId, meta.pageUrl || null, meta.ipAddress || null, meta.userAgent || null, meta.source || 'website');
    return this.findBySession(sessionId);
  },

  // Find by session ID (used during active chat)
  findBySession(sessionId) {
    const db = getDb();
    return db.prepare('SELECT * FROM leads WHERE session_id = ?').get(sessionId);
  },

  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  },

  // Update qualification data extracted from conversation
  updateQualification(sessionId, data) {
    const db = getDb();
    const fields = [];
    const values = [];

    const allowed = ['name', 'email', 'company', 'role', 'website', 'budget', 'authority', 'need', 'timeline', 'score', 'tier', 'status'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }

    if (fields.length === 0) return;
    fields.push("updated_at = datetime('now')");
    values.push(sessionId);

    db.prepare(`UPDATE leads SET ${fields.join(', ')} WHERE session_id = ?`).run(...values);
    return this.findBySession(sessionId);
  },

  updateMeeting(sessionId, meetingData) {
    const db = getDb();
    db.prepare(`
      UPDATE leads SET
        meeting_booked = 1,
        meeting_url = ?,
        meeting_time = ?,
        booking_sent = ?,
        status = 'booked',
        updated_at = datetime('now')
      WHERE session_id = ?
    `).run(meetingData.url, meetingData.time, meetingData.emailSent ? 1 : 0, sessionId);
    return this.findBySession(sessionId);
  },

  // Dashboard: list all leads with filters
  list({ tier, status, limit = 50, offset = 0 } = {}) {
    const db = getDb();
    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    if (tier) { query += ' AND tier = ?'; params.push(tier); }
    if (status) { query += ' AND status = ?'; params.push(status); }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as n FROM leads').get().n;
    return { leads: rows, total };
  },

  // Dashboard stats
  stats() {
    const db = getDb();
    const total = db.prepare("SELECT COUNT(*) as n FROM leads").get().n;
    const hot = db.prepare("SELECT COUNT(*) as n FROM leads WHERE tier = 'hot'").get().n;
    const warm = db.prepare("SELECT COUNT(*) as n FROM leads WHERE tier = 'warm'").get().n;
    const cold = db.prepare("SELECT COUNT(*) as n FROM leads WHERE tier = 'cold'").get().n;
    const booked = db.prepare("SELECT COUNT(*) as n FROM leads WHERE meeting_booked = 1").get().n;
    const today = db.prepare("SELECT COUNT(*) as n FROM leads WHERE date(created_at) = date('now')").get().n;
    const avgScore = db.prepare("SELECT AVG(score) as avg FROM leads WHERE score > 0").get().avg;

    return { total, hot, warm, cold, booked, today, avgScore: Math.round(avgScore || 0) };
  },

  delete(id) {
    const db = getDb();
    db.prepare('DELETE FROM leads WHERE id = ?').run(id);
  }
};

module.exports = Lead;
