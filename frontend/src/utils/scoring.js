export function tierBadgeClass(tier) {
  return { hot: 'badge-hot', warm: 'badge-warm', cold: 'badge-cold', booked: 'badge-booked' }[tier] || 'badge-cold';
}

export function tierLabel(tier, meetingBooked) {
  if (meetingBooked) return 'Booked';
  return { hot: '🔥 Hot', warm: '🌤 Warm', cold: '❄️ Cold' }[tier] || 'Cold';
}

export function scoreColor(score) {
  if (score >= 75) return '#f0933a';
  if (score >= 50) return '#3db87a';
  return '#378ADD';
}

export function scoreBg(score) {
  if (score >= 75) return '#3d2910';
  if (score >= 50) return '#1d3e2a';
  return '#1d2a3e';
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  // SQLite stores datetime('now') as "YYYY-MM-DD HH:MM:SS" without timezone indicator.
  // Browsers parse this as LOCAL time, causing an offset equal to the user's UTC offset.
  // Appending 'Z' forces correct UTC interpretation.
  const normalized = String(dateStr).replace(' ', 'T').replace(/Z?$/, 'Z');
  const diff = Date.now() - new Date(normalized).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
