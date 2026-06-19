import { useState } from 'react';
import Dashboard from '../components/Dashboard.jsx';
import ChatWindow from '../components/ChatWindow.jsx';

const NAV = [
  { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
  { id: 'chat', icon: 'message-chatbot', label: 'Live Chat Preview' },
  { id: 'embed', icon: 'code', label: 'Get Embed Code' }
];

export default function Home() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left nav */}
      <nav style={{
        width: 56, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4, flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{
          width: 34, height: 34, borderRadius: 8, marginBottom: 8,
          background: 'linear-gradient(135deg, #378ADD, #8b72e8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#fff'
        }}>A</div>

        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} title={n.label}
            style={{
              width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: tab === n.id ? 'var(--bg3)' : 'none',
              color: tab === n.id ? 'var(--blue)' : 'var(--text3)',
              fontSize: 18, border: tab === n.id ? '1px solid var(--border2)' : '1px solid transparent',
              transition: 'all 0.15s'
            }}>
            <i className={`ti ti-${n.icon}`} />
          </button>
        ))}
      </nav>

      {/* Main area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          padding: '0 20px', height: 52, borderBottom: '1px solid var(--border)',
          background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0
        }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            {NAV.find(n => n.id === tab)?.label}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Aria is live</span>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {tab === 'dashboard' && <Dashboard />}

          {tab === 'chat' && (
            <div style={{ height: '100%', display: 'flex' }}>
              <div style={{ flex: 1, maxWidth: 440, borderRight: '1px solid var(--border)' }}>
                <ChatWindow showQual />
              </div>
              <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>Live Chat Preview</h2>
                <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
                  This is exactly what your website visitors will see. The AI automatically qualifies them, scores each lead, and offers to book a meeting when they're a strong fit.
                </p>
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Powered by</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {['Grok AI (xAI)', 'Calendly Booking', 'BANT Scoring', 'SQLite Storage'].map(t => (
                      <span key={t} style={{ padding: '4px 10px', background: 'var(--bg3)', borderRadius: 6, fontSize: 12, color: 'var(--text2)', border: '1px solid var(--border)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'embed' && <EmbedTab />}
        </div>
      </main>
    </div>
  );
}

function EmbedTab() {
  const scriptTag = `<script src="https://your-domain.com/widget.js" data-api="https://your-domain.com/api" async></script>`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '32px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Embed on any website</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
          Paste this single script tag before the closing <code style={{ color: 'var(--blue)' }}>&lt;/body&gt;</code> tag of any website.
        </p>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ padding: '8px 14px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>HTML</span>
          <button onClick={copy}
            style={{ fontSize: 12, color: copied ? 'var(--green)' : 'var(--blue)', background: 'none', padding: '2px 8px', borderRadius: 4 }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre style={{ padding: '16px', fontSize: 12, color: 'var(--text)', overflowX: 'auto', lineHeight: 1.6, margin: 0 }}>
          {scriptTag}
        </pre>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          ['✅', 'Works on any website — Webflow, WordPress, Wix, custom HTML'],
          ['✅', 'Chat widget appears as floating bubble in bottom-right corner'],
          ['✅', 'All conversations saved to your dashboard automatically'],
          ['✅', 'Meetings booked directly to your Calendly calendar']
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text2)' }}>
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
