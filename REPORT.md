# AI Lead Qualifier Agent — Project Summary Report

## 1) What this project does
This repository implements an **AI Sales Development Representative (SDR)** that lives on a website and performs an end-to-end lead workflow:

1. Visitors chat with **Aria** in a web-based widget.
2. The system stores each visitor/session conversation in **SQLite**.
3. Every few turns it runs **AI qualification** using BANT signals (Budget, Authority, Need, Timeline).
4. Based on conversation content, Aria may offer a **booking link**.
5. Booking is executed via **Calendly integration** (manual booking + Calendly webhook updates).
6. After a booking link is sent, the backend schedules **email follow-ups**.

A separate dashboard provides **lead lists + stats** (protected by an API key).

---

## 2) High-level architecture
### Frontend (React + Vite)
Key pieces:
- `frontend/src/components/ChatWidget.jsx`: floating bubble that toggles the chat UI.
- `frontend/src/components/ChatWindow.jsx`: renders messages, score badge, optional meeting banner, optional BANT panel.
- `frontend/src/hooks/useChat.js` (used by ChatWindow): manages chat state and messaging to the backend.
- `frontend/src/components/Dashboard.jsx`: renders KPI cards (Total, Hot/Warm/Booked, Avg Score, Today) and lead list.
- `frontend/src/hooks/useLeads.js`: fetches `/api/leads` and `/api/leads/stats` using `x-api-key`.

### Backend (Node + Express)
Key pieces:
- `backend/src/app.js`: Express entry point, registers routes:
  - `/api/chat`
  - `/api/leads`
  - `/api/meetings`
  - also starts a **5-minute follow-up processor**.
- `backend/src/routes/chat.js`: main conversation orchestration (save messages → call Grok → qualify → book).
- `backend/src/services/grokService.js`: Grok/OpenRouter calls plus structured extraction schema.
- `backend/src/services/qualifierService.js`: updates lead profile fields and computes `status` from score.
- `backend/src/routes/leads.js`: protected lead list + stats.
- `backend/src/routes/meetings.js`: protected meeting list; booking trigger; Calendly webhook handler.
- `backend/src/services/meetingService.js`: Calendly booking link generation + booking trigger.
- `backend/src/services/followUpService.js`: schedules and sends follow-up emails.

### Data layer (SQLite)
Models:
- `backend/src/models/Lead.js`: create/find/update for lead records and dashboard stats.
- `backend/src/models/Conversation.js`: persistent conversation history used to provide AI context.

---

## 3) Core request/response flows

### A) Chat workflow: `POST /api/chat`
Implemented in `backend/src/routes/chat.js`.

**Input** (typical):
- `sessionId?`
- `message`
- `pageUrl?`
- `source?`

**Flow**:
1. **Session handling**: if `sessionId` missing, generates a UUID.
2. **Lead record**: creates/retrieves a `Lead` row keyed by `session_id`.
3. **Persist visitor message**: `Conversation.addMessage(lead.id, 'user', ...)`.
4. **Build history**: `Conversation.getHistory(lead.id)`.
5. **AI response**: calls `chatWithGrok(history)` from `grokService.js`.
6. **Persist AI message**: `Conversation.addMessage(lead.id, 'assistant', aiResponse)`.
7. **Qualification trigger**:
   - Qualification runs on conversation depth: when message count is divisible by 4.
   - Qualification uses the full conversation history.
8. **Meeting offering detection**:
   - If AI output matches meeting-link/Calendly wording patterns and the lead isn’t already marked as booked, it triggers:
     - `bookMeeting(sessionId)`
     - optional email confirmation if `lead.email` exists
     - follow-up scheduling
9. **Response** includes:
   - `sessionId`
   - assistant message
   - partial `lead` object (score/tier/status/meetingBooked/name/company)
   - `qualification` payload (when triggered)
   - `meeting` object (when meeting offer triggers booking)

**Error handling**:
- Returns a friendly 500 message to frontend.
- Special-cases rate-limit style errors (429) with a “wait ~30 seconds” message.

---

### B) Qualification: `qualifyLead(sessionId, conversationHistory)`
Implemented in `backend/src/services/qualifierService.js`.

