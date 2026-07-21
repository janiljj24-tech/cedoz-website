'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type EmployeeStatus = 
  | 'interviewing' 
  | 'interview_passed' 
  | 'interview_failed' 
  | 'offer_sent' 
  | 'offer_accepted' 
  | 'offer_rejected' 
  | 'onboarded';

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

function EmployeeManagementContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter'); // 'interviewing', 'offers', or 'onboarding'

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Modal Control States
  const [activeModal, setActiveModal] = useState<'offer' | 'view_offer' | 'onboard' | 'add' | null>(null);

  // Form Input States
  const [salaryInput, setSalaryInput] = useState('');
  const [joiningDateInput, setJoiningDateInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // New Candidate Form State
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', phone: '', position: '' });

  // Fetch Employees from Supabase
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

  // Filter employees based on active submenu
  const filteredEmployees = employees.filter((emp) => {
    if (filter === 'interviewing') {
      return ['interviewing', 'interview_passed', 'interview_failed'].includes(emp.status);
    }
    if (filter === 'offers') {
      return ['offer_sent', 'offer_accepted', 'offer_rejected'].includes(emp.status);
    }
    if (filter === 'onboarding') {
      return emp.status === 'onboarded';
    }
    return true; // Default: show all pipeline
  });

  // Get Page Header Title based on filter
  const getPageTitle = () => {
    if (filter === 'interviewing') return 'Interviews & Assessments';
    if (filter === 'offers') return 'Offer Letters';
    if (filter === 'onboarding') return 'Onboarding & ID Proofs';
    return 'Employee Lifecycle Management';
  };

  // 1. Add Candidate
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

  // 2. Mark Candidate as Pass or Fail
  const handleInterviewResult = async (id: string, result: 'passed' | 'failed') => {
    const newStatus: EmployeeStatus = result === 'passed' ? 'interview_passed' : 'interview_failed';
    const { error } = await supabase
      .from('employees')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) alert('Error updating interview result: ' + error.message);
    else fetchEmployees();
  };

  // 3. Create & Send Offer Letter
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

  // 5. Complete Onboarding & Upload ID File
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !idFile) {
      alert('Please select an ID proof document.');
      return;
    }

    setUploading(true);

    try {
      const fileExt = idFile.name.split('.').pop();
      const fileName = `${selectedEmp.id}-${Date.now()}.${fileExt}`;
      const filePath = `id-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-ids')
        .upload(filePath, idFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('employee-ids')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

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

  // 6. Trigger Print
  const handlePrintOfferLetter = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Printable Area Specific Styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-offer-letter, #printable-offer-letter * {
            visibility: visible;
          }
          #printable-offer-letter {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{getPageTitle()}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {filter === 'interviewing' && 'Track candidates currently in assessment or interview stage.'}
            {filter === 'offers' && 'Manage issued offer letters, track acceptances, and preview official documentation.'}
            {filter === 'onboarding' && 'View fully onboarded employees along with their submitted identification files.'}
            {!filter && 'Full candidate and employee lifecycle management pipeline.'}
          </p>
        </div>
        <button
          onClick={() => setActiveModal('add')}
          className="px-5 py-2.5 bg-[#0087A1] hover:bg-[#00738a] text-white font-bold rounded-lg text-sm shadow-md transition"
        >
          + Add New Candidate
        </button>
      </div>

      {/* Employee Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">
            {filter ? `${getPageTitle()} (${filteredEmployees.length})` : `All Candidates (${filteredEmployees.length})`}
          </h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading records...</div>
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
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No records found for this category.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
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
                        {/* Interview Stage */}
                        {emp.status === 'interviewing' && (
                          <>
                            <button
                              onClick={() => handleInterviewResult(emp.id, 'passed')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition"
                            >
                              ✓ Pass
                            </button>
                            <button
                              onClick={() => handleInterviewResult(emp.id, 'failed')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md transition"
                            >
                              ✕ Fail
                            </button>
                          </>
                        )}

                        {/* Interview Passed -> Create Offer */}
                        {emp.status === 'interview_passed' && (
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

                        {/* Interview Failed */}
                        {emp.status === 'interview_failed' && (
                          <span className="text-xs text-slate-500 italic">Interview Failed</span>
                        )}

                        {/* Offer Sent / Accepted / Onboarded -> View Offer */}
                        {['offer_sent', 'offer_accepted', 'onboarded'].includes(emp.status) && (
                          <button
                            onClick={() => {
                              setSelectedEmp(emp);
                              setActiveModal('view_offer');
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-md border border-slate-700 transition"
                          >
                            👁 View Offer
                          </button>
                        )}

                        {/* Track Acceptance */}
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

                        {/* Onboard Action */}
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

                        {/* View ID Proof Document */}
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

      {/* --- MODAL 3: VIEW OFFER LETTER --- */}
      {activeModal === 'view_offer' && selectedEmp && (
        <Modal title="Official Offer Letter Preview" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div id="printable-offer-letter" className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-inner text-sm space-y-4">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
                <div>
                  <img src="/logo.png" alt="CEDOZ Official Logo" className="h-12 w-auto object-contain mb-1" />
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Community Empowerment & Development Organization
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p className="font-bold text-slate-800">OFFICIAL OFFER LETTER</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p>Ref: OFF-{selectedEmp.id.slice(0, 6).toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-base text-slate-800">To: {selectedEmp.name}</p>
                <p className="text-slate-600 text-xs">Email: {selectedEmp.email}</p>
                <p className="text-slate-600 text-xs">Phone: {selectedEmp.phone}</p>
              </div>

              <p className="text-slate-700 leading-relaxed text-xs">
                Dear <strong>{selectedEmp.name}</strong>,<br /><br />
                We are pleased to offer you the position of <strong>{selectedEmp.position}</strong> at <strong>CEDOZ</strong>.
              </p>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1">
                <p className="text-xs text-slate-500 uppercase font-bold">Offer Summary</p>
                <p className="text-sm font-semibold">Position: <span className="text-[#0087A1]">{selectedEmp.position}</span></p>
                <p className="text-sm font-semibold">Offered Remuneration: <span className="text-[#F26522]">{selectedEmp.offered_salary || 'As Agreed'}</span></p>
                {selectedEmp.joining_date && (
                  <p className="text-sm font-semibold">Joining Date: <span className="text-slate-800">{selectedEmp.joining_date}</span></p>
                )}
              </div>

              <div className="pt-6 flex justify-between items-end border-t border-slate-200">
                <div>
                  <p className="font-bold text-xs text-slate-800">Authorized Signature</p>
                  <p className="text-xs text-slate-500">HR & Operations Dept.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 no-print">
              <button
                onClick={handlePrintOfferLetter}
                className="flex-1 py-3 bg-[#0087A1] hover:bg-[#00738a] text-white font-bold rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                📥 Download / Print Offer PDF
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 4: ONBOARDING & ID PROOF UPLOAD --- */}
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

export default function EmployeeManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading page...</div>}>
      <EmployeeManagementContent />
    </Suspense>
  );
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  const styles = {
    interviewing: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
    interview_passed: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    interview_failed: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
    offer_sent: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
    offer_accepted: 'bg-purple-950/60 text-purple-400 border-purple-800/60',
    offer_rejected: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
    onboarded: 'bg-teal-950/60 text-teal-400 border-teal-800/60'
  };

  const labels = {
    interviewing: 'Interview Scheduled',
    interview_passed: 'Passed Interview',
    interview_failed: 'Failed Interview',
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
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 no-print">
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