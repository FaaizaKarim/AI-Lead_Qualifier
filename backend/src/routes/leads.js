const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const { requireApiKey } = require('../middleware/auth');

// All leads routes require API key
router.use(requireApiKey);

// GET /api/leads — list all leads with optional filters
router.get('/', (req, res) => {
  try {
    const { tier, status, limit, offset } = req.query;
    const result = Lead.list({
      tier,
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/stats — dashboard summary stats
router.get('/stats', (req, res) => {
  try {
    res.json(Lead.stats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id — single lead with conversation
router.get('/:id', (req, res) => {
  try {
    const lead = Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const history = Conversation.getHistory(lead.id);
    res.json({ lead, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/leads/:id
router.delete('/:id', (req, res) => {
  try {
    const lead = Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    Lead.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
