'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function FinanceClient() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'project';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
      <p className="text-slate-400">Current Tab: {tab}</p>
      
      {/* Paste your existing Finance page JSX / tables / components here */}
    </div>
  );
}