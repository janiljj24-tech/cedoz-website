'use client';

import { useState } from 'react';
import Link from 'next/link';

// Sample Completed Projects Data (Replace this with your API/Supabase fetch)
interface CompletedProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  completedDate: string;
}

const COMPLETED_PROJECTS: CompletedProject[] = [
  {
    id: '1',
    title: 'Community Tech & Resource Hub',
    description: 'Successfully established a modern digital learning lab equipped with computers and high-speed internet to empower local youth.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    completedDate: 'June 2026'
  },
  {
    id: '2',
    title: 'Urban Garden Initiative',
    description: 'Transformed unused local plots into vibrant community gardens providing fresh produce and sustainability workshops.',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    completedDate: 'May 2026'
  },
  {
    id: '3',
    title: 'Skill Development & Career Workshop',
    description: 'Conducted a 6-week intensive mentorship program focused on vocational skill building and career placement assistance.',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    completedDate: 'April 2026'
  }
];

export default function CedozHomepage() {
  const [projects] = useState<CompletedProject[]>(COMPLETED_PROJECTS);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-[#0087A1] selection:text-white">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="CEDOZ Logo" 
              className="h-12 w-auto object-contain brightness-110 drop-shadow"
            />
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-bold rounded-full bg-slate-800 text-[#0087A1] border border-slate-700 hover:bg-slate-750 transition"
            >
              HOME
            </Link>
            <a 
              href="#services" 
              className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition"
            >
              SERVICES
            </a>
            <a 
              href="#projects" 
              className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition"
            >
              PROJECTS
            </a>
            <Link 
              href="/login" 
              className="px-6 py-2.5 text-sm font-bold text-white rounded-full bg-[#0087A1] hover:bg-[#00738a] shadow-md transition ml-4"
            >
              LOGIN
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 py-20 px-6 border-b border-slate-800/60">
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
              TOGETHER, WE<br />
              <span className="text-[#0087A1]">COLLABORATE</span> &<br />
              <span className="text-[#F26522]">EMPOWER</span>.
            </h1>
            <p className="text-lg font-medium text-slate-300 max-w-lg">
              Building sustainable communities and enabling corporate & social success through targeted initiative programs.
            </p>
            <a 
              href="#projects" 
              className="inline-block px-8 py-3.5 bg-[#F26522] hover:bg-[#d95516] text-white font-bold rounded-full text-base shadow-lg transition"
            >
              VIEW COMPLETED PROJECTS
            </a>
          </div>
          
          <div className="flex justify-center items-center">
            <div className="relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-2xl">
              <img 
                src="/logo.png" 
                alt="CEDOZ Main Banner" 
                className="max-h-80 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Completed Projects Section (Triggered by 'PROJECTS' in menu) */}
      <section id="projects" className="py-20 px-6 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-xs font-extrabold text-[#F26522] tracking-widest uppercase">Our Impact</h2>
            <p className="text-3xl font-bold text-white">Completed Projects</p>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Explore the initiatives we have successfully delivered to transform and empower local communities.
            </p>
          </div>

          {/* Completed Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl hover:border-slate-700 transition flex flex-col"
              >
                {/* Project Image */}
                <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 right-3 bg-[#0087A1] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Completed {project.completedDate}
                  </span>
                </div>

                {/* Project Details (NO FINANCIAL DATA SHOWN) */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#7D299E] uppercase tracking-wider">
                      Community Impact
                    </span>
                    <span className="text-xs text-slate-500">Verified Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Public Metrics (NO Financial Details) */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">COMMUNITY DASHBOARD</h2>
            <p className="text-sm text-slate-400">Public statistics and completed outcomes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-8 bg-slate-850/60 rounded-2xl border border-slate-800 shadow-md">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Community Reach</p>
              <p className="text-4xl font-black text-[#0087A1] mt-3">4.36K+</p>
            </div>
            <div className="p-8 bg-slate-850/60 rounded-2xl border border-slate-800 shadow-md">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Projects</p>
              <p className="text-4xl font-black text-[#F26522] mt-3">{projects.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 px-6 text-center text-sm text-slate-500">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="CEDOZ Footer Logo" className="h-8 w-auto opacity-80" />
        </div>
        <p>© 2026 CEDOZ — Community Empowerment & Development Organization. All Rights Reserved.</p>
      </footer>

    </div>
  );
}