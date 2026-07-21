'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function CreateProject() {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.from('projects').insert([{ title, client_name: client, description: desc, status: 'running' }]);
    
    if (!error) {
      router.push('/dashboard/projects/running');
    } else {
      alert(error.message);
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', backgroundColor: '#ffffff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>Create New Project Node</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Project Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Client Name</label>
          <input type="text" value={client} onChange={e => setClient(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
        </div>
        <button type="submit" disabled={saving} style={{ padding: '0.75rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
          {saving ? 'Creating...' : 'Initialize Running Project'}
        </button>
      </form>
    </div>
  );
}