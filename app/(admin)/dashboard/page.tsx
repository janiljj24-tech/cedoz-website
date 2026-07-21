'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Project {
  id: string | number;
  title?: string;
  name?: string;
  description?: string;
  status: string;
  client_name?: string;
  lead_name?: string;
  created_at?: string;
  final_project_amount?: number;
}

interface Inquiry {
  id: string | number;
  name: string;
  email: string;
  subject: string;
  message?: string;
  created_at?: string;
  status?: string;
}

export default function AdminDashboard() {
  const [runningProjects, setRunningProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'running' | 'completed' | 'enquiries'>('running');

  const fetchDashboardData = async () => {
    setLoading(true);

    // 1. Fetch Running Projects
    const { data: runningData, error: runErr } = await supabase
      .from('projects')
      .select('*')
      .in('status', ['running', 'RUNNING', 'in_progress', 'active'])
      .order('created_at', { ascending: false });

    if (runErr) console.error('Running Projects Fetch Error:', runErr.message);

    // 2. Fetch Completed Projects
    const { data: completedData, error: compErr } = await supabase
      .from('projects')
      .select('*')
      .in('status', ['completed', 'COMPLETED'])
      .order('created_at', { ascending: false });

    if (compErr) console.error('Completed Projects Fetch Error:', compErr.message);

    // 3. Fetch Enquiries
    const { data: leadsData, error: leadsErr } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsErr) console.error('Leads Fetch Error:', leadsErr.message);

    if (runningData) setRunningProjects(runningData as Project[]);
    if (completedData) setCompletedProjects(completedData as Project[]);
    if (leadsData) setInquiries(leadsData as Inquiry[]);

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getFullPageLink = (tab: 'running' | 'completed' | 'enquiries') => {
    if (tab === 'running') return '/dashboard/projects/running';
    if (tab === 'completed') return '/dashboard/projects/completed';
    return '/dashboard/leads';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Click any card below to view data or navigate to dedicated management pages.
            </p>
          </div>
          <Link
            href="/"
            className="self-start md:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-bold transition"
          >
            ← View Public Site
          </Link>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Running Projects */}
          <div
            onClick={() => setActiveTab('running')}
            className={`p-6 rounded-2xl border cursor-pointer transition transform hover:-translate-y-1 shadow-lg relative ${
              activeTab === 'running'
                ? 'bg-slate-800 border-[#0087A1] ring-2 ring-[#0087A1]/50'
                : 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</p>
                <h3 className="text-xl font-extrabold text-white mt-1">Running Projects</h3>
              </div>
              <span className="text-3xl font-black text-[#0087A1]">
                {loading ? '...' : runningProjects.length}
              </span>
            </div>
            
            <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800/80">
              <span className="text-xs text-[#0087A1] font-semibold">Click to preview</span>
              <Link
                href="/dashboard/projects/running"
                className="text-xs font-bold bg-[#0087A1]/20 text-[#0087A1] hover:bg-[#0087A1] hover:text-white px-3 py-1.5 rounded-md transition"
                onClick={(e) => e.stopPropagation()}
              >
                Manage Projects →
              </Link>
            </div>
          </div>

          {/* Completed Projects */}
          <div
            onClick={() => setActiveTab('completed')}
            className={`p-6 rounded-2xl border cursor-pointer transition transform hover:-translate-y-1 shadow-lg relative ${
              activeTab === 'completed'
                ? 'bg-slate-800 border-[#F26522] ring-2 ring-[#F26522]/50'
                : 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Archive</p>
                <h3 className="text-xl font-extrabold text-white mt-1">Completed Projects</h3>
              </div>
              <span className="text-3xl font-black text-[#F26522]">
                {loading ? '...' : completedProjects.length}
              </span>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800/80">
              <span className="text-xs text-[#F26522] font-semibold">Click to preview</span>
              <Link
                href="/dashboard/projects/completed"
                className="text-xs font-bold bg-[#F26522]/20 text-[#F26522] hover:bg-[#F26522] hover:text-white px-3 py-1.5 rounded-md transition"
                onClick={(e) => e.stopPropagation()}
              >
                View Portfolio →
              </Link>
            </div>
          </div>

          {/* Total Enquiries */}
          <div
            onClick={() => setActiveTab('enquiries')}
            className={`p-6 rounded-2xl border cursor-pointer transition transform hover:-translate-y-1 shadow-lg relative ${
              activeTab === 'enquiries'
                ? 'bg-slate-800 border-[#7D299E] ring-2 ring-[#7D299E]/50'
                : 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Public Messages</p>
                <h3 className="text-xl font-extrabold text-white mt-1">Total Enquiries</h3>
              </div>
              <span className="text-3xl font-black text-[#7D299E]">
                {loading ? '...' : inquiries.length}
              </span>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800/80">
              <span className="text-xs text-[#7D299E] font-semibold">Click to preview</span>
              <Link
                href="/dashboard/leads"
                className="text-xs font-bold bg-[#7D299E]/20 text-[#7D299E] hover:bg-[#7D299E] hover:text-white px-3 py-1.5 rounded-md transition"
                onClick={(e) => e.stopPropagation()}
              >
                Go to Enquiries Page →
              </Link>
            </div>
          </div>

        </div>

        {/* PREVIEW SECTION */}
        <div className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-extrabold text-white capitalize flex items-center gap-3">
              {activeTab === 'running' && <span className="w-3 h-3 rounded-full bg-[#0087A1]"></span>}
              {activeTab === 'completed' && <span className="w-3 h-3 rounded-full bg-[#F26522]"></span>}
              {activeTab === 'enquiries' && <span className="w-3 h-3 rounded-full bg-[#7D299E]"></span>}
              {activeTab === 'enquiries' ? 'Total Enquiries' : `${activeTab} Projects`}
            </h2>

            <Link
              href={getFullPageLink(activeTab)}
              className="text-xs font-extrabold uppercase tracking-wider text-[#0087A1] hover:underline flex items-center gap-1"
            >
              Open Full Page Mode →
            </Link>
          </div>

          {/* PROJECTS PREVIEW */}
          {(activeTab === 'running' || activeTab === 'completed') && (
            loading ? (
              <p className="text-sm text-slate-500 p-4">Loading preview data...</p>
            ) : (activeTab === 'running' ? runningProjects : completedProjects).length === 0 ? (
              <p className="text-sm text-slate-500 p-4">No {activeTab} projects found in database.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(activeTab === 'running' ? runningProjects : completedProjects).map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md p-5 space-y-2">
                    <h3 className="text-lg font-bold text-white">{item.title || item.name}</h3>
                    <p className="text-xs text-slate-400">Client / Lead: <strong className="text-slate-200">{item.client_name || item.lead_name || 'N/A'}</strong></p>
                    {item.description && <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>}
                    <div className="pt-2 flex justify-between items-center text-xs font-semibold text-slate-400">
                      <span>Amount: <strong className="text-emerald-400">{item.final_project_amount ? `₹${item.final_project_amount}` : 'N/A'}</strong></span>
                      <span className="text-slate-500">Status: {item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ENQUIRIES PREVIEW */}
          {activeTab === 'enquiries' && (
            loading ? (
              <p className="text-sm text-slate-500 p-4">Loading enquiries...</p>
            ) : inquiries.length === 0 ? (
              <p className="text-sm text-slate-500 p-4">No public enquiries received yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300 border-collapse">
                  <thead className="text-xs uppercase bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Sender Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {inquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-3 font-semibold text-white">{enquiry.name}</td>
                        <td className="p-3 text-slate-400">{enquiry.email}</td>
                        <td className="p-3 text-slate-200">{enquiry.subject}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#7D299E]/20 text-[#7D299E]">
                            {enquiry.status || 'Received'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}