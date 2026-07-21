import React, { Suspense } from 'react';
import EmployeesClient from './EmployeesClient';

// Server-side directive: prevent static prerendering during build
export const dynamic = 'force-dynamic';

export default function EmployeeManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading employees...</div>}>
      <EmployeesClient />
    </Suspense>
  );
}