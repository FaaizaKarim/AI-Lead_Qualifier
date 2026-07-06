<img width="1915" height="833" alt="image" src="https://github.com/user-attachments/assets/42965cb1-08fc-41ed-9571-fc588836d041" />
<img width="1914" height="837" alt="image" src="https://github.com/user-attachments/assets/fe23b983-c99e-428c-8d06-5df7d049509a" />
<img width="1920" height="846" alt="image" src="https://github.com/user-attachments/assets/716d9034-7cec-4829-9852-956ea531fa36" />
<img width="1920" height="843" alt="image" src="https://github.com/user-attachments/assets/6edd1e1a-ddaa-4293-9720-571f5ea321ff" />
<img width="1917" height="844" alt="image" src="https://github.com/user-attachments/assets/3119c7e7-20f3-46c1-87c7-b4916c4e220c" />
<img width="1919" height="841" alt="image" src="https://github.com/user-attachments/assets/a1479f72-064e-424e-b140-7a372b9b17c1" />







# 🤖 AI Lead Qualifier Agent

An AI-powered Sales Development Representative that lives on your website, qualifies visitors, and books meetings — automatically.

**Built with:** Grok AI (xAI) · Calendly · SQLite · React + Vite · Node.js + Express

---

## 🚀 Quick Start

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:
- `openRouter_API_KEY` — get free at [console.x.ai](https://console.x.ai)
- `openrouter_MODEL` — use `grok-3-mini` (free tier)
- `DASHBOARD_API_KEY` — any secret string for dashboard auth
- `CALENDLY_BOOKING_URL` — your Calendly scheduling link
- `CALENDLY_API_KEY` — optional, enables personalized booking links

### 3. Start backend

```bash
cd backend
npm run dev
# → API running at http://localhost:3001
```

### 4. Start frontend

```bash
cd frontend
npm run dev
# → Dashboard at http://localhost:5173
```

---

## 📁 File Structure

```
ai-lead-qualifier/
├── backend/
│   ├── src/
│   │   ├── app.js                  ← Express entry point
│   │   ├── routes/
│   │   │   ├── chat.js             ← POST /api/chat (Grok AI)
│   │   │   ├── leads.js            ← GET/DELETE /api/leads
│   │   │   └── meetings.js         ← POST /api/meetings/book
│   │   ├── services/
│   │   │   ├── grokService.js      ← Grok API + system prompt
│   │   │   ├── qualifierService.js ← BANT extraction + scoring
│   │   │   ├── meetingService.js   ← Calendly integration
│   │   │   └── emailService.js     ← Booking confirmation emails
│   │   ├── models/
│   │   │   ├── Lead.js             ← Lead DB operations
│   │   │   └── Conversation.js     ← Chat history DB operations
│   │   ├── middleware/
│   │   │   ├── auth.js             ← API key protection
│   │   │   └── cors.js             ← CORS for embeds
│   │   └── db/
│   │       ├── database.js         ← SQLite connection
│   │       └── migrations.js       ← Table setup
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ChatWidget.jsx      ← Floating chat bubble
│       │   ├── ChatWindow.jsx      ← Full chat UI
│       │   ├── Dashboard.jsx       ← Stats + lead management
│       │   ├── Sidebar.jsx         ← Lead list with filters
│       │   ├── LeadCard.jsx        ← Lead detail + transcript
│       │   ├── QualPanel.jsx       ← BANT score breakdown
│       │   └── MeetingPanel.jsx    ← Booking status
│       ├── pages/
│       │   ├── Home.jsx            ← Main dashboard page
│       │   └── EmbedPage.jsx       ← Standalone widget page
│       ├── hooks/
│       │   ├── useChat.js          ← Chat state management
│       │   └── useLeads.js         ← Lead data fetching
│       └── utils/
│           └── scoring.js          ← Score colors + helpers
│
└── embed/
    └── widget.js                   ← One-line embed script
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | None | Send message, get AI response |
| GET | `/api/chat/session/:id` | None | Get conversation transcript |
| GET | `/api/leads` | API Key | List all leads |
| GET | `/api/leads/stats` | API Key | Dashboard stats |
| GET | `/api/leads/:id` | API Key | Lead detail + history |
| DELETE | `/api/leads/:id` | API Key | Delete a lead |
| POST | `/api/meetings/book` | None | Trigger booking for session |
| POST | `/api/meetings/webhook` | None | Calendly webhook receiver |
| GET | `/api/meetings` | API Key | List all booked meetings |

---

## 🌐 Embed on any website

Paste before `</body>`:

```html
<script src="https://your-domain.com/widget.js" data-api="https://your-domain.com/api" async></script>
```

Works on: Webflow, WordPress, Wix, Shopify, custom HTML — anywhere.

---

## 💰 Pricing Tiers (suggested)

| Plan | Price | Features |
|------|-------|----------|
| Starter | $49/mo | 1 site · 100 leads/mo · Basic chat |
| Growth ⭐ | $149/mo | AI qualification · Calendly booking · Email follow-ups |
| Pro | $399/mo | Multi-site · Advanced scoring · Team dashboard |

**10 Growth customers = $1,490 MRR** — you need zero code changes to get there.

---

## 🛠 Tech Stack

- **AI:** Grok (xAI free API) — `grok-3-mini`
- **Backend:** Node.js, Express, better-sqlite3
- **Frontend:** React 18, Vite, React Router
- **Database:** SQLite (zero setup, file-based)
- **Booking:** Calendly API
- **Email:** Nodemailer (Gmail SMTP)
- **Embed:** Vanilla JS widget (~3kb)
