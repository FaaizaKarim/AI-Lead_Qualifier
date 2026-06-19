import { useState, useEffect, useCallback } from 'react';

const API = '/api';
const API_KEY = import.meta.env.VITE_DASHBOARD_API_KEY || 'change-me-to-something-secret';

const headers = { 'Content-Type': 'application/json', 'x-api-key': API_KEY };

export function useLeads(tier = '') {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const qs = tier ? `?tier=${tier}` : '';
      const [leadsRes, statsRes] = await Promise.all([
        fetch(`${API}/leads${qs}`, { headers }),
        fetch(`${API}/leads/stats`, { headers })
      ]);

      if (!leadsRes.ok) throw new Error(`API error ${leadsRes.status}`);
      const leadsData = await leadsRes.json();
      const statsData = statsRes.ok ? await statsRes.json() : null;

      setLeads(leadsData.leads || []);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tier]);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const deleteLead = async (id) => {
    await fetch(`${API}/leads/${id}`, { method: 'DELETE', headers });
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const fetchLeadDetail = async (id) => {
    const res = await fetch(`${API}/leads/${id}`, { headers });
    if (!res.ok) throw new Error('Failed to load lead');
    return res.json();
  };

  return { leads, stats, loading, error, refetch: fetchLeads, deleteLead, fetchLeadDetail };
}
