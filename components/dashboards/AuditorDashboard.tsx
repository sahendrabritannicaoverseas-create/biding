'use client';

import Link from 'next/link';
import { FileText, Shield, CheckCircle } from 'lucide-react';

export function AuditorDashboard() {
  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold text-gray-900">Auditor Dashboard</h1><p className="text-gray-600 mt-1">Compliance review and audit trail access</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/rfps" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
          <FileText className="w-8 h-8 text-blue-600 mb-4" /><h3 className="text-lg font-bold text-gray-900">Review RFPs</h3><p className="text-gray-600 mt-2">Access all RFPs for compliance review</p>
        </Link>
        <Link href="/projects" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
          <CheckCircle className="w-8 h-8 text-green-600 mb-4" /><h3 className="text-lg font-bold text-gray-900">Review Projects</h3><p className="text-gray-600 mt-2">Monitor active project execution</p>
        </Link>
        <Link href="/audit-logs" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
          <Shield className="w-8 h-8 text-orange-600 mb-4" /><h3 className="text-lg font-bold text-gray-900">Audit Logs</h3><p className="text-gray-600 mt-2">View complete audit trail</p>
        </Link>
      </div>
    </div>
  );
}
