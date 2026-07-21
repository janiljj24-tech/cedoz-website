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

type AcademicLevel = 
  | 'Secondary Education'
  | 'Higher Secondary Education'
  | 'Degree (Graduation)'
  | 'PG (Post-Graduation)';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: EmployeeStatus;
  
  // Salary Details
  offered_salary?: string;
  basic_pay?: string;
  allowances?: string;

  // Onboarding & Personal Details
  joining_date?: string;
  address?: string;
  dob?: string;
  gender?: string;
  emergency_contact?: string;
  blood_group?: string;

  // Academic Details
  academic_level?: AcademicLevel;
  institution_name?: string;
  academic_year?: string;
  academic_certificate_url?: string;

  // ID Proof
  id_proof_url?: string;
}

function EmployeeManagementContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter'); // 'interviewing', 'offers', 'onboarding', 'staff'

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Modal Controls
  const [activeModal, setActiveModal] = useState<'offer' | 'view_offer' | 'onboard' | 'add' | 'view_staff' | 'edit_staff' | null>(null);

  // Form States
  const [salaryInput, setSalaryInput] = useState('');
  const [joiningDateInput, setJoiningDateInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Staff Editing / Profile State
  const [editFormData, setEditFormData] = useState<Partial<Employee>>({});
  const [academicFile, setAcademicFile] = useState<File | null>(null);

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
      return ['offer_accepted'].includes(emp.status);
    }
    if (filter === 'staff') {
      return emp.status === 'onboarded';
    }
    return true; // Default: show all pipeline
  });

  const getPageTitle = () => {
    if (filter === 'interviewing') return 'Interviews & Assessments';
    if (filter === 'offers') return 'Offer Letters';
    if (filter === 'onboarding') return 'Onboarding';
    if (filter === 'staff') return 'Staff Directory & Profiles';
    return 'Employee Lifecycle Management';
  };

  // Add Candidate
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('employees').insert([{ ...newCandidate, status: 'interviewing' }]);
    if (error) {
      alert('Failed to add candidate: ' + error.message);
    } else {
      setNewCandidate({ name: '', email: '', phone: '', position: '' });
      setActiveModal(null);
      fetchEmployees();
    }
  };

  // Update Status
  const handleInterviewResult = async (id: string, result: 'passed' | 'failed') => {
    const newStatus: EmployeeStatus = result === 'passed' ? 'interview_passed' : 'interview_failed';
    const { error } = await supabase.from('employees').update({ status: newStatus }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    else fetchEmployees();
  };

  // Send Offer
  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    const { error } = await supabase
      .from('employees')
      .update({ status: 'offer_sent', offered_salary: salaryInput })
      .eq('id', selectedEmp.id);

    if (error) alert('Error sending offer: ' + error.message);
    else {
      setActiveModal(null);
      setSalaryInput('');
      fetchEmployees();
    }
  };

  const handleUpdateOfferStatus = async (id: string, status: 'offer_accepted' | 'offer_rejected') => {
    const { error } = await supabase.from('employees').update({ status }).eq('id', id);
    if (error) alert('Error updating status: ' + error.message);
    else fetchEmployees();
  };

  // Onboard Submit
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !idFile) {
      alert('Please select an ID proof document.');
      return;
    }
    setUploading(true);

    try {
      const fileExt = idFile.name.split('.').pop();
      const filePath = `id-proofs/${selectedEmp.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('employee-ids').upload(filePath, idFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('employee-ids').getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('employees')
        .update({
          status: 'onboarded',
          joining_date: joiningDateInput,
          address: addressInput,
          id_proof_url: urlData.publicUrl
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

  // Save / Edit Full Staff Details
  const handleSaveStaffDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setUploading(true);

    try {
      let academicCertUrl = editFormData.academic_certificate_url;

      // Upload Academic Certificate if new file provided
      if (academicFile) {
        const fileExt = academicFile.name.split('.').pop();
        const filePath = `academic-certs/${selectedEmp.id}-${Date.now()}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage.from('employee-ids').upload(filePath, academicFile);
        if (uploadErr) throw uploadErr;

        const { data: certUrlData } = supabase.storage.from('employee-ids').getPublicUrl(filePath);
        academicCertUrl = certUrlData.publicUrl;
      }

      const { error: dbError } = await supabase
        .from('employees')
        .update({
          ...editFormData,
          academic_certificate_url: academicCertUrl
        })
        .eq('id', selectedEmp.id);

      if (dbError) throw dbError;

      alert('Employee details updated successfully!');
      setActiveModal(null);
      setAcademicFile(null);
      fetchEmployees();
    } catch (err: any) {
      alert('Failed to save details: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Printable Area Styling */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-offer-letter, #printable-offer-letter * { visibility: visible; }
          #printable-offer-letter { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{getPageTitle()}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {filter === 'interviewing' && 'Track candidates currently in assessment or interview stage.'}
            {filter === 'offers' && 'Manage issued offer letters, track acceptances, and preview official documentation.'}
            {filter === 'onboarding' && 'Candidates who accepted offers and require onboarding document collection.'}
            {filter === 'staff' && 'Directory of active onboarded staff with personal, academic, and salary profiles.'}
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
            {filter ? `${getPageTitle()} (${filteredEmployees.length})` : `All Records (${filteredEmployees.length})`}
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
                  <th className="p-4">Salary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No staff or candidate records found in this view.
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
                        {emp.offered_salary || <span className="text-xs text-slate-500">Not Set</span>}
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

                        {['offer_sent', 'offer_accepted', 'onboarded'].includes(emp.status) && (
                          <button
                            onClick={() => {
                              setSelectedEmp(emp);
                              setActiveModal('view_offer');
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-md border border-slate-700 transition"
                          >
                            👁 Offer Letter
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
                            Complete Onboarding
                          </button>
                        )}

                        {/* STAFF SPECIFIC ACTIONS */}
                        {emp.status === 'onboarded' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedEmp(emp);
                                setActiveModal('view_staff');
                              }}
                              className="px-3 py-1.5 bg-[#0087A1] hover:bg-[#00738a] text-white text-xs font-bold rounded-md transition"
                            >
                              👁 View Profile
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEmp(emp);
                                setEditFormData(emp);
                                setActiveModal('edit_staff');
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-md border border-slate-700 transition"
                            >
                              ✏ Edit Details
                            </button>
                          </>
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
        <Modal title="Add Candidate" onClose={() => setActiveModal(null)}>
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
            <button type="submit" className="w-full py-3 bg-[#0087A1] font-bold text-white rounded-lg transition text-sm">
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
              <label className="text-xs font-bold text-slate-400">Offered Salary</label>
              <input
                type="text"
                required
                placeholder="₹8,00,000 per annum"
                className="w-full mt-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full py-3 bg-[#F26522] font-bold text-white rounded-lg transition text-sm">
              Issue Offer Letter
            </button>
          </form>
        </Modal>
      )}

      {/* --- MODAL 3: ONBOARDING --- */}
      {activeModal === 'onboard' && selectedEmp && (
        <Modal title={`Complete Onboarding — ${selectedEmp.name}`} onClose={() => setActiveModal(null)}>
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
                className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-xs"
                onChange={(e) => setIdFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-[#7D299E] font-bold text-white rounded-lg transition text-sm"
            >
              {uploading ? 'Uploading & Saving...' : 'Complete Onboarding'}
            </button>
          </form>
        </Modal>
      )}

      {/* --- MODAL 4: VIEW FULL STAFF PROFILE --- */}
      {activeModal === 'view_staff' && selectedEmp && (
        <Modal title={`Staff Profile — ${selectedEmp.name}`} onClose={() => setActiveModal(null)}>
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            
            {/* Personal Details Section */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-[#38bdf8] uppercase tracking-wider">👤 Personal Details</h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <p><strong>Full Name:</strong> {selectedEmp.name}</p>
                <p><strong>Email:</strong> {selectedEmp.email}</p>
                <p><strong>Phone:</strong> {selectedEmp.phone}</p>
                <p><strong>Position:</strong> {selectedEmp.position}</p>
                <p><strong>Date of Birth:</strong> {selectedEmp.dob || 'N/A'}</p>
                <p><strong>Gender:</strong> {selectedEmp.gender || 'N/A'}</p>
                <p><strong>Blood Group:</strong> {selectedEmp.blood_group || 'N/A'}</p>
                <p><strong>Emergency Contact:</strong> {selectedEmp.emergency_contact || 'N/A'}</p>
                <p className="col-span-2"><strong>Address:</strong> {selectedEmp.address || 'N/A'}</p>
              </div>
            </div>

            {/* Academic Details Section */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">🎓 Academic Background</h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <p><strong>Qualification:</strong> {selectedEmp.academic_level || 'N/A'}</p>
                <p><strong>School / University:</strong> {selectedEmp.institution_name || 'N/A'}</p>
                <p><strong>Year of Passing:</strong> {selectedEmp.academic_year || 'N/A'}</p>
                <p>
                  <strong>Certificate Attachment:</strong>{' '}
                  {selectedEmp.academic_certificate_url ? (
                    <a href={selectedEmp.academic_certificate_url} target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-bold">
                      📄 View Certificate
                    </a>
                  ) : (
                    <span className="text-slate-500">Not Uploaded</span>
                  )}
                </p>
              </div>
            </div>

            {/* Salary Details Section */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">💰 Remuneration & ID</h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <p><strong>Joining Date:</strong> {selectedEmp.joining_date || 'N/A'}</p>
                <p><strong>Offered CTC / Salary:</strong> {selectedEmp.offered_salary || 'N/A'}</p>
                <p><strong>Basic Pay:</strong> {selectedEmp.basic_pay || 'N/A'}</p>
                <p><strong>Allowances:</strong> {selectedEmp.allowances || 'N/A'}</p>
                <p className="col-span-2">
                  <strong>Uploaded ID Proof:</strong>{' '}
                  {selectedEmp.id_proof_url ? (
                    <a href={selectedEmp.id_proof_url} target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-bold">
                      📄 View ID Document
                    </a>
                  ) : (
                    <span className="text-slate-500">Not Uploaded</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditFormData(selectedEmp);
                setActiveModal('edit_staff');
              }}
              className="w-full py-3 bg-[#0087A1] font-bold text-white rounded-lg transition text-sm"
            >
              ✏ Edit Employee Profile
            </button>
          </div>
        </Modal>
      )}

      {/* --- MODAL 5: EDIT STAFF DETAILS --- */}
      {activeModal === 'edit_staff' && selectedEmp && (
        <Modal title={`Edit Details — ${selectedEmp.name}`} onClose={() => setActiveModal(null)}>
          <form onSubmit={handleSaveStaffDetails} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            
            {/* 1. Personal Info */}
            <div className="space-y-3 border-b border-slate-800 pb-4">
              <p className="font-bold text-[#38bdf8] text-sm">Personal Information</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Designation / Role</label>
                  <input
                    type="text"
                    required
                    className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    value={editFormData.position || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    value={editFormData.dob || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Gender</label>
                  <select
                    className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    value={editFormData.gender || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Blood Group</label>
                  <input
                    type="text"
                    placeholder="e.g. O+ve"
                    className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    value={editFormData.blood_group || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, blood_group: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Emergency Contact</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    value={editFormData.emergency_contact || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, emergency_contact: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 2. Academic Info */}
            <div className="space-y-3 border-b border-slate-800 pb-4">
              <p className="font-bold text-emerald-400 text-sm">Academic Details</p>
              
              <div>
                <label className="text-slate-400 font-semibold">Academic Level</label>
                <select
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  value={editFormData.academic_level || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, academic_level: e.target.value as AcademicLevel })}
                >
                  <option value="">Select Qualification</option>
                  <option value="Secondary Education">Secondary Education</option>
                  <option value="Higher Secondary Education">Higher Secondary Education</option>
                  <option value="Degree (Graduation)">Degree (Graduation)</option>
                  <option value="PG (Post-Graduation)">PG (Post-Graduation)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold">College / University / School Name</label>
                <input
                  type="text"
                  placeholder="e.g. Calicut University"
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  value={editFormData.institution_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, institution_name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold">Attach Academic Certificate (JPG / PNG / PDF)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300"
                  onChange={(e) => setAcademicFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>
            </div>

            {/* 3. Salary Info */}
            <div className="space-y-3 pb-2">
              <p className="font-bold text-amber-400 text-sm">Salary & Structure</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold">Total CTC / Offered Salary</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    value={editFormData.offered_salary || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, offered_salary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold">Basic Pay</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25,000 / month"
                    className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    value={editFormData.basic_pay || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, basic_pay: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-[#0087A1] font-bold text-white rounded-lg transition text-sm disabled:opacity-50"
            >
              {uploading ? 'Saving Changes...' : 'Save Profile Changes'}
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
    onboarded: 'Staff Member'
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