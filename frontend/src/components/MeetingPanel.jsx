export default function MeetingPanel({ lead, liveMeeting }) {
  const booked = lead?.meeting_booked || liveMeeting;
  const url = lead?.meeting_url || liveMeeting?.url;

  if (!booked && !url) return null;

  return (
    <div style={{
      margin: '0 16px 12px',
      padding: '12px 14px',
      background: 'var(--green-dim)',
      border: '1px solid #2a5e40',
      borderRadius: 'var(--radius)',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }}>
      <i className="ti ti-calendar-check" style={{ fontSize: 20, color: 'var(--green)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--green)', marginBottom: 2 }}>
          Meeting booking link sent!
        </div>
        {url && (
          <a href={url} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: 'var(--text2)', textDecoration: 'underline' }}>
            {url.length > 50 ? url.slice(0, 50) + '…' : url}
          </a>
        )}
      </div>
      {url && (
        <a href={url} target="_blank" rel="noreferrer"
          style={{
            padding: '5px 10px', background: 'var(--green)', color: '#fff',
            borderRadius: 6, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap'
          }}>
          Open →
        </a>
      )}
    </div>
  );
}
