import React, { Suspense } from 'react';
import LeadsClient from './LeadsClient';

// Prevents static prerender errors with useSearchParams on Vercel
export const dynamic = 'force-dynamic';

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading enquiries...</div>}>
      <LeadsClient />
    </Suspense>
  );
}