import React, { Suspense } from 'react';
import FinanceClient from './FinanceClient';

// Prevents static prerender errors with useSearchParams on Vercel
export const dynamic = 'force-dynamic';

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading finance data...</div>}>
      <FinanceClient />
    </Suspense>
  );
}