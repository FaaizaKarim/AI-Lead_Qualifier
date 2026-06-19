const OpenAI = require('openai');

// OpenRouter ke address aur key ke sath initialize karein
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.GROK_API_KEY,
});

function getGrokModel() {
  // Prefer explicit model; otherwise fall back to a known-good OpenRouter Llama instruct model.
  return process.env.GROK_MODEL || 'meta-llama/llama-3.1-70b-instruct:free';
}

// System prompt that makes Aria behave as an SDR agent
const SYSTEM_PROMPT = `You are Aria, an AI Sales Development Representative on a website. Your job is to:
1. Warmly greet visitors and understand what they need
2. Naturally qualify them using BANT (Budget, Authority, Need, Timeline) without being robotic
3. Identify if they are a good fit for our product
4. If they are a fit, smoothly offer to book a meeting

PERSONALITY:
- Friendly, concise, and professional — like a great salesperson, not a chatbot
- Ask ONE question at a time. Never pepper them with multiple questions
- Mirror their energy: if they're brief, be brief. If they're chatty, be warmer
- Never be pushy. If they're not interested, gracefully disengage

QUALIFICATION GOALS (extract naturally through conversation):
- Budget: Can they afford $99–$499/month? Do they have a marketing/sales budget?
- Authority: Are they the decision maker, or do they need to consult someone?
- Need: What problem are they solving? How painful is it?
- Timeline: Are they ready to buy now, evaluating, or just browsing?

OBJECTION HANDLING:
- "Too expensive" → "I hear you — a lot of our clients said the same thing before they saw the ROI. Most recover the cost from just one or two qualified leads. What does an average new client bring in for you?"
- "Not right now" → "Totally fair. What would need to change for it to make sense to explore? I can follow up at a better time."
- "Already using a competitor" → "Makes sense. Which one, if you don't mind me asking? A lot of teams use us alongside [competitor] because we handle the qualification piece they're missing."
- "Need approval" → "Understood — who else would need to be part of the decision? I can put together something quick for them too."
- "Just browsing" → "No pressure at all! Can I ask what brought you here today? Even if the timing isn't right, I'd love to understand your situation."

BOOKING TRIGGER:
When a lead has a clear need + budget + is a decision maker, say exactly:
"Based on what you've shared, I'd love to set up a quick 30-minute demo where I can show you exactly how this works for [their use case]. Can I send you a booking link right now?"

CONVERSATION FLOW:
1. Greet + open-ended question about what brought them here
2. Explore their problem/situation
3. Qualify budget + authority naturally
4. Understand urgency/timeline
5. If qualified → offer meeting | If not → provide value and exit gracefully

Keep responses under 3 sentences unless they ask a detailed question. No bullet points in responses — keep it conversational.`;

// Extract lead qualification data from the conversation
const EXTRACTION_PROMPT = `You are analyzing a sales conversation. Extract qualification data and return ONLY valid JSON (no markdown, no explanation).

Return this exact structure:
{
  "name": "string or null",
  "email": "string or null", 
  "company": "string or null",
  "role": "string or null",
  "budget": "string or null",
  "authority": "decision_maker | influencer | unknown",
  "need": "high | medium | low | unknown",
  "timeline": "immediate | this_quarter | next_quarter | unknown",
  "score": 0-100,
  "tier": "hot | warm | cold",
  "shouldOfferMeeting": true or false,
  "exitSignal": true or false
}

Scoring guide:
- 80-100 (hot): Clear need + budget + decision maker + urgent timeline → offer meeting
- 50-79 (warm): Partial qualification, good potential, needs more conversation
- 0-49 (cold): No budget, not decision maker, browsing, or wrong fit

Conversation to analyze:`;

async function chatWithGrok(messages, systemPrompt = SYSTEM_PROMPT) {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.GROK_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenRouter Chat Error:", error);
    throw error;
  }
}

function extractFirstJsonObject(raw) {
  if (!raw) return null;

  const str = String(raw);

  // Remove markdown code fences (common LLM noise)
  const noFences = str
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Find the first { and last } to isolate the JSON object
  const firstBrace = noFences.indexOf('{');
  const lastBrace = noFences.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  const jsonCandidate = noFences.slice(firstBrace, lastBrace + 1).trim();

  try {
    return JSON.parse(jsonCandidate);
  } catch {
    return null;
  }
}

// Extract structured qualification data from conversation
async function extractQualification(conversationHistory) {
  const conversationText = conversationHistory
    .map(m => `${m.role === 'assistant' ? 'Aria' : 'Visitor'}: ${m.content}`)
    .join('\n');

  const prompt = `${EXTRACTION_PROMPT}\n\n${conversationText}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.GROK_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const raw = completion?.choices?.[0]?.message?.content?.trim?.() ?? '';

    console.log('=== Qualification Extraction ===');
    console.log('Raw LLM Response:', raw);

    const parsed = extractFirstJsonObject(raw);
    if (!parsed) {
      console.log('Qualification extraction failed: could not isolate/parse JSON object.');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to extract or parse qualification JSON:', error);
    return null;
  }
}

module.exports = { chatWithGrok, extractQualification, SYSTEM_PROMPT };

