import { useState, useEffect } from 'react';
import QualPanel from './QualPanel.jsx';
import MeetingPanel from './MeetingPanel.jsx';
import { tierBadgeClass, tierLabel, timeAgo } from '../utils/scoring.js';

export default function LeadCard({ lead, fetchDetail, onDelete }) {
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState('transcript');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setLoading(true);
    setDetail(null);
    setTab('transcript');
    fetchDetail(lead.id)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lead?.id]);

  if (!lead) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexDirection: 'column', gap: 12 }}>
        <i className="ti ti-user-search" style={{ fontSize: 40, opacity: 0.3 }} />
        <span>Select a lead to view details</span>
      </div>
    );
  }

  const l = detail?.lead || lead;
  const history = detail?.history || [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--blue-dim), #2a1f5e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 600, color: 'var(--text)'
        }}>
          {(l.name || 'A').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{l.name || 'Anonymous Visitor'}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={`badge ${l.meeting_booked ? 'badge-booked' : tierBadgeClass(l.tier)}`}>
              {tierLabel(l.tier, l.meeting_booked)}
            </span>
            {l.company && <span style={{ fontSize: 12, color: 'var(--text2)' }}>{l.company}</span>}
            {l.role && <span style={{ fontSize: 12, color: 'var(--text3)' }}>· {l.role}</span>}
            <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>{timeAgo(l.created_at)}</span>
          </div>
        </div>
        <button onClick={() => onDelete(l.id)} title="Delete lead"
          style={{ background: 'none', color: 'var(--text3)', padding: '4px', fontSize: 16, borderRadius: 4 }}>
          <i className="ti ti-trash" />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        {['transcript', 'qualification', 'meeting'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '9px 18px', background: 'none', fontSize: 13, fontWeight: 500,
              color: tab === t ? 'var(--blue)' : 'var(--text3)',
              borderBottom: tab === t ? '2px solid var(--blue)' : '2px solid transparent',
              textTransform: 'capitalize', transition: 'color 0.15s'
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {loading && <div style={{ color: 'var(--text3)', fontSize: 13 }}>Loading…</div>}

        {!loading && tab === 'transcript' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.length === 0 && <div style={{ color: 'var(--text3)', fontSize: 13 }}>No messages yet.</div>}
            {history.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3, paddingLeft: 4 }}>
                  {msg.role === 'assistant' ? 'Aria' : (l.name || 'Visitor')}
                </div>
                <div style={{
                  padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  background: msg.role === 'user' ? 'var(--blue-dim)' : 'var(--bg3)',
                  color: 'var(--text)', fontSize: 13, lineHeight: 1.55,
                  border: '1px solid ' + (msg.role === 'user' ? '#1d4a7a' : 'var(--border)')
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'qualification' && <QualPanel lead={l} />}

        {!loading && tab === 'meeting' && (
          <div>
            {l.meeting_booked ? (
              <MeetingPanel lead={l} />
            ) : (
              <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', marginTop: 32 }}>
                <i className="ti ti-calendar-x" style={{ fontSize: 32, display: 'block', marginBottom: 10, opacity: 0.3 }} />
                No meeting booked yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
