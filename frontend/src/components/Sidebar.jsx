import { tierBadgeClass, tierLabel, scoreColor, scoreBg, timeAgo } from '../utils/scoring.js';

export default function Sidebar({ leads, selectedId, onSelect, filter, onFilter }) {
  const tiers = ['all', 'hot', 'warm', 'cold'];

  return (
    <aside style={{ width: 260, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Filter tabs */}
      <div style={{ display: 'flex', padding: '12px 12px 0', gap: 4 }}>
        {tiers.map(t => (
          <button key={t} onClick={() => onFilter(t === 'all' ? '' : t)}
            style={{
              flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: (filter === t || (!filter && t === 'all')) ? 'var(--bg3)' : 'transparent',
              color: (filter === t || (!filter && t === 'all')) ? 'var(--text)' : 'var(--text2)',
              border: '1px solid ' + ((filter === t || (!filter && t === 'all')) ? 'var(--border2)' : 'transparent'),
              textTransform: 'capitalize'
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Lead list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {leads.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No leads yet.<br />Start a chat to generate leads.
          </div>
        )}
        {leads.map(lead => (
          <div key={lead.id} onClick={() => onSelect(lead)}
            style={{
              padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
              background: selectedId === lead.id ? 'var(--bg3)' : 'transparent',
              borderLeft: selectedId === lead.id ? '2px solid var(--blue)' : '2px solid transparent',
              transition: 'background 0.1s'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--text)' }}>
                {lead.name || 'Anonymous Visitor'}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%', fontSize: 11, fontWeight: 600,
                background: scoreBg(lead.score), color: scoreColor(lead.score), flexShrink: 0
              }}>
                {lead.score || '—'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span className={`badge ${lead.meeting_booked ? 'badge-booked' : tierBadgeClass(lead.tier)}`}>
                {tierLabel(lead.tier, lead.meeting_booked)}
              </span>
              {lead.company && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{lead.company}</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{timeAgo(lead.created_at)}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
