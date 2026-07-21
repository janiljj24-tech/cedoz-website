import Link from 'next/link';

export default function CedozHomepage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-[#0087A1] selection:text-white">
      
      {/* 1. Professional Dark Header */}
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
            <Link 
              href="#services" 
              className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition"
            >
              SERVICES
            </Link>
            <Link 
              href="#projects" 
              className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition"
            >
              PROJECTS
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 text-sm font-bold text-white rounded-full bg-[#0087A1] hover:bg-[#00738a] shadow-md hover:shadow-cyan-500/20 transition ml-4"
            >
              LOGIN
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. Hero Section with Gradient Accent */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 py-24 px-6 border-b border-slate-800/60">
        {/* Subtle Background Glow Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0087A1]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#7D299E]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-[#0087A1] uppercase tracking-wider">
              Community Empowerment Portal
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
              TOGETHER, WE<br />
              <span className="text-[#0087A1]">COLLABORATE</span> &<br />
              <span className="text-[#F26522]">EMPOWER</span>.
            </h1>
            <p className="text-lg font-medium text-slate-300 max-w-lg">
              Building sustainable communities and enabling corporate & social success through targeted initiative programs.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <button className="px-8 py-3.5 bg-[#F26522] hover:bg-[#d95516] text-white font-bold rounded-full text-base shadow-lg shadow-orange-500/10 transition transform active:scale-95">
                JOIN OUR MISSION
              </button>
            </div>
          </div>
          
          <div className="flex justify-center items-center">
            <div className="relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-2xl">
              <img 
                src="/logo.png" 
                alt="CEDOZ Main Banner" 
                className="max-h-96 w-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Services Section with Glassmorphism Cards */}
      <section id="services" className="bg-slate-950 py-20 px-6 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-extrabold text-[#0087A1] tracking-widest uppercase">Core Initiatives</h2>
            <p className="text-3xl font-bold text-white">What We Drive Forward</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/80 p-8 rounded-2xl shadow-xl border border-slate-800 border-t-4 border-t-[#0087A1] hover:border-slate-700 transition">
              <h3 className="text-xl font-bold text-white mb-2">Community Programs</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Fostering localized unity, resources, and sustainable development initiatives.</p>
            </div>

            <div className="bg-slate-900/80 p-8 rounded-2xl shadow-xl border border-slate-800 border-t-4 border-t-[#7D299E] hover:border-slate-700 transition">
              <h3 className="text-xl font-bold text-white mb-2">Skill Development</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Empowering individuals through practical technical workshops and mentorship.</p>
            </div>

            <div className="bg-slate-900/80 p-8 rounded-2xl shadow-xl border border-slate-800 border-t-4 border-t-[#F26522] hover:border-slate-700 transition">
              <h3 className="text-xl font-bold text-white mb-2">Resource Center</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Providing streamlined access to essential business and community assets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Executive Dashboard Section */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">PUBLIC DATA DASHBOARD</h2>
            <p className="text-sm text-slate-400">Real-time metrics and measurable impact</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-slate-850/60 rounded-2xl border border-slate-800 shadow-md">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Community Reach</p>
              <p className="text-4xl font-black text-[#0087A1] mt-3">4.36K+</p>
            </div>
            <div className="p-8 bg-slate-850/60 rounded-2xl border border-slate-800 shadow-md">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Funds Raised</p>
              <p className="text-4xl font-black text-[#7D299E] mt-3">$39,010</p>
            </div>
            <div className="p-8 bg-slate-850/60 rounded-2xl border border-slate-800 shadow-md">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projects Completed</p>
              <p className="text-4xl font-black text-[#F26522] mt-3">126</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Minimalist Dark Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 px-6 text-center text-sm text-slate-500">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="CEDOZ Footer Logo" className="h-8 w-auto opacity-80" />
        </div>
        <p>© 2026 CEDOZ — Community Empowerment & Development Organization. All Rights Reserved.</p>
      </footer>

    </div>
  );
}