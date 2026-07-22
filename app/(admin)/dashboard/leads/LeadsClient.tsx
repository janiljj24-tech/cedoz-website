'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function LeadsClient() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Enquiries & Leads</h1>
      <p className="text-slate-400">Current Filter: {filter}</p>
      
      {/* Paste your existing Leads / Enquiries page content/JSX here */}
    </div>
  );
}