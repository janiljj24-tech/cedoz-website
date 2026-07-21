'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Inquiry {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export default function AdminLeads() {
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLeads(data);
      }
      setLoading(false);
    }

    fetchLeads();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Client Inquiries</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Review and manage all incoming form submissions from the public website.</p>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading submissions...</p>
      ) : leads.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', padding: '3rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          📥 No inquiries received yet.
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Client Name</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Email Address</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 500 }}>{lead.name}</td>
                  <td style={{ padding: '1rem', color: '#0ea5e9' }}>
                    <a href={`mailto:${lead.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{lead.email}</a>
                  </td>
                  <td style={{ padding: '1rem', color: '#334155', lineHeight: '1.5' }}>{lead.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}