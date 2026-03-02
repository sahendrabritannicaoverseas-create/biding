'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Construction } from 'lucide-react';

export default function CompliancePage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'auditor']}>
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <Construction className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Compliance</h1>
            <p className="text-gray-600 max-w-md mx-auto">Monitor compliance and certifications</p>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
