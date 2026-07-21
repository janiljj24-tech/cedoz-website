import Image from "next/image";
import Link from "next/link";

// Custom Color Hex Codes from CEDOZ Logo:
// Navy:   #0C1B4B
// Teal:   #0087A1
// Purple: #7D299E
// Orange: #F26522
// Light:  #EDF1F7

const ServiceCard = ({ 
  icon, 
  title, 
  description, 
  borderColor 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  borderColor: string; 
}) => (
  <div className={`bg-white p-8 rounded-xl shadow-lg border-b-4 ${borderColor} flex flex-col items-center text-center space-y-4 transform hover:-translate-y-1 transition-transform`}>
    <div className="p-4 rounded-full bg-slate-50 border border-slate-100">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-[#0C1B4B]">{title}</h3>
    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const MetricCard = ({ title, value, change, color }: { title: string; value: string; change: string; color: string }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-2">
      <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">{title}</p>
      <span className={`text-xs font-bold ${color}`}>{change}</span>
    </div>
    <p className="text-3xl font-extrabold text-[#0C1B4B]">{value}</p>
  </div>
);

export default function CedozHomepage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* 1. Header & Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="CEDOZ Logo" 
              width={180} 
              height={50} 
              className="h-12 w-auto" 
              priority
            />
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { name: "HOME", href: "#" },
              { name: "SERVICES", href: "#" },
              { name: "PROJECTS", href: "#" },
              { name: "CONTACT", href: "#" }
            ].map((link, i) => (
              <Link 
                key={i} 
                href={link.href} 
                className={`px-4 py-2 text-sm font-bold rounded-full transition ${i === 0 ? 'bg-slate-100 text-[#0087A1]' : 'text-[#0C1B4B] hover:bg-slate-50'}`}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/donate" 
              className="px-6 py-2.5 text-sm font-bold bg-[#F26522] text-white rounded-full hover:bg-opacity-90 transition shadow-sm ml-4"
            >
              DONATE NOW
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 text-sm font-bold bg-[#0087A1] text-white rounded-full hover:bg-opacity-90 transition shadow-sm ml-2"
            >
              LOGIN
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-white py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#0C1B4B] leading-tight tracking-tight">
              TOGETHER, WE<br />
              <span className="text-[#0087A1]">COLLABORATE</span> &<br />
              <span className="text-[#F26522]">EMPOWER</span>.
            </h1>
            <p className="text-xl text-[#7D299E] font-semibold max-w-lg">
              BUILDING COMMUNITIES, ENABLING SUCCESS.
            </p>
            <button className="px-10 py-4 bg-[#F26522] text-white font-bold rounded-full text-lg hover:bg-opacity-90 transition shadow-lg">
              JOIN OUR MISSION
            </button>
          </div>
          
          <div className="relative flex justify-center items-center opacity-70">
            <div className="absolute inset-0 bg-[#EDF1F7] rounded-full scale-125 blur-xl"></div>
            <Image 
              src="/logo.png" 
              alt="Background Logo" 
              width={600} 
              height={600} 
              className="relative object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* 3. Services Section */}
      <section className="bg-slate-50 py-16 px-6 relative -mt-10 z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <ServiceCard
            borderColor="border-[#0087A1]"
            title="Community Programs"
            description="Programs designed to foster unity and sustainable growth."
            icon={
              <svg className="w-12 h-12 text-[#0087A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            }
          />
          <ServiceCard
            borderColor="border-[#7D299E]"
            title="Skill Development"
            description="Training workshops to empower individuals with practical skills."
            icon={
              <svg className="w-12 h-12 text-[#7D299E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            }
          />
          <ServiceCard
            borderColor="border-[#F26522]"
            title="Resource Center"
            description="Access to essential resources and mentorship opportunities."
            icon={
              <svg className="w-12 h-12 text-[#F26522]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            }
          />
        </div>
      </section>

      {/* 4. Public Data Dashboard Section */}
      <section className="bg-[#EDF1F7] py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <p className="text-xs font-black tracking-widest text-slate-500 uppercase">Live Metrics</p>
            <h2 className="text-4xl font-extrabold text-[#0C1B4B] mt-1">PUBLIC DATA DASHBOARD</h2>
            <div className="w-24 h-1.5 bg-[#F26522] mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MetricCard title="Community Reach" value="4,36K+" change="↑ Monthly" color="text-[#0087A1]" />
            <MetricCard title="Funds Raised" value="$39,010" change="↑ 180%" color="text-[#7D299E]" />
            <MetricCard title="Projects Completed" value="126" change="↑ Trends" color="text-[#F26522]" />
          </div>
        </div>
      </section>

      {/* 5. Testimonial & Projects Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <svg className="w-16 h-16 text-[#0087A1] opacity-60" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            <p className="text-2xl text-[#0C1B4B] font-medium leading-relaxed italic">
              "CEDOZ provided the resources and guidance I needed to start my local empowerment program. Their mentorship program truly changed my life and community."
            </p>
            <p className="text-lg font-bold text-slate-900">— Sarah Thompson, Community Leader</p>
          </div>
          <div className="space-y-6 bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h3 className="text-2xl font-bold text-[#0C1B4B] flex items-center gap-3">
              <svg className="w-7 h-7 text-[#7D299E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              RECENT PROJECTS
            </h3>
            <ul className="space-y-4 text-slate-700 list-disc list-inside">
              <li>Urban Skill Workshop</li>
              <li>Community Garden Initiative</li>
              <li>Resource Center Tech Upgrade</li>
              <li>Mentorship Launchpad</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="bg-slate-50 text-slate-700 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start space-y-4">
             <Image src="/logo.png" alt="CEDOZ Footer Logo" width={180} height={50} className="h-10 w-auto" />
             <p className="text-center md:text-left text-xs text-slate-500">
               Empowering Communities Worldwide. © 2026 CEDOZ. All Rights Reserved.
             </p>
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-[#0C1B4B] uppercase tracking-wider text-xs">Quick Links</h5>
            {["Home", "Services", "Projects", "Donate", "Login"].map(link => <Link key={link} href="#" className="block hover:text-[#0087A1]">{link}</Link>)}
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-[#0C1B4B] uppercase tracking-wider text-xs">Contact Us</h5>
            <p>1 Main St, San Francisco, CA</p>
            <p>contact@cedoz.org</p>
            <p>(555) 123-4567</p>
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-[#0C1B4B] uppercase tracking-wider text-xs">Follow Us</h5>
            {["Facebook", "Twitter", "Instagram", "LinkedIn"].map(link => <Link key={link} href="#" className="block hover:text-[#0087A1]">{link}</Link>)}
          </div>
        </div>
      </footer>

    </div>
  );
}