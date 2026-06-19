import { scoreColor, scoreBg } from '../utils/scoring.js';

function Bar({ value, max = 100, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
    </div>
  );
}

const needScore = { high: 90, medium: 55, low: 20, unknown: 0 };
const timeScore = { immediate: 95, this_quarter: 70, next_quarter: 40, unknown: 10 };
const authScore = { decision_maker: 100, influencer: 55, unknown: 10 };

export default function QualPanel({ lead }) {
  if (!lead) return null;

  const bant = [
    { label: 'Budget', value: lead.budget || 'Unknown', score: lead.budget ? 75 : 0 },
    { label: 'Authority', value: lead.authority || 'Unknown', score: authScore[lead.authority] ?? 0 },
    { label: 'Need', value: lead.need || 'Unknown', score: needScore[lead.need] ?? 0 },
    { label: 'Timeline', value: lead.timeline?.replace('_', ' ') || 'Unknown', score: timeScore[lead.timeline] ?? 0 },
  ];

  const color = scoreColor(lead.score);
  const bg = scoreBg(lead.score);

  return (
    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        {/* Score ring */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color, border: `2px solid ${color}30`
          }}>
            {lead.score || 0}
          </div>
          <span style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</span>
        </div>

        {/* BANT bars */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bant.map(b => (
            <div key={b.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{b.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'capitalize' }}>{b.value}</span>
              </div>
              <Bar value={b.score} color={color} />
            </div>
          ))}
        </div>
      </div>

      {/* Extra fields */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {lead.company && <Info label="Company" value={lead.company} />}
        {lead.role && <Info label="Role" value={lead.role} />}
        {lead.email && <Info label="Email" value={lead.email} />}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}
