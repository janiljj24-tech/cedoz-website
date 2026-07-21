'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface Project { 
  id: number; 
  title: string; 
  client_name: string; 
  description: string; 
  project_manager: string | null;
  total_cost: number | null;
}

export default function CompletedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCompleted() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
        
      if (data) setProjects(data as Project[]);
      setLoading(false);
    }
    fetchCompleted();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Completed Archives</h2>
      {loading ? (
        <p>Loading modules...</p>
      ) : projects.length === 0 ? (
        <p style={{ color: '#64748b' }}>No completed projects archived yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {projects.map(p => (
            <div key={p.id} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0' }}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Client: {p.client_name}</p>
                </div>
                <button 
                  onClick={() => setSelectedId(selectedId === p.id ? null : p.id)} 
                  style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                >
                  {selectedId === p.id ? 'Hide Details' : 'Open Project Details'}
                </button>
              </div>

              {/* View Meta Details Row */}
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <div><strong>Manager:</strong> {p.project_manager || 'Not Assigned'}</div>
                <div><strong>Total Cost:</strong> {p.total_cost ? `$${p.total_cost}` : 'Not Set'}</div>
              </div>

              {/* Collapsible Content Area */}
              {selectedId === p.id && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Project Summary & Description</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                    {p.description || 'No description provided for this project.'}
                  </p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}