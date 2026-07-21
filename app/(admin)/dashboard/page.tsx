'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ running: 0, completed: 0, leads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getStats() {
      const { count: runningCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'running');
      const { count: completedCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed');
      const { count: leadsCount } = await supabase.from('inquiries').select('*', { count: 'exact', head: true });

      setMetrics({
        running: runningCount || 0,
        completed: completedCount || 0,
        leads: leadsCount || 0
      });
      setLoading(false);
    }
    getStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Overview Dashboard</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Live snapshot metrics from the CEDOZ relational operational database modules.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>⏳ Running Projects</span>
          <h2 style={{ fontSize: '2rem', color: '#f59e0b', margin: '0.5rem 0 0 0' }}>{loading ? '...' : metrics.running}</h2>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>✅ Completed Projects</span>
          <h2 style={{ fontSize: '2rem', color: '#10b981', margin: '0.5rem 0 0 0' }}>{loading ? '...' : metrics.completed}</h2>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>📥 Total Inquiries</span>
          <h2 style={{ fontSize: '2rem', color: '#0ea5e9', margin: '0.5rem 0 0 0' }}>{loading ? '...' : metrics.leads}</h2>
        </div>
      </div>
    </div>
  );
}