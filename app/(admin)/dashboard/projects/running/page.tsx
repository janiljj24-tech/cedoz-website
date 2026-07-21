'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Project {
  id: number;
  title: string;
  client_name: string;
  description: string;
  status: string;
  file_number?: string;
  implementing_officer?: string;
  signing_authority?: string;
  has_beneficiary_list?: boolean;
  beneficiary_list_url?: string;
  final_quantity?: number;
  final_project_amount?: number;
  agreement_signed?: boolean;
  advance_amount?: number;
  contractor_agreement?: string;
  remarks?: string;
}

export default function RunningProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRunningProjects = async () => {
    setLoading(true);
    
    // Updated to match various potential running statuses from Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .in('status', ['running', 'RUNNING', 'in_progress', 'In Progress', 'active'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data as Project[]);
    } else if (error) {
      console.error('Error fetching running projects:', error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRunningProjects();
  }, []);

  // Handle Mark as Completed
  const markAsCompleted = async (id: number) => {
    if (!confirm('Are you sure you want to mark this project as completed?')) return;
    const { error } = await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', id);

    if (!error) {
      fetchRunningProjects();
    } else {
      alert(error.message);
    }
  };

  // Open Edit Modal
  const handleStartEdit = (proj: Project) => {
    setEditingProject({ ...proj });
  };

  // Save Project Edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setIsSaving(true);

    const { error } = await supabase
      .from('projects')
      .update({
        title: editingProject.title,
        client_name: editingProject.client_name,
        implementing_officer: editingProject.implementing_officer,
        signing_authority: editingProject.signing_authority,
        final_quantity: editingProject.final_quantity,
        final_project_amount: editingProject.final_project_amount,
        advance_amount: editingProject.advance_amount,
        contractor_agreement: editingProject.contractor_agreement,
        agreement_signed: editingProject.agreement_signed,
        remarks: editingProject.remarks,
      })
      .eq('id', editingProject.id);

    setIsSaving(false);

    if (!error) {
      setEditingProject(null);
      fetchRunningProjects();
      alert('Project details updated successfully!');
    } else {
      alert(`Update failed: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '1.5rem' }}>
        Running Projects
      </h1>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p style={{ color: '#64748b' }}>No running projects active right now.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {projects.map((p) => (
            <div
              key={p.id}
              style={{
                backgroundColor: '#ffffff',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #0ea5e9',
              }}
            >
              {/* Card Top Line */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{p.title}</h3>
                    {p.file_number && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        {p.file_number}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                    Client / Lead: <strong>{p.client_name}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                    }}
                  >
                    {expandedId === p.id ? 'Hide Details' : 'View Details'}
                  </button>

                  <button
                    onClick={() => handleStartEdit(p)}
                    style={{
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => markAsCompleted(p.id)}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                    }}
                  >
                    Mark Completed
                  </button>
                </div>
              </div>

              {/* Collapsible Full Details Drawer */}
              {expandedId === p.id && (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    marginTop: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Implementing Officer</span>
                    <strong>{p.implementing_officer || 'N/A'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Signing Authority</span>
                    <strong>{p.signing_authority || 'N/A'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Quantity</span>
                    <strong>{p.final_quantity ?? 'N/A'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Final Amount</span>
                    <strong>{p.final_project_amount ? `₹${p.final_project_amount}` : 'N/A'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Advance Amount</span>
                    <strong>{p.advance_amount ? `₹${p.advance_amount}` : '₹0'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Agreement Signed</span>
                    <strong>{p.agreement_signed ? '✅ Yes' : '❌ No'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Beneficiary List</span>
                    {p.beneficiary_list_url ? (
                      <a
                        href={p.beneficiary_list_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0ea5e9', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        📎 View Document
                      </a>
                    ) : (
                      <strong>{p.has_beneficiary_list ? 'Yes (No File Attached)' : 'None'}</strong>
                    )}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#64748b', display: 'block' }}>Contractor Agreement</span>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b' }}>{p.contractor_agreement || 'None recorded'}</p>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#64748b', display: 'block' }}>Remarks</span>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#1e293b' }}>{p.remarks || 'No remarks added'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Project Details Modal */}
      {editingProject && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: '600px',
              borderRadius: '8px',
              padding: '1.5rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Edit Project Details</h2>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Project Title *
                </label>
                <input
                  required
                  type="text"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Client Name *
                </label>
                <input
                  required
                  type="text"
                  value={editingProject.client_name}
                  onChange={(e) => setEditingProject({ ...editingProject, client_name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Implementing Officer
                </label>
                <input
                  type="text"
                  value={editingProject.implementing_officer || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, implementing_officer: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Signing Authority
                </label>
                <input
                  type="text"
                  value={editingProject.signing_authority || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, signing_authority: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editingProject.final_quantity ?? ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        final_quantity: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Final Project Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProject.final_project_amount ?? ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        final_project_amount: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Advance Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProject.advance_amount ?? ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      advance_amount: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="editAgreement"
                  checked={editingProject.agreement_signed || false}
                  onChange={(e) => setEditingProject({ ...editingProject, agreement_signed: e.target.checked })}
                />
                <label htmlFor="editAgreement" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  Agreement Signed?
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Contractor Agreement Details
                </label>
                <textarea
                  rows={3}
                  value={editingProject.contractor_agreement || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, contractor_agreement: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Project Remarks
                </label>
                <textarea
                  rows={2}
                  value={editingProject.remarks || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, remarks: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  style={{ backgroundColor: '#cbd5e1', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}