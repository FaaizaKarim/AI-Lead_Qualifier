import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat.js';
import MeetingPanel from './MeetingPanel.jsx';
import QualPanel from './QualPanel.jsx';

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: 'var(--text3)',
          animation: 'pulse 1.2s infinite', animationDelay: `${i * 0.2}s`
        }} />
      ))}
      <style>{`@keyframes pulse{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </div>
  );
}

export default function ChatWindow({ showQual = false }) {
  const { messages, lead, meeting, typing, error, sendMessage, reset } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg2)'
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #378ADD, #8b72e8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0
        }}>A</div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>Aria</div>
          <div style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            AI Sales Agent · Online
          </div>
        </div>
        {lead && (
          <div style={{
            marginLeft: 'auto', padding: '3px 10px',
            background: lead.score >= 70 ? 'var(--orange-dim)' : 'var(--bg3)',
            color: lead.score >= 70 ? 'var(--orange)' : 'var(--text2)',
            borderRadius: 20, fontSize: 12, fontWeight: 500
          }}>
            Score: {lead.score || 0}
          </div>
        )}
        <button onClick={reset} title="Reset chat"
          style={{ marginLeft: lead ? 0 : 'auto', background: 'none', color: 'var(--text3)', padding: 4, borderRadius: 4, fontSize: 16 }}>
          <i className="ti ti-refresh" />
        </button>
      </div>

      {/* Meeting banner */}
      {meeting && (
        <div style={{ padding: '10px 16px 0' }}>
          <MeetingPanel lead={lead} liveMeeting={meeting} />
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '78%'
          }}>
            {msg.role === 'assistant' && (
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, paddingLeft: 4 }}>Aria · AI Agent</div>
            )}
            <div style={{
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
              background: msg.role === 'user' ? 'var(--blue)' : 'var(--bg3)',
              color: msg.role === 'user' ? '#fff' : 'var(--text)',
              fontSize: 14, lineHeight: 1.55
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, paddingLeft: 4 }}>Aria is typing…</div>
            <div style={{ background: 'var(--bg3)', borderRadius: '4px 14px 14px 14px', display: 'inline-block' }}>
              <TypingDots />
            </div>
          </div>
        )}

        {error && (
          <div style={{ alignSelf: 'center', fontSize: 12, color: 'var(--red)', background: 'var(--red-dim)', padding: '6px 12px', borderRadius: 6 }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* BANT panel (optional, for full dashboard view) */}
      {/* Gate to avoid rendering noisy “0 / Unknown” early in the chat */}
      {showQual && lead && (lead.score >= 20 || lead.budget || lead.need || lead.timeline || lead.authority) && (
        <QualPanel lead={lead} />
      )}


      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg2)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message…"
          disabled={typing}
          style={{
            flex: 1, padding: '9px 14px',
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14
          }}
        />
        <button onClick={handleSend} disabled={typing || !input.trim()}
          style={{
            padding: '9px 18px', background: input.trim() ? 'var(--blue)' : 'var(--bg3)',
            color: input.trim() ? '#fff' : 'var(--text3)', borderRadius: 'var(--radius)',
            fontSize: 14, fontWeight: 500, transition: 'background 0.15s'
          }}>
          Send
        </button>
      </div>
    </div>
  );
}
