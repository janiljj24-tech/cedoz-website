'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Clear local storage / session storage
      localStorage.clear();
      sessionStorage.clear();

      // 2. Clear any auth cookies if set
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // 3. Redirect back to homepage
      router.push('/');

      // 4. Force a route refresh
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="CEDOZ Logo" className="h-8 w-auto" />
        <span className="text-white font-extrabold text-lg">CEDOZ Admin</span>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          href="/" 
          className="text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          View Main Site
        </Link>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/20 border border-red-500/30 rounded-lg transition"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}