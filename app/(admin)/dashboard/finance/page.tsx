'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ProjectFinance {
  id: string;
  project_name: string;
  tender_amount: number;
  final_amount: number;
  contractor_settlement: number;
  project_expenses: number;
}

interface OfficeExpense {
  id: string;
  title: string;
  category: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  receipt_url?: string;
}

interface OtherExpense {
  id: string;
  title: string;
  category: string;
  amount: number;
  spent_by: string;
  expense_date: string;
  description: string;
  receipt_url?: string;
}

function FinanceModuleContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'project'; // 'project', 'office', 'other'

  const [projectFinances, setProjectFinances] = useState<ProjectFinance[]>([]);
  const [officeExpenses, setOfficeExpenses] = useState<OfficeExpense[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form States
  const [activeModal, setActiveModal] = useState<'view_project' | 'add_office' | 'add_other' | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectFinance | null>(null);

  // Form Inputs
  const [officeForm, setOfficeForm] = useState({ title: '', category: 'Rent', amount: '', payment_date: '', payment_method: 'Bank Transfer' });
  const [otherForm, setOtherForm] = useState({ title: '', category: 'Miscellaneous', amount: '', spent_by: '', expense_date: '', description: '' });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    if (tab === 'project') {
      const { data } = await supabase.from('project_finances').select('*').order('created_at', { ascending: false });
      setProjectFinances(data || []);
    } else if (tab === 'office') {
      const { data } = await supabase.from('office_expenses').select('*').order('created_at', { ascending: false });
      setOfficeExpenses(data || []);
    } else if (tab === 'other') {
      const { data } = await supabase.from('other_expenses').select('*').order('created_at', { ascending: false });
      setOtherExpenses(data || []);
    }
    setLoading(false);
  };

  const handleAddOfficeExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('office_expenses').insert([{ ...officeForm, amount: parseFloat(officeForm.amount) }]);
    if (error) alert('Error: ' + error.message);
    else {
      setActiveModal(null);
      setOfficeForm({ title: '', category: 'Rent', amount: '', payment_date: '', payment_method: 'Bank Transfer' });
      fetchData();
    }
  };

  const handleAddOtherExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('other_expenses').insert([{ ...otherForm, amount: parseFloat(otherForm.amount) }]);
    if (error) alert('Error: ' + error.message);
    else {
      setActiveModal(null);
      setOtherForm({ title: '', category: 'Miscellaneous', amount: '', spent_by: '', expense_date: '', description: '' });
      fetchData();
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            {tab === 'project' && 'Project Finance'}
            {tab === 'office' && 'Office Expenses'}
            {tab === 'other' && 'Other Expenses'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {tab === 'project' && 'Track project tender amounts, final settlements, contractor payouts, and project expenses.'}
            {tab === 'office' && 'Monitor recurring operational expenses, rent, utilities, and office supplies.'}
            {tab === 'other' && 'Record miscellaneous, travel, and ad-hoc corporate expenditure.'}
          </p>
        </div>

        {tab === 'office' && (
          <button onClick={() => setActiveModal('add_office')} className="px-5 py-2.5 bg-[#0087A1] hover:bg-[#00738a] text-white font-bold rounded-lg text-sm shadow-md transition">
            + Log Office Expense
          </button>
        )}

        {tab === 'other' && (
          <button onClick={() => setActiveModal('add_other')} className="px-5 py-2.5 bg-[#F26522] hover:bg-[#d95516] text-white font-bold rounded-lg text-sm shadow-md transition">
            + Log Other Expense
          </button>
        )}
      </div>

      {/* --- TAB 1: PROJECT FINANCE --- */}
      {tab === 'project' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Project Financial Overview</h2>
            <span className="text-xs text-slate-400">Total: {projectFinances.length} Projects</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading records...</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Project Name</th>
                    <th className="p-4">Tender Amount</th>
                    <th className="p-4">Final Amount</th>
                    <th className="p-4">Expenses</th>
                    <th className="p-4">Profit/Margin</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {projectFinances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">No project financial records found.</td>
                    </tr>
                  ) : (
                    projectFinances.map((proj) => {
                      const netProfit = proj.final_amount - (proj.contractor_settlement + proj.project_expenses);
                      return (
                        <tr key={proj.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-4 font-bold text-white">{proj.project_name}</td>
                          <td className="p-4">₹{proj.tender_amount.toLocaleString()}</td>
                          <td className="p-4 text-emerald-400 font-semibold">₹{proj.final_amount.toLocaleString()}</td>
                          <td className="p-4 text-rose-400">₹{(proj.contractor_settlement + proj.project_expenses).toLocaleString()}</td>
                          <td className={`p-4 font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ₹{netProfit.toLocaleString()}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => { setSelectedProject(proj); setActiveModal('view_project'); }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-md border border-slate-700 transition"
                            >
                              👁 Open Financial Breakdown
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: OFFICE EXPENSES --- */}
      {tab === 'office' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Office Expense Logs</h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading records...</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Expense Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment Date</th>
                    <th className="p-4">Payment Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {officeExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">No office expenses recorded yet.</td>
                    </tr>
                  ) : (
                    officeExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-4 font-bold text-white">{exp.title}</td>
                        <td className="p-4"><span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-sky-400 font-bold">{exp.category}</span></td>
                        <td className="p-4 font-bold text-rose-400">₹{exp.amount.toLocaleString()}</td>
                        <td className="p-4">{exp.payment_date}</td>
                        <td className="p-4 text-slate-400">{exp.payment_method}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: OTHER EXPENSES --- */}
      {tab === 'other' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Ad-hoc & Other Expense Logs</h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading records...</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Title & Description</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Spent By</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {otherExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">No ad-hoc expenses recorded yet.</td>
                    </tr>
                  ) : (
                    otherExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-4">
                          <p className="font-bold text-white">{exp.title}</p>
                          <p className="text-xs text-slate-400">{exp.description || 'N/A'}</p>
                        </td>
                        <td className="p-4"><span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-amber-400 font-bold">{exp.category}</span></td>
                        <td className="p-4 text-slate-300">{exp.spent_by || 'N/A'}</td>
                        <td className="p-4 font-bold text-rose-400">₹{exp.amount.toLocaleString()}</td>
                        <td className="p-4">{exp.expense_date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 1: VIEW PROJECT FINANCIAL BREAKDOWN --- */}
      {activeModal === 'view_project' && selectedProject && (
        <Modal title={`Financial Breakdown — ${selectedProject.project_name}`} onClose={() => setActiveModal(null)}>
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-semibold">Tender Amount</span>
                <span className="text-white font-bold text-sm">₹{selectedProject.tender_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-semibold">Final Agreed Amount</span>
                <span className="text-emerald-400 font-bold text-sm">₹{selectedProject.final_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-semibold">Contractors Settlement</span>
                <span className="text-rose-400 font-bold text-sm">₹{selectedProject.contractor_settlement.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-semibold">Project Expenses</span>
                <span className="text-rose-400 font-bold text-sm">₹{selectedProject.project_expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white font-extrabold">Net Calculated Profit</span>
                <span className="text-emerald-400 font-extrabold text-base">
                  ₹{(selectedProject.final_amount - (selectedProject.contractor_settlement + selectedProject.project_expenses)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 2: ADD OFFICE EXPENSE --- */}
      {activeModal === 'add_office' && (
        <Modal title="Log Office Expense" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddOfficeExpense} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-bold">Expense Title</label>
              <input type="text" required placeholder="e.g. Office Rent August" className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={officeForm.title} onChange={(e) => setOfficeForm({ ...officeForm, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-bold">Category</label>
                <select className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={officeForm.category} onChange={(e) => setOfficeForm({ ...officeForm, category: e.target.value })}>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities (Power/Water)</option>
                  <option value="Salaries">Staff Salaries</option>
                  <option value="Supplies">Office Supplies</option>
                  <option value="Software">Software & Subscriptions</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 font-bold">Amount (₹)</label>
                <input type="number" required placeholder="5000" className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={officeForm.amount} onChange={(e) => setOfficeForm({ ...officeForm, amount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-bold">Payment Date</label>
                <input type="date" required className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={officeForm.payment_date} onChange={(e) => setOfficeForm({ ...officeForm, payment_date: e.target.value })} />
              </div>
              <div>
                <label className="text-slate-400 font-bold">Payment Method</label>
                <select className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={officeForm.payment_method} onChange={(e) => setOfficeForm({ ...officeForm, payment_method: e.target.value })}>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI / GPay</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-[#0087A1] font-bold text-white rounded-lg transition mt-2">
              Save Expense
            </button>
          </form>
        </Modal>
      )}

      {/* --- MODAL 3: ADD OTHER EXPENSE --- */}
      {activeModal === 'add_other' && (
        <Modal title="Log Ad-hoc / Other Expense" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleAddOtherExpense} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-bold">Title</label>
              <input type="text" required placeholder="e.g. Client Travel Allowance" className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={otherForm.title} onChange={(e) => setOtherForm({ ...otherForm, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-bold">Category</label>
                <select className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={otherForm.category} onChange={(e) => setOtherForm({ ...otherForm, category: e.target.value })}>
                  <option value="Travel">Travel & Food</option>
                  <option value="Legal">Legal & Regulatory</option>
                  <option value="Marketing">Marketing & Ads</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 font-bold">Amount (₹)</label>
                <input type="number" required placeholder="1200" className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={otherForm.amount} onChange={(e) => setOtherForm({ ...otherForm, amount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-bold">Spent By (Person)</label>
                <input type="text" placeholder="e.g. John Doe" className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={otherForm.spent_by} onChange={(e) => setOtherForm({ ...otherForm, spent_by: e.target.value })} />
              </div>
              <div>
                <label className="text-slate-400 font-bold">Expense Date</label>
                <input type="date" required className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={otherForm.expense_date} onChange={(e) => setOtherForm({ ...otherForm, expense_date: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-slate-400 font-bold">Description / Notes</label>
              <textarea rows={2} placeholder="Optional notes..." className="w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" value={otherForm.description} onChange={(e) => setOtherForm({ ...otherForm, description: e.target.value })} />
            </div>
            <button type="submit" className="w-full py-3 bg-[#F26522] font-bold text-white rounded-lg transition mt-2">
              Save Expense
            </button>
          </form>
        </Modal>
      )}

    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Finance Module...</div>}>
      <FinanceModuleContent />
    </Suspense>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
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