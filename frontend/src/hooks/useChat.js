import { useState, useRef, useCallback, useEffect } from 'react';

const SESSION_KEY = 'aria_session_id';
const LEAD_KEY = 'aria_lead_data';

export function useChat() {
  // FIX: Persist sessionId across page refreshes for memory across sessions
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi there! I'm Aria, your product guide. What brings you to us today?" }
  ]);
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem(SESSION_KEY) || null);
  const [lead, setLead] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(LEAD_KEY) || 'null'); } catch { return null; }
  });
  const [meeting, setMeeting] = useState(null);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);

  // Persist sessionId whenever it changes
  useEffect(() => {
    if (sessionId) sessionStorage.setItem(SESSION_KEY, sessionId);
  }, [sessionId]);

  // Persist lead data
  useEffect(() => {
    if (lead) sessionStorage.setItem(LEAD_KEY, JSON.stringify(lead));
  }, [lead]);

  // If returning visitor, restore transcript from backend
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/chat/session/${sessionId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.history?.length) return;
        // Restore previous messages
        const restored = data.history.map(m => ({ role: m.role, content: m.content }));
        // Prepend greeting only if no prior messages
        setMessages(restored.length > 0 ? restored : [
          { role: 'assistant', content: "Hi there! I'm Aria, your product guide. What brings you to us today?" }
        ]);
        if (data.lead) setLead(data.lead);
      })
      .catch(() => {}); // Silently fail — fresh session is fine
  }, []); // Only on mount

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || typing) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text.trim(),
          pageUrl: window.location.href,
          source: 'website'
        })
      });

      if (!res.ok) {
        // FIX: Parse backend error message for display
        let errMsg = `Server error (${res.status})`;
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();

      setSessionId(data.sessionId);
      setLead(data.lead);
      if (data.meeting) setMeeting(data.meeting);

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      // FIX: Show meaningful error — distinguish connection vs server errors
      const isNetworkError = err.message === 'Failed to fetch' || err.message.includes('NetworkError');
      setError(isNetworkError
        ? 'Connection error — make sure the backend is running on port 3001.'
        : err.message || 'Something went wrong. Please try again.'
      );
      console.error('Chat error:', err);
    } finally {
      setTyping(false);
    }
  }, [sessionId, typing]);

  const reset = () => {
    setMessages([{ role: 'assistant', content: "Hi there! I'm Aria, your product guide. What brings you to us today?" }]);
    setSessionId(null);
    setLead(null);
    setMeeting(null);
    setError(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(LEAD_KEY);
  };

  return { messages, lead, meeting, typing, error, sendMessage, reset, sessionId };
}
