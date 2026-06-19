const { getDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const Conversation = {
  // Add a single message to history
  addMessage(leadId, role, content) {
    const db = getDb();
    const id = uuidv4();
    db.prepare(`
      INSERT INTO conversations (id, lead_id, role, content) VALUES (?, ?, ?, ?)
    `).run(id, leadId, role, content);
    return { id, leadId, role, content };
  },

  // Get full history for a lead (for Grok context window)
  getHistory(leadId) {
    const db = getDb();
    return db.prepare(`
      SELECT role, content FROM conversations
      WHERE lead_id = ?
      ORDER BY created_at ASC
    `).all(leadId);
  },

  // Count messages to detect conversation depth
  countMessages(leadId) {
    const db = getDb();
    return db.prepare('SELECT COUNT(*) as n FROM conversations WHERE lead_id = ?').get(leadId).n;
  },

  deleteByLead(leadId) {
    const db = getDb();
    db.prepare('DELETE FROM conversations WHERE lead_id = ?').run(leadId);
  }
};

module.exports = Conversation;
