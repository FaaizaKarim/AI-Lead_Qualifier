const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

async function sendBookingConfirmation(lead, bookingUrl) {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your@gmail.com') {
    console.log(`[EMAIL SKIP] No SMTP configured. Would send booking email to ${lead.email}`);
    return { sent: false, reason: 'no_smtp' };
  }

  if (!lead.email) {
    return { sent: false, reason: 'no_email' };
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="color: #1a1a1a;">Your meeting link is ready 📅</h2>
      <p>Hi ${lead.name || 'there'},</p>
      <p>Thanks for chatting with us! Based on our conversation, I'd love to show you exactly how we can help with ${lead.need === 'high' ? 'your lead qualification challenge' : 'your business goals'}.</p>
      <p>
        <a href="${bookingUrl}" style="display:inline-block;padding:12px 24px;background:#378ADD;color:#fff;border-radius:8px;text-decoration:none;font-weight:500;">
          Book Your 30-Min Demo →
        </a>
      </p>
      <p style="color:#666;font-size:14px;">The slot is reserved for you — takes 30 seconds to confirm.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="color:#999;font-size:12px;">Powered by AI Lead Qualifier · Unsubscribe</p>
    </div>
  `;

  try {
    await getTransporter().sendMail({
      from: `"Aria from AI Qualifier" <${process.env.EMAIL_FROM}>`,
      to: lead.email,
      subject: `Your demo booking link, ${lead.name || ''}`,
      html
    });
    return { sent: true };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { sent: false, reason: err.message };
  }
}

async function sendFollowUp(lead, type) {
  if (!process.env.SMTP_USER || !lead.email) {
    console.log(`[FOLLOW-UP SKIP] Would send ${type} follow-up to ${lead.email || 'unknown'}`);
    return { sent: false };
  }

  const subjects = {
    email_24h: `Still thinking it over, ${lead.name || ''}?`,
    email_72h: `Quick question about your lead gen`,
    email_week: `One last thought — ${lead.company || 'your business'}`
  };

  const bodies = {
    email_24h: `<p>Hey ${lead.name || 'there'}, just checking in — you were asking about automating your lead qualification. Did you get a chance to look at the booking link I sent?</p><p>Happy to answer any questions before the demo too.</p>`,
    email_72h: `<p>Hi ${lead.name || 'there'}, I know you're busy — just wanted to make sure my last email didn't get buried.</p><p>Our AI SDR typically helps teams like yours <strong>save 5–10 hours/week</strong> on manual lead follow-up. Worth a 30-min look?</p>`,
    email_week: `<p>Hey ${lead.name || 'there'}, last note from me — if the timing isn't right now, totally understand. I'll leave this booking link open for when you're ready:</p>`
  };

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;">
      ${bodies[type] || bodies.email_24h}
      <p><a href="${lead.meeting_url || process.env.CALENDLY_BOOKING_URL}" style="color:#378ADD;font-weight:500;">Book a 30-min demo →</a></p>
      <p style="color:#999;font-size:12px;">Unsubscribe</p>
    </div>
  `;

  try {
    await getTransporter().sendMail({
      from: `"Aria from AI Qualifier" <${process.env.EMAIL_FROM}>`,
      to: lead.email,
      subject: subjects[type],
      html
    });
    return { sent: true };
  } catch (err) {
    console.error('Follow-up send error:', err.message);
    return { sent: false };
  }
}

module.exports = { sendBookingConfirmation, sendFollowUp };
