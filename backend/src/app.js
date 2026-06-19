require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/cors');
const { initDb } = require('./db/database');
const { runMigrations } = require('./db/migrations');
const { processPendingFollowUps } = require('./services/followUpService');

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI Lead Qualifier API', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.use('/api/chat', require('./routes/chat'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/meetings', require('./routes/meetings'));

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

const PORT = process.env.PORT || 3001;

(async () => {
  await runMigrations();

  // FIX: Start follow-up processor — runs every 5 minutes to send scheduled emails
  setInterval(async () => {
    try { await processPendingFollowUps(); } catch (e) { console.error('Follow-up processor error:', e.message); }
  }, 5 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`
  ┌─────────────────────────────────────────────┐
  │   🤖 AI Lead Qualifier API                  │
  │   Running on http://localhost:${PORT}          │
  │                                             │
  │   POST /api/chat       — AI conversation    │
  │   GET  /api/leads      — Lead dashboard     │
  │   POST /api/meetings/book — Book meeting    │
  │   🕐  Follow-up engine: active (5m poll)    │
  └─────────────────────────────────────────────┘
    `);
  });
})();

module.exports = app;
