'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type EmployeeStatus = 'interviewing' | 'offer_sent' | 'offer_accepted' | 'offer_rejected' | 'onboarded';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: EmployeeStatus;
  offered_salary?: string;
  joining_date?: string;
  address?: string;
  id_proof_url?: string;
}

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Modal Control States
  const [activeModal, setActiveModal] = useState<'offer' | 'onboard' | 'add' | null>(null);

  // Form Input States
  const [salaryInput, setSalaryInput] = useState('');
  const [joiningDateInput, setJoiningDateInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // New Candidate Form State
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', phone: '', position: '' });

  // 1. Fetch Employees from Supabase
  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching employees:', error.message);
    else setEmployees(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2. Add Candidate to Supabase DB
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('employees').insert([
      {
        ...newCandidate,
        status: 'interviewing'
      }
    ]);

    if (error) {
      alert('Failed to add candidate: ' + error.message);
    } else {
      setNewCandidate({ name: '', email: '', phone: '', position: '' });
      setActiveModal(null);
      fetchEmployees();
    }
  };

  // 3. Update Salary & Send Offer
  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const { error } = await supabase
      .from('employees')
      .update({
        status: 'offer_sent',
        offered_salary: salaryInput
      })
      .eq('id', selectedEmp.id);

    if (error) {
      alert('Error sending offer: ' + error.message);
    } else {
      setActiveModal(null);
      setSalaryInput('');
      fetchEmployees();
    }
  };

  // 4. Update Offer Status (Accepted / Declined)
  const handleUpdateOfferStatus = async (id: string, status: 'offer_accepted' | 'offer_rejected') => {
    const { error } = await supabase
      .from('employees')
      .update({ status })
      .eq('id', id);

    if (error) alert('Error updating status: ' + error.message);
    else fetchEmployees();
  };

  // 5. Complete Onboarding & Upload ID File to Supabase Storage
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !idFile) {
      alert('Please select an ID proof document.');
      return;
    }

    setUploading(true);

    try {
      // Step A: Upload File to Supabase Bucket 'employee-ids'
      const fileExt = idFile.name.split('.').pop();
      const fileName = `${selectedEmp.id}-${Date.now()}.${fileExt}`;
      const filePath = `id-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-ids')
        .upload(filePath, idFile);

      if (uploadError) throw uploadError;

      // Step B: Get Public URL of the uploaded document
      const { data: urlData } = supabase.storage
        .from('employee-ids')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Step C: Update Employee Record in DB
      const { error: dbError } = await supabase
        .from('employees')
        .update({
          status: 'onboarded',
          joining_date: joiningDateInput,
          address: addressInput,
          id_proof_url: publicUrl
        })
        .eq('id', selectedEmp.id);

      if (dbError) throw dbError;

      setActiveModal(null);
      setAddressInput('');
      setJoiningDateInput('');
      setIdFile(null);
      fetchEmployees();
    } catch (err: any) {
      alert('Onboarding failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Employee Lifecycle Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage candidate interviews, issue offer letters, track acceptances, and onboard staff with permanent cloud documents.
          </p>
        </div>
        <button
          onClick={() => setActiveModal('add')}
          className="px-5 py-2.5 bg-[#0087A1] hover:bg-[#00738a] text-white font-bold rounded-lg text-sm shadow-md transition"
        >
          + Add New Candidate
        </button>
      </div>

      {/* Employee Pipeline Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Candidate & Staff Pipeline</h2>
          <span className="text-xs text-slate-400">Total: {employees.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading records from database...</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Name & Role</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Offered Salary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No candidate records found. Click "+ Add New Candidate" to get started.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-4">
                        <p className="font-bold text-white">{emp.name}</p>
                        <p className="text-xs text-slate-400">{emp.position}</p>
                      </td>

                      <td className="p-4 text-xs text-slate-300">
                        <p>{emp.email}</p>
                        <p className="text-slate-400">{emp.phone}</p>
                      </td>

                      <td className="p-4 font-semibold text-slate-200">
                        {emp.offered_salary || <span className="text-xs text-slate-500">Not Offered</span>}
                      </td>

                      <td className="p-4">
                        <StatusBadge status={emp.status} />
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {emp.status === 'interviewing' && (
                          <button
                            onClick={() => {
                              setSelectedEmp(emp);
                              setActiveModal('offer');
                            }}
                            className="px-3 py-1.5 bg-[#F26522] hover:bg-[#d95516] text-white text-xs font-bold rounded-md transition"
                          >
                            Create Offer Letter
                          </button>
                        )}

                        {emp.status === 'offer_sent' && (
                          <>
                            <button
                              onClick={() => handleUpdateOfferStatus(emp.id, 'offer_accepted')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition"
                            >
                              Mark Accepted
                            </button>
                            <button
                              onClick={() => handleUpdateOfferStatus(emp.id, 'offer_rejected')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md transition"
                            >
                              Mark Declined
                            </button>
                          </>
                        )}

                        {emp.status === 'offer_accepted' && (
                          <button
                            onClick={() => {
                              setSelectedEmp(emp);
                              setActiveModal('onboard');
                            }}
                            className="px-3 py-1.5 bg-[#7D299E] hover:bg-[#682084] text-white text-xs font-bold rounded-md transition"
                          >
                            Collect Details & ID
                          </button>
                        )}

                        {emp.status === 'onboarded' && emp.id_proof_url && (
                          <a
                            href={emp.id_proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-md border border-slate-700 transition"
                          >
                            📄 View ID Proof
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL 1: ADD CANDIDATE --- */}
      {activeModal === 'add' && (
        <Modal title="Add Candidate (Interview Stage)" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddCandidate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400">Full Name</label>
              <input
                type="text"
                required
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">Email Address</label>
              <input
                type="email"
                required
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={newCandidate.email}
                onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">Phone Number</label>
              <input
                type="text"
                required
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={newCandidate.phone}
                onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">Job Position</label>
              <input
                type="text"
                required
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={newCandidate.position}
                onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#0087A1] font-bold text-white rounded-lg hover:bg-opacity-90 transition text-sm"
            >
              Save Candidate
            </button>
          </form>
        </Modal>
      )}

      {/* --- MODAL 2: CREATE OFFER LETTER --- */}
      {activeModal === 'offer' && selectedEmp && (
        <Modal title={`Create Offer Letter for ${selectedEmp.name}`} onClose={() => setActiveModal(null)}>
          <form onSubmit={handleSendOffer} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400">Offered Salary (e.g. ₹6,00,000 / year)</label>
              <input
                type="text"
                required
                placeholder="₹8,00,000 per annum"
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
              />
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 space-y-2">
              <p className="font-bold text-white">Offer Letter Summary:</p>
              <p>Position: <strong>{selectedEmp.position}</strong></p>
              <p>Email: <strong>{selectedEmp.email}</strong></p>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#F26522] font-bold text-white rounded-lg hover:bg-opacity-90 transition text-sm"
            >
              Issue Offer Letter
            </button>
          </form>
        </Modal>
      )}

      {/* --- MODAL 3: ONBOARDING & ID PROOF UPLOAD --- */}
      {activeModal === 'onboard' && selectedEmp && (
        <Modal title={`Onboarding Details — ${selectedEmp.name}`} onClose={() => setActiveModal(null)}>
          <form onSubmit={handleOnboardSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400">Date of Joining</label>
              <input
                type="date"
                required
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={joiningDateInput}
                onChange={(e) => setJoiningDateInput(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">Residential Address</label>
              <textarea
                required
                rows={3}
                placeholder="Full address..."
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">Upload ID Proof (JPG / PNG / PDF)</label>
              <input
                type="file"
                required
                accept=".jpg,.jpeg,.png,.pdf"
                className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0087A1] file:text-white hover:file:bg-[#00738a]"
                onChange={(e) => setIdFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-[#7D299E] font-bold text-white rounded-lg hover:bg-opacity-90 transition text-sm disabled:opacity-50"
            >
              {uploading ? 'Uploading ID & Saving...' : 'Complete Onboarding'}
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  const styles = {
    interviewing: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
    offer_sent: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
    offer_accepted: 'bg-purple-950/60 text-purple-400 border-purple-800/60',
    offer_rejected: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
    onboarded: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
  };

  const labels = {
    interviewing: 'Interviewing',
    offer_sent: 'Offer Sent',
    offer_accepted: 'Offer Accepted',
    offer_rejected: 'Offer Declined',
    onboarded: 'Onboarded'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}