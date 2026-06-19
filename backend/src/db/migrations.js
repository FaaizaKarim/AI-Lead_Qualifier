const { initDb } = require('./database');

async function runMigrations() {
  const db = await initDb();

  // FIX: sql.js exec via rawDb handles multi-statement DDL correctly
  // Split into individual statements to avoid sql.js multi-statement issues
  const statements = [
    `CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT,
      company TEXT,
      role TEXT,
      website TEXT,
      budget TEXT,
      authority TEXT,
      need TEXT,
      timeline TEXT,
      score INTEGER DEFAULT 0,
      tier TEXT DEFAULT 'cold',
      status TEXT DEFAULT 'active',
      meeting_booked INTEGER DEFAULT 0,
      meeting_url TEXT,
      meeting_time TEXT,
      booking_sent INTEGER DEFAULT 0,
      source TEXT DEFAULT 'website',
      page_url TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS follow_ups (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      type TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      sent_at TEXT,
      status TEXT DEFAULT 'pending'
    )`
  ];

  for (const sql of statements) {
    db.prepare(sql).run();
  }

  console.log('✅ Database migrations complete');
}

module.exports = { runMigrations };
