const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const { chatWithGrok } = require('../services/grokService');
const { qualifyLead } = require('../services/qualifierService');
const { bookMeeting } = require('../services/meetingService');
const { sendBookingConfirmation } = require('../services/emailService');
const { scheduleFollowUps } = require('../services/followUpService');

// POST /api/chat
// Body: { sessionId?, message, pageUrl?, source? }
router.post('/', async (req, res) => {
  try {
    const { message, pageUrl, source } = req.body;
    let { sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create session if new visitor
    if (!sessionId) {
      sessionId = uuidv4();
    }

    // Get or create lead record
    let lead = Lead.findBySession(sessionId);
    if (!lead) {
      lead = Lead.create(sessionId, {
        pageUrl,
        source,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    // Save visitor message
    Conversation.addMessage(lead.id, 'user', message.trim());

    // Get full conversation history for Grok context
    const history = Conversation.getHistory(lead.id);
    // FIX: msgCount is now AFTER adding user message (accurate count for triggering)
    const msgCount = history.length;

    // Call Grok for AI response
    const aiResponse = await chatWithGrok(history);

    // Save AI response
    Conversation.addMessage(lead.id, 'assistant', aiResponse);

    // FIX: Qualify every 4 messages — check AFTER user message is saved
    // so msgCount reflects actual message depth correctly
    let qualification = null;
    // Run qualification every 2 messages (starting from message 2) for responsive score updates
    if (msgCount >= 2 && msgCount % 2 === 0) {
      const fullHistory = Conversation.getHistory(lead.id);
      const result = await qualifyLead(sessionId, fullHistory);
      if (result) {
        lead = result.lead;
        qualification = result.qualification;
      }
    }

    // Detect if AI offered a meeting and auto-trigger booking link
    const offeringMeeting = /booking link|book.*demo|schedule.*call|send.*link|calendly/i.test(aiResponse);
    let meetingData = null;

    // Smart trigger: if a meeting is offered, ensure qualification sweep runs even if modulo boundary missed.
    // Also runs when we currently have no extracted qualification (score=0 often means unknown/failed extraction).
    const shouldForceQualification = offeringMeeting && !lead.meeting_booked && (qualification === null || lead.score === 0);

    if (shouldForceQualification) {
      const fullHistory = Conversation.getHistory(lead.id);
      const result = await qualifyLead(sessionId, fullHistory);
      if (result) {
        lead = result.lead;
        qualification = result.qualification;
      }
    }


    if (offeringMeeting && !lead.meeting_booked) {
      const booking = await bookMeeting(sessionId);
      meetingData = { url: booking.bookingUrl };


      // Send email if we have their address
      if (lead.email) {
        const emailResult = await sendBookingConfirmation(lead, booking.bookingUrl);
        meetingData.emailSent = emailResult.sent;
      }

      // Schedule follow-up sequence after booking is offered
      await scheduleFollowUps(lead.id);
    }

    // Refresh lead from DB
    lead = Lead.findBySession(sessionId);

    res.json({
      sessionId,
      message: aiResponse,
      lead: {
        id: lead.id,
        score: lead.score,
        tier: lead.tier,
        status: lead.status,
        meetingBooked: !!lead.meeting_booked,
        name: lead.name,
        company: lead.company,
        // BANT qualification fields — needed by QualPanel in chat view
        budget: lead.budget,
        authority: lead.authority,
        need: lead.need,
        timeline: lead.timeline,
        role: lead.role,
        email: lead.email
      },
      qualification,
      meeting: meetingData
    });

  } catch (err) {
    console.error('Chat error:', err);
    // FIX: Return meaningful error message to frontend
    const msg = err && err.message ? err.message : String(err);
    const status = err && err.status ? err.status : null;

    const isRateLimited = status === 429 || msg.includes('429');

    res.status(500).json({
      error: isRateLimited
        ? 'AI service is rate-limited (429). Please wait ~30 seconds and try again.'
        : 'Something went wrong. Please try again.',
      detail: process.env.NODE_ENV === 'development' ? msg : undefined
    });
  }
});

// GET /api/chat/session/:sessionId — get full transcript
router.get('/session/:sessionId', async (req, res) => {
  try {
    const lead = Lead.findBySession(req.params.sessionId);
    if (!lead) return res.status(404).json({ error: 'Session not found' });

    const history = Conversation.getHistory(lead.id);
    res.json({ lead, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
