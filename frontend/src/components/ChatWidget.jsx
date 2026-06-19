import { useState } from 'react';
import ChatWindow from './ChatWindow.jsx';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, fontFamily: 'var(--font)' }}>
      {/* Chat window */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 68, right: 0,
          width: 360, height: 520,
          background: 'var(--bg)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp 0.2s ease'
        }}>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <ChatWindow />
        </div>
      )}

      {/* Bubble button */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: open ? 'var(--bg3)' : 'linear-gradient(135deg, #378ADD, #8b72e8)',
          color: '#fff', fontSize: 22, boxShadow: '0 4px 20px rgba(55,138,221,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', border: '1px solid var(--border2)'
        }}>
        <i className={`ti ti-${open ? 'x' : 'message-chatbot'}`} />
      </button>
    </div>
  );
}
