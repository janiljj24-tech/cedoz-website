'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Tender {
  id: number;
  lead_name: string;
  project_name: string;
  tender_amount: number;
  quantity: number;
  closing_date: string;
  tender_type: string;
  status: string;
  remarks?: string;
}

export default function TenderWorkflow() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  // New Tender Form States
  const [leadName, setLeadName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [tenderAmount, setTenderAmount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [closingDate, setClosingDate] = useState('');
  const [tenderType, setTenderType] = useState('E-Tender');
  const [tenderRemarks, setTenderRemarks] = useState('');

  // Acceptance Modal Form States
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [implementingOfficer, setImplementingOfficer] = useState('');
  const [signingAuthority, setSigningAuthority] = useState('');
  const [hasBeneficiaryList, setHasBeneficiaryList] = useState(false);
  const [beneficiaryFile, setBeneficiaryFile] = useState<File | null>(null);
  const [projectQuantity, setProjectQuantity] = useState('');
  const [finalProjectAmount, setFinalProjectAmount] = useState('');
  const [agreementSigned, setAgreementSigned] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [contractorAgreement, setContractorAgreement] = useState('');
  const [projectRemarks, setProjectRemarks] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchTenders = async () => {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTenders(data as Tender[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  // Open Modal and Pre-populate Defaults from Tender
  const openAcceptanceModal = (tender: Tender) => {
    setSelectedTender(tender);
    setProjectQuantity(tender.quantity.toString());
    setProjectRemarks(tender.remarks || '');
    setHasBeneficiaryList(false);
    setBeneficiaryFile(null);
    setFinalProjectAmount(tender.tender_amount.toString());
  };

  // 1. Submit New Tender
  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('tenders').insert([
      {
        lead_name: leadName,
        project_name: projectName,
        tender_amount: parseFloat(tenderAmount),
        quantity: parseInt(quantity),
        closing_date: closingDate,
        tender_type: tenderType,
        remarks: tenderRemarks || null,
        status: 'Pending',
      },
    ]);

    if (!error) {
      setLeadName('');
      setProjectName('');
      setTenderAmount('');
      setQuantity('1');
      setClosingDate('');
      setTenderRemarks('');
      fetchTenders();
    } else {
      alert(error.message);
    }
  };

  // 2. Mark Tender as Accepted -> Auto Create Project
  const handleAcceptAndCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender) return;

    // Strict Validation Check
    if (!implementingOfficer.trim()) {
      alert('Please enter the Implementing Officer.');
      return;
    }
    if (!signingAuthority.trim()) {
      alert('Please enter the Signing Authority.');
      return;
    }
    if (hasBeneficiaryList) {
      if (!beneficiaryFile) {
        alert('Please attach the Beneficiary List Document.');
        return;
      }
      if (!projectQuantity) {
        alert('Please enter the confirmed Quantity.');
        return;
      }
      if (!finalProjectAmount) {
        alert('Please enter the Final Project Amount Confirmation.');
        return;
      }
    }
    if (!advanceAmount) {
      alert('Please enter the Advance Amount.');
      return;
    }
    if (!contractorAgreement.trim()) {
      alert('Please enter Contractor Agreement Details.');
      return;
    }

    setIsUploading(true);
    let uploadedFileUrl: string | null = null;

    // Upload beneficiary file if selected
    if (hasBeneficiaryList && beneficiaryFile) {
      const fileExt = beneficiaryFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `beneficiary_lists/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('beneficiary-lists')
        .upload(filePath, beneficiaryFile);

      if (uploadError) {
        alert(`File upload failed: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('beneficiary-lists')
        .getPublicUrl(filePath);

      uploadedFileUrl = publicUrlData.publicUrl;
    }

    // Auto-generate file number: e.g., FN-2026-8A3B9
    const generatedFileNo = `FN-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Insert into Projects table
    const { error: projError } = await supabase.from('projects').insert([
      {
        title: selectedTender.project_name,
        client_name: selectedTender.lead_name,
        description: `Source: ${selectedTender.tender_type}`,
        status: 'running',
        tender_id: selectedTender.id,
        file_number: generatedFileNo,
        implementing_officer: implementingOfficer,
        signing_authority: signingAuthority,
        has_beneficiary_list: hasBeneficiaryList,
        beneficiary_list_url: uploadedFileUrl,
        final_quantity: projectQuantity ? parseInt(projectQuantity) : selectedTender.quantity,
        final_project_amount: hasBeneficiaryList && finalProjectAmount ? parseFloat(finalProjectAmount) : selectedTender.tender_amount,
        agreement_signed: agreementSigned,
        advance_amount: advanceAmount ? parseFloat(advanceAmount) : 0,
        contractor_agreement: contractorAgreement,
        remarks: projectRemarks || selectedTender.remarks || null,
      },
    ]);

    setIsUploading(false);

    if (projError) {
      alert(projError.message);
      return;
    }

    // Update Tender status to 'Accepted'
    await supabase.from('tenders').update({ status: 'Accepted' }).eq('id', selectedTender.id);

    // Reset Modal State
    setSelectedTender(null);
    setImplementingOfficer('');
    setSigningAuthority('');
    setHasBeneficiaryList(false);
    setBeneficiaryFile(null);
    setProjectQuantity('');
    setFinalProjectAmount('');
    setAgreementSigned(false);
    setAdvanceAmount('');
    setContractorAgreement('');
    setProjectRemarks('');

    fetchTenders();
    alert(`Project initialized successfully! Generated File Number: ${generatedFileNo}`);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', color: '#0f172a', marginBottom: '1.5rem' }}>
        Tender Management & Project Initiation
      </h1>

      {/* Tender Creation Form */}
      <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#1e293b' }}>Add New Tender Lead</h2>
        <form onSubmit={handleCreateTender} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Lead Name *</label>
            <input required type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Project Name *</label>
            <input required type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Tender Amount ($) *</label>
            <input required type="number" step="0.01" value={tenderAmount} onChange={(e) => setTenderAmount(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Qty *</label>
            <input required type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Tender Closing Date *</label>
            <input required type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Type *</label>
            <select value={tenderType} onChange={(e) => setTenderType(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <option value="E-Tender">E-Tender</option>
              <option value="Open Tender">Open Tender</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Remarks / Notes</label>
            <textarea rows={2} value={tenderRemarks} onChange={(e) => setTenderRemarks(e.target.value)} placeholder="Enter any initial notes or remarks..." style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <button type="submit" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
              Submit Tender Entry
            </button>
          </div>
        </form>
      </div>

      {/* Tender List Registry */}
      <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem' }}>Tenders Registry</h2>
      {loading ? (
        <p>Loading tenders...</p>
      ) : tenders.length === 0 ? (
        <p style={{ color: '#64748b' }}>No tender leads recorded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tenders.map((t) => (
            <div key={t.id} style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t.project_name}</h3>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{t.tender_type}</span>
                </div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                  Lead: <strong>{t.lead_name}</strong> | Amount: <strong>${t.tender_amount}</strong> | Qty: <strong>{t.quantity}</strong> | Closing Date: <strong>{t.closing_date}</strong>
                </p>
                {t.remarks && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                    <strong>Remarks:</strong> {t.remarks}
                  </p>
                )}
              </div>

              <div>
                {t.status === 'Pending' ? (
                  <button onClick={() => openAcceptanceModal(t)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                    Accept & Create Project
                  </button>
                ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: t.status === 'Accepted' ? '#10b981' : '#ef4444' }}>
                    {t.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conditional Project Creation Dialog */}
      {selectedTender && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '600px', borderRadius: '8px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Accept Tender & Create Project</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Project: <strong>{selectedTender.project_name}</strong> (Lead: {selectedTender.lead_name})
            </p>

            <form onSubmit={handleAcceptAndCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Implementing Officer *</label>
                <input required type="text" value={implementingOfficer} onChange={(e) => setImplementingOfficer(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Signing Authority *</label>
                <input required type="text" value={signingAuthority} onChange={(e) => setSigningAuthority(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>

              {/* Has Beneficiary List Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="beneficiary" checked={hasBeneficiaryList} onChange={(e) => setHasBeneficiaryList(e.target.checked)} />
                <label htmlFor="beneficiary" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Has Beneficiary List?</label>
              </div>

              {/* Conditional Section: File Attachment -> Quantity -> Final Amount Confirmation */}
              {hasBeneficiaryList && (
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* 1. Document Attachment */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Attach Beneficiary List Document (PDF / Excel / CSV) *</label>
                    <input required type="file" accept=".pdf,.xlsx,.xls,.csv,.doc,.docx" onChange={(e) => setBeneficiaryFile(e.target.files ? e.target.files[0] : null)} style={{ fontSize: '0.85rem' }} />
                  </div>

                  {/* 2. Quantity Field */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Quantity *</label>
                    <input required type="number" value={projectQuantity} onChange={(e) => setProjectQuantity(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff' }} />
                  </div>

                  {/* 3. Final Amount Confirmation */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Final Project Amount Confirmation ($) *</label>
                    <input required type="number" step="0.01" value={finalProjectAmount} onChange={(e) => setFinalProjectAmount(e.target.value)} placeholder={`Original: $${selectedTender.tender_amount}`} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="agreement" checked={agreementSigned} onChange={(e) => setAgreementSigned(e.target.checked)} />
                <label htmlFor="agreement" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Agreement Signed?</label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Advance Amount ($) *</label>
                <input required type="number" step="0.01" value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Contractor Agreement Details *</label>
                <textarea required rows={3} value={contractorAgreement} onChange={(e) => setContractorAgreement(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Project Remarks</label>
                <textarea rows={2} value={projectRemarks} onChange={(e) => setProjectRemarks(e.target.value)} placeholder="Final execution remarks or notes..." style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setSelectedTender(null)} style={{ backgroundColor: '#cbd5e1', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                  {isUploading ? 'Uploading & Creating...' : 'Initialize Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}