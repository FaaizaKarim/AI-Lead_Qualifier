import { useState } from 'react';
import { useLeads } from '../hooks/useLeads.js';
import Sidebar from './Sidebar.jsx';
import LeadCard from './LeadCard.jsx';

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 120
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: color + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <i className={`ti ti-${icon}`} style={{ fontSize: 18, color }} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const { leads, stats, loading, error, refetch, deleteLead, fetchLeadDetail } = useLeads(filter);

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return;
    await deleteLead(id);
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Stats bar */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <StatCard label="Total Leads" value={stats?.total} icon="users" color="var(--blue)" />
          <StatCard label="Hot Leads" value={stats?.hot} icon="flame" color="var(--orange)" />
          <StatCard label="Warm Leads" value={stats?.warm} icon="cloud" color="var(--green)" />
          <StatCard label="Meetings Booked" value={stats?.booked} icon="calendar-check" color="var(--purple)" />
          <StatCard label="Avg Score" value={stats?.avgScore} icon="chart-bar" color="var(--blue)" />
          <StatCard label="Today" value={stats?.today} icon="calendar" color="var(--text2)" />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {loading && !leads.length ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
            Loading leads…
          </div>
        ) : error ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: 'var(--red)' }}>Failed to load leads</div>
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>{error}</div>
            <button onClick={refetch} style={{ padding: '7px 16px', background: 'var(--bg3)', color: 'var(--text)', borderRadius: 6, border: '1px solid var(--border)' }}>
              Retry
            </button>
          </div>
        ) : (
          <>
            <Sidebar leads={leads} selectedId={selected?.id} onSelect={setSelected} filter={filter} onFilter={setFilter} />
            <LeadCard lead={selected} fetchDetail={fetchLeadDetail} onDelete={handleDelete} />
          </>
        )}
      </div>
    </div>
  );
}