**Guard**: returns early unless there are enough messages.

**Mechanism**:
- Calls `extractQualification()` in `grokService.js`.
- `extractQualification()`:
  - converts conversation into a single text prompt
  - requests strict JSON output
  - parses the JSON and returns structured fields

**DB update**:
- `Lead.updateQualification(sessionId, ...)` updates profile fields including:
  - `name`, `email`, `company`, `role`
  - `budget`, `authority`, `need`, `timeline`
  - numeric `score`, computed `tier`
- `status` is derived from score (`score >= 70` → `qualified`, else `active`).

---

### C) Booking: `POST /api/meetings/book`
Implemented in `backend/src/routes/meetings.js`.

- Protected with `requireApiKey`.
- Calls `bookMeeting(sessionId)` which:
  - finds the lead
  - generates a Calendly booking URL (either static URL or Calendly single-use link)
  - updates DB fields (`meeting_booked`, `meeting_url`, `meeting_time`, etc.)

If the lead has an email, the service sends booking confirmation.

---

### D) Calendly webhook: `POST /api/meetings/webhook`
Implemented in `backend/src/routes/meetings.js`.

- Accepts `invitee.created` events.
- Uses invitee email to locate the most recent lead matching that email.
- Updates lead fields:
  - `status = 'booked'`
  - `meeting_booked = 1`
  - stores `meeting_time`

---

### E) Follow-up engine
Implemented in `backend/src/services/followUpService.js`.

**Scheduling**:
- `scheduleFollowUps(leadId)` creates follow-up rows for:
  - 24 hours
  - 72 hours
  - 7 days

**Execution**:
- `processPendingFollowUps()` selects due items and sends emails using `sendFollowUp()`.
- Skips follow-ups if lead status is already `booked`.

**Runner**:
- `backend/src/app.js` calls the processor every 5 minutes via `setInterval`.

---

## 4) Reporting / dashboard data model
### Lead record fields (used for stats)
From `backend/src/models/Lead.js` and route logic:
- `tier`: expected values `hot | warm | cold`
- `status`: expected values like `qualified | active | booked`
- `score`: numeric `0–100`
- `meeting_booked`: boolean-ish numeric
- `created_at`: used for “Today” stats

### Dashboard stats endpoint: `GET /api/leads/stats`
Implemented in `backend/src/routes/leads.js` → `Lead.stats()`.

Returns:
- `total`: total leads
- `hot`, `warm`, `cold`: counts by tier
- `booked`: count where `meeting_booked = 1`
- `today`: count where `date(created_at) = date('now')`
- `avgScore`: rounded average of `score` where `score > 0`

Frontend displays these in `frontend/src/components/Dashboard.jsx`.

---

## 5) Security and robustness notes
Key protections:
- `requireApiKey` guards all `/api/leads/*` routes.
- `requireApiKey` is also applied to `/api/meetings/book` (noted as a security fix).

Operational robustness:
- Follow-up processor runs periodically in the backend.
- Chat route contains improved error messages and rate-limit detection.

---

## 6) “Known upgrades/fixes” captured in `FIXES_AND_UPGRADES.md`
The repository includes documented fixes such as:
- SQLite migration reliability (multi-statement DDL issues)
- database exec shim correction (double-save bug)
- chat qualification trigger off-by-one fix
- missing auth guard on booking endpoint
- improved frontend error UX
- webhook update logic for lead status

---

## 7) How to run (from README)
1. Backend:
   - `cd backend`
   - `npm install`
   - configure `.env` (Grok API + Calendly + dashboard auth)
   - `npm run dev`
   - API on `http://localhost:3001`
2. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
   - dashboard on `http://localhost:5173`

---

## 8) Summary
This project combines:
- persistent chat memory (SQLite conversations)
- structured AI lead qualification (BANT extraction + scoring)
- meeting booking automation (Calendly) and confirmation emails
- scheduled follow-up messaging
- a protected dashboard for operational reporting (lead stats + lead management)

The resulting “report” layer is primarily the **dashboard KPI aggregation** provided by `GET /api/leads/stats`, backed directly by the `Lead.stats()` SQL queries.
