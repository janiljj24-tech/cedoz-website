'use client';

import { useState } from 'react';
import Link from 'next/link';

// Data Types
interface Project {
  id: string;
  title: string;
  description: string;
  status: 'running' | 'completed';
  startDate: string;
  completionDate?: string;
  photoUrl?: string;
  // Private financial details (Only visible on dashboard/admin, NOT public site)
  budget?: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'New' | 'Responded';
}

// Sample Data
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Community Tech & Resource Hub',
    description: 'Setting up modern digital learning labs with internet for local youth.',
    status: 'running',
    startDate: 'March 2026',
    budget: '$15,000',
    photoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p2',
    title: 'Urban Garden Initiative',
    description: 'Transformed unused local plots into vibrant community gardens.',
    status: 'completed',
    startDate: 'January 2026',
    completionDate: 'May 2026',
    budget: '$8,500',
    photoUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p3',
    title: 'Skill Development Workshops',
    description: 'Vocational training and mentorship for career placement.',
    status: 'completed',
    startDate: 'February 2026',
    completionDate: 'June 2026',
    budget: '$12,000',
    photoUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'
  }
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'e1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    subject: 'Volunteering Opportunities',
    message: 'I would like to join as a volunteer for the tech hub project.',
    date: '2026-07-20',
    status: 'New'
  },
  {
    id: 'e2',
    name: 'Anjali Nair',
    email: 'anjali@example.com',
    subject: 'Partnership Proposal',
    message: 'Our organization would like to sponsor the upcoming skill workshops.',
    date: '2026-07-18',
    status: 'Responded'
  }
];

export default function AdminDashboard() {
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [inquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);

  // Active view tab selected by clicking cards ('running' | 'completed' | 'enquiries')
  const [activeTab, setActiveTab] = useState<'running' | 'completed' | 'enquiries'>('running');

  const runningProjects = projects.filter((p) => p.status === 'running');
  const completedProjects = projects.filter((p) => p.status === 'completed');

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

        {/* --- STAT METRIC CARDS (CLICKABLE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Running Projects */}
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
              <span className="text-3xl font-black text-[#0087A1]">{runningProjects.length}</span>
            </div>
            
            <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800/80">
              <span className="text-xs text-[#0087A1] font-semibold">Click to preview</span>
              <Link
                href="/dashboard/projects?status=running"
                className="text-xs font-bold bg-[#0087A1]/20 text-[#0087A1] hover:bg-[#0087A1] hover:text-white px-3 py-1.5 rounded-md transition"
                onClick={(e) => e.stopPropagation()}
              >
                Manage Projects →
              </Link>
            </div>
          </div>

          {/* Card 2: Completed Projects */}
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
              <span className="text-3xl font-black text-[#F26522]">{completedProjects.length}</span>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800/80">
              <span className="text-xs text-[#F26522] font-semibold">Click to preview</span>
              <Link
                href="/dashboard/projects?status=completed"
                className="text-xs font-bold bg-[#F26522]/20 text-[#F26522] hover:bg-[#F26522] hover:text-white px-3 py-1.5 rounded-md transition"
                onClick={(e) => e.stopPropagation()}
              >
                View Portfolio →
              </Link>
            </div>
          </div>

          {/* Card 3: Total Enquiries (Spelling Corrected) */}
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
              <span className="text-3xl font-black text-[#7D299E]">{inquiries.length}</span>
            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800/80">
              <span className="text-xs text-[#7D299E] font-semibold">Click to preview</span>
              <Link
                href="/dashboard/enquiries"
                className="text-xs font-bold bg-[#7D299E]/20 text-[#7D299E] hover:bg-[#7D299E] hover:text-white px-3 py-1.5 rounded-md transition"
                onClick={(e) => e.stopPropagation()}
              >
                Go to Enquiries Page →
              </Link>
            </div>
          </div>

        </div>

        {/* --- DYNAMIC PREVIEW DATA SECTION --- */}
        <div className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-extrabold text-white capitalize flex items-center gap-3">
              {activeTab === 'running' && <span className="w-3 h-3 rounded-full bg-[#0087A1]"></span>}
              {activeTab === 'completed' && <span className="w-3 h-3 rounded-full bg-[#F26522]"></span>}
              {activeTab === 'enquiries' && <span className="w-3 h-3 rounded-full bg-[#7D299E]"></span>}
              {activeTab === 'enquiries' ? 'Total Enquiries' : `${activeTab} Projects`}
            </h2>

            {/* Direct Navigation Button */}
            <Link
              href={activeTab === 'enquiries' ? '/dashboard/enquiries' : `/dashboard/projects?status=${activeTab}`}
              className="text-xs font-extrabold uppercase tracking-wider text-[#0087A1] hover:underline flex items-center gap-1"
            >
              Open Full Page Mode →
            </Link>
          </div>

          {/* 1. RUNNING & COMPLETED PROJECTS LIST */}
          {(activeTab === 'running' || activeTab === 'completed') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(activeTab === 'running' ? runningProjects : completedProjects).map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row">
                  {item.photoUrl && (
                    <img src={item.photoUrl} alt={item.title} className="w-full md:w-36 h-36 object-cover" />
                  )}
                  <div className="p-5 flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400">{item.description}</p>
                    <div className="pt-2 flex justify-between items-center text-xs font-semibold text-slate-300">
                      <span>Budget: <strong className="text-white">{item.budget}</strong></span>
                      <span className="text-slate-500">{item.status === 'completed' ? `Completed: ${item.completionDate}` : `Started: ${item.startDate}`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. TOTAL ENQUIRIES TABLE */}
          {activeTab === 'enquiries' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead className="text-xs uppercase bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Sender Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Date Received</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3 font-semibold text-white">{enquiry.name}</td>
                      <td className="p-3 text-slate-400">{enquiry.email}</td>
                      <td className="p-3 text-slate-200">{enquiry.subject}</td>
                      <td className="p-3 text-slate-400">{enquiry.date}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          enquiry.status === 'New' ? 'bg-[#F26522]/20 text-[#F26522]' : 'bg-[#0087A1]/20 text-[#0087A1]'
                        }`}>
                          {enquiry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}