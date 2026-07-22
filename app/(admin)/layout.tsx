'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Recommendation: Move client creation to a dedicated lib file (e.g., utils/supabase/client.ts)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isEmployeeMenuOpen, setIsEmployeeMenuOpen] = useState(false);
  const [isFinanceMenuOpen, setIsFinanceMenuOpen] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Helper to dynamically check active links
  const isActiveLink = (path: string, paramKey?: string, paramVal?: string) => {
    if (pathname !== path) return false;
    if (paramKey && paramVal) {
      return searchParams.get(paramKey) === paramVal;
    }
    return true;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = (setter: React.Dispatch<React.SetStateAction<boolean>>, currentVal: boolean) => {
    if (!isSidebarHovered) {
      setIsSidebarHovered(true);
      setter(true);
    } else {
      setter(!currentVal);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Dynamic Hover-Expanding Left Sidebar */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        style={{ 
          width: isSidebarHovered ? '260px' : '70px', 
          backgroundColor: '#0f172a', 
          color: '#ffffff', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: isSidebarHovered ? '1.5rem' : '1.5rem 0.75rem', 
          flexShrink: 0,
          transition: 'width 0.2s ease-in-out, padding 0.2s ease-in-out',
          overflowX: 'hidden'
        }}
      >
        {/* Brand / Logo Area */}
        <div style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          letterSpacing: '1px', 
          marginBottom: '2rem', 
          color: '#38bdf8',
          whiteSpace: 'nowrap',
          textAlign: isSidebarHovered ? 'left' : 'center'
        }}>
          {isSidebarHovered ? 'CEDOZ Admin' : 'C'}
        </div>
        
        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          
          {/* Dashboard */}
          <Link 
            href="/dashboard" 
            style={{ 
              color: '#ffffff', 
              textDecoration: 'none', 
              padding: '0.75rem 1rem', 
              borderRadius: '6px', 
              backgroundColor: isActiveLink('/dashboard') ? '#1e293b' : 'transparent', 
              fontWeight: 500, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem' 
            }}
          >
            <span style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', width: '16px', height: '16px', flexShrink: 0 }}>
              <span style={{ backgroundColor: 'currentColor', borderRadius: '1px' }}></span>
              <span style={{ backgroundColor: 'currentColor', borderRadius: '1px' }}></span>
              <span style={{ backgroundColor: 'currentColor', borderRadius: '1px' }}></span>
              <span style={{ backgroundColor: 'currentColor', borderRadius: '1px' }}></span>
            </span>
            {isSidebarHovered && <span style={{ whiteSpace: 'nowrap' }}>Dashboard</span>}
          </Link>

          {/* Edit Homepage */}
          <Link 
            href="/dashboard/home-editor" 
            style={{ 
              color: '#ffffff', 
              textDecoration: 'none', 
              padding: '0.75rem 1rem', 
              borderRadius: '6px', 
              backgroundColor: isActiveLink('/dashboard/home-editor') ? '#1e293b' : 'transparent', 
              fontWeight: 500, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem' 
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🌐</span>
            {isSidebarHovered && <span style={{ whiteSpace: 'nowrap' }}>Edit Homepage</span>}
          </Link>

          {/* Finance Collapsible Parent */}
          <div>
            <div 
              onClick={() => toggleMenu(setIsFinanceMenuOpen, isFinanceMenuOpen)}
              style={{ color: '#94a3b8', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: isSidebarHovered ? 'space-between' : 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>💰</span>
                {isSidebarHovered && <span style={{ fontWeight: 500, color: '#ffffff', whiteSpace: 'nowrap' }}>Finance</span>}
              </div>
              {isSidebarHovered && <span>{isFinanceMenuOpen ? '▼' : '►'}</span>}
            </div>

            {/* Finance Submenu Group */}
            {isFinanceMenuOpen && isSidebarHovered && (
              <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                <Link href="/dashboard/finance?tab=project" style={{ color: isActiveLink('/dashboard/finance', 'tab', 'project') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  📊 Project Finance
                </Link>
                <Link href="/dashboard/finance?tab=office" style={{ color: isActiveLink('/dashboard/finance', 'tab', 'office') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  🏢 Office Expenses
                </Link>
                <Link href="/dashboard/finance?tab=other" style={{ color: isActiveLink('/dashboard/finance', 'tab', 'other') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  💸 Other Expenses
                </Link>
              </div>
            )}
          </div>

          {/* Employee Management Collapsible Parent */}
          <div>
            <div 
              onClick={() => toggleMenu(setIsEmployeeMenuOpen, isEmployeeMenuOpen)}
              style={{ color: '#94a3b8', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: isSidebarHovered ? 'space-between' : 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>👔</span>
                {isSidebarHovered && <span style={{ fontWeight: 500, color: '#ffffff', whiteSpace: 'nowrap' }}>Employees</span>}
              </div>
              {isSidebarHovered && <span>{isEmployeeMenuOpen ? '▼' : '►'}</span>}
            </div>

            {/* Employee Submenu Group */}
            {isEmployeeMenuOpen && isSidebarHovered && (
              <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                <Link href="/dashboard/employees?filter=new" style={{ color: isActiveLink('/dashboard/employees', 'filter', 'new') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  👥 Candidate List
                </Link>
                <Link href="/dashboard/employees?filter=interviewing" style={{ color: isActiveLink('/dashboard/employees', 'filter', 'interviewing') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  📝 Interviews
                </Link>
                <Link href="/dashboard/employees?filter=offers" style={{ color: isActiveLink('/dashboard/employees', 'filter', 'offers') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  ✉️ Offer Letters
                </Link>
                <Link href="/dashboard/employees?filter=onboarding" style={{ color: isActiveLink('/dashboard/employees', 'filter', 'onboarding') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  📑 Onboarding
                </Link>
                <Link href="/dashboard/employees?filter=staff" style={{ color: isActiveLink('/dashboard/employees', 'filter', 'staff') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  🏢 Staff Members
                </Link>
              </div>
            )}
          </div>

          {/* Projects Collapsible Parent */}
          <div>
            <div 
              onClick={() => toggleMenu(setIsProjectMenuOpen, isProjectMenuOpen)}
              style={{ color: '#94a3b8', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: isSidebarHovered ? 'space-between' : 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderRadius: '2px', display: 'inline-block', flexShrink: 0, marginLeft: '1px' }}></span>
                {isSidebarHovered && <span style={{ fontWeight: 500, color: '#ffffff', whiteSpace: 'nowrap' }}>Projects</span>}
              </div>
              {isSidebarHovered && <span>{isProjectMenuOpen ? '▼' : '►'}</span>}
            </div>

            {/* Submenu Group */}
            {isProjectMenuOpen && isSidebarHovered && (
              <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                <Link href="/dashboard/tenders" style={{ color: isActiveLink('/dashboard/tenders') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  📑 Tenders & Conversion
                </Link>
                <Link href="/dashboard/projects/create" style={{ color: isActiveLink('/dashboard/projects/create') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  + Create Project
                </Link>
                <Link href="/dashboard/projects/running" style={{ color: isActiveLink('/dashboard/projects/running') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  ⏳ Running Projects
                </Link>
                <Link href="/dashboard/projects/completed" style={{ color: isActiveLink('/dashboard/projects/completed') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  ✅ Completed Projects
                </Link>
                <Link href="/dashboard/leads" style={{ color: isActiveLink('/dashboard/leads') ? '#38bdf8' : '#94a3b8', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  📥 Enquiries
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Sign Out Button */}
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            padding: '0.75rem 0',
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            marginTop: '2rem',
            whiteSpace: 'nowrap'
          }}
        >
          {isSidebarHovered ? 'Sign Out' : '✕'}
        </button>
      </aside>

      {/* Main Framework Container */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Logged in as Portal Admin</span>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
          </div>
        </header>

        <main style={{ padding: '2rem', flexGrow: 1 }}>
          {children}
        </main>
      </div>

    </div>
  );
}