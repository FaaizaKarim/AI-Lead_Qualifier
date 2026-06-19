const fetch = require('node-fetch');
const Lead = require('../models/Lead');

const CALENDLY_BASE = 'https://api.calendly.com';

// Get the booking URL for a lead — either personalised scheduling link or static URL
async function getBookingLink(leadEmail, leadName) {
  const bookingUrl = process.env.CALENDLY_BOOKING_URL;

  // If no Calendly API key configured, return the static booking URL
  if (!process.env.CALENDLY_API_KEY || process.env.CALENDLY_API_KEY === 'your-calendly-personal-access-token') {
    return { url: bookingUrl || 'https://calendly.com/your-link/30min', source: 'static' };
  }

  try {
    // Use Calendly single-use scheduling link (personalized per lead)
    const response = await fetch(`${CALENDLY_BASE}/scheduling_links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CALENDLY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        max_event_count: 1,
        owner: process.env.CALENDLY_EVENT_TYPE_URI,
        owner_type: 'EventType'
      })
    });

    if (!response.ok) throw new Error(`Calendly error: ${response.status}`);
    const data = await response.json();
    return { url: data.resource.booking_url, source: 'calendly' };
  } catch (err) {
    console.error('Calendly link generation failed, using static URL:', err.message);
    return { url: bookingUrl || 'https://calendly.com/your-link/30min', source: 'static' };
  }
}

// Book a meeting for a lead — updates DB and optionally sends email
async function bookMeeting(sessionId, options = {}) {
  const lead = Lead.findBySession(sessionId);
  if (!lead) throw new Error('Lead not found');

  const { url, source } = await getBookingLink(lead.email, lead.name);

  const updated = Lead.updateMeeting(sessionId, {
    url,
    time: options.suggestedTime || null,
    emailSent: false
  });

  return {
    success: true,
    bookingUrl: url,
    source,
    lead: updated
  };
}

// Verify a Calendly webhook event (for when meetings actually get scheduled)
function verifyCalendlyWebhook(payload, signature) {
  // In production: validate HMAC signature from Calendly webhook
  // For now we accept all incoming webhooks
  return true;
}

module.exports = { getBookingLink, bookMeeting, verifyCalendlyWebhook };
