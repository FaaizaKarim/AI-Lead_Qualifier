const Lead = require('../models/Lead');
const { extractQualification } = require('./grokService');

// Run after every N messages to update lead qualification
async function qualifyLead(sessionId, conversationHistory) {
  // Only extract after at least 3 exchanges (6 messages)
  if (conversationHistory.length < 4) return null;

  const qual = await extractQualification(conversationHistory);
  if (!qual) return null;

  // Update lead in DB
  const updated = Lead.updateQualification(sessionId, {
    name: qual.name,
    email: qual.email,
    company: qual.company,
    role: qual.role,
    budget: qual.budget,
    authority: qual.authority,
    need: qual.need,
    timeline: qual.timeline,
    score: qual.score,
    tier: qual.tier,
    status: qual.score >= 70 ? 'qualified' : 'active'
  });

  return { lead: updated, qualification: qual };
}

module.exports = { qualifyLead };
