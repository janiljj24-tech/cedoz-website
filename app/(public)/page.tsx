import Link from 'next/link';

export default function CedozHomepage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Image */}
            <img 
              src="/logo.png" 
              alt="CEDOZ Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-bold rounded-full bg-slate-100 text-[#0087A1]"
            >
              HOME
            </Link>
            <Link 
              href="#services" 
              className="px-4 py-2 text-sm font-bold text-[#0C1B4B] hover:bg-slate-50 rounded-full"
            >
              SERVICES
            </Link>
            <Link 
              href="#projects" 
              className="px-4 py-2 text-sm font-bold text-[#0C1B4B] hover:bg-slate-50 rounded-full"
            >
              PROJECTS
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 text-sm font-bold text-white rounded-full bg-[#0087A1] hover:opacity-90 ml-4"
            >
              LOGIN
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. Hero Section with Brand Colors */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0C1B4B] leading-tight">
              TOGETHER, WE<br />
              <span className="text-[#0087A1]">COLLABORATE</span> &<br />
              <span className="text-[#F26522]">EMPOWER</span>.
            </h1>
            <p className="text-xl font-semibold text-[#7D299E]">
              BUILDING COMMUNITIES, ENABLING SUCCESS.
            </p>
            <button className="px-8 py-3.5 bg-[#F26522] text-white font-bold rounded-full text-lg shadow-md hover:opacity-90">
              JOIN OUR MISSION
            </button>
          </div>
          
          <div className="flex justify-center items-center">
            <img 
              src="/logo.png" 
              alt="CEDOZ Main Banner" 
              className="max-h-96 w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* 3. Cards Section */}
      <section id="services" className="bg-[#EDF1F7] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-xl shadow-md border-b-4 border-[#0087A1] text-center space-y-3">
            <h3 className="text-xl font-bold text-[#0C1B4B]">Community Programs</h3>
            <p className="text-sm text-slate-600">Fostering community growth and sustainable development programs.</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border-b-4 border-[#7D299E] text-center space-y-3">
            <h3 className="text-xl font-bold text-[#0C1B4B]">Skill Development</h3>
            <p className="text-sm text-slate-600">Empowering individuals through practical workshops and education.</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border-b-4 border-[#F26522] text-center space-y-3">
            <h3 className="text-xl font-bold text-[#0C1B4B]">Resource Center</h3>
            <p className="text-sm text-slate-600">Providing access to essential community resources and guidance.</p>
          </div>

        </div>
      </section>

      {/* 4. Dashboard Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-extrabold text-[#0C1B4B]">PUBLIC DATA DASHBOARD</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-500">COMMUNITY REACH</p>
              <p className="text-3xl font-extrabold text-[#0087A1] mt-2">4,36K+</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-500">FUNDS RAISED</p>
              <p className="text-3xl font-extrabold text-[#7D299E] mt-2">$39,010</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-semibold text-slate-500">PROJECTS COMPLETED</p>
              <p className="text-3xl font-extrabold text-[#F26522] mt-2">126</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-6 text-center text-sm text-slate-500">
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="CEDOZ Footer Logo" className="h-8 w-auto" />
        </div>
        <p>© 2026 CEDOZ - Community Empowerment & Development Organization. All Rights Reserved.</p>
      </footer>

    </div>
  );
}