'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Search,
  Filter,
  ArrowRight,
  Clock,
  Lock
} from 'lucide-react';

export default function AdminCompliancePage() {
  const complianceStats = [
    { label: 'GxP Certified', value: '85%', color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'ISO 9001', value: '92%', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Pending Audits', value: '14', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { label: 'Flagged Issues', value: '3', color: 'text-red-600', bgColor: 'bg-red-100' },
  ];

  const recentActivities = [
    { id: 1, type: 'Certificate Update', company: 'GlobalPharma Services', status: 'Verified', date: '2 hours ago' },
    { id: 2, type: 'Annual Audit', company: 'Asia CRO Network', status: 'In Progress', date: '5 hours ago' },
    { id: 3, type: 'Compliance Flag', company: 'MediGen Labs', status: 'Action Required', date: '1 day ago' },
    { id: 4, type: 'New Registration', company: 'BioNova Research', status: 'Pending Review', date: '2 days ago' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compliance Monitoring</h1>
            <p className="text-gray-600 mt-1">Track platform compliance and GxP standards</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceStats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Shield className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Audit Logs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Recent Compliance Activity</h3>
                  <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">View All</button>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                            ${activity.status === 'Verified' ? 'bg-green-50 text-green-600' : 
                              activity.status === 'Action Required' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}
                          >
                            {activity.type.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{activity.company}</p>
                            <p className="text-sm text-gray-500">{activity.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold
                            ${activity.status === 'Verified' ? 'text-green-600' : 
                              activity.status === 'Action Required' ? 'text-red-600' : 'text-gray-600'}`}
                          >
                            {activity.status}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{activity.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-600 rounded-xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-200">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3 italic">Automated Compliance Checks</h3>
                  <p className="text-blue-100 mb-6 max-w-lg">
                    Our platform automatically validates WHO-GMP, EU-GMP, and US FDA certificates every 24 hours to ensure 100% platform integrity.
                  </p>
                  <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition drop-shadow-md">
                    Trigger Manual Scan
                  </button>
                </div>
                <Shield className="absolute -right-8 -bottom-8 w-64 h-64 text-blue-500 opacity-20 rotate-12" />
              </div>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Urgent Compliance</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { title: 'Expired GMP Cert', company: 'MediGen Labs' },
                    { title: 'Incomplete KYC', company: 'Global Solutions' },
                    { title: 'Audit Flag #402', company: 'Asia CRO' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.company}</p>
                      </div>
                      <button className="p-1 text-gray-400 group-hover:text-blue-600 transition">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <Lock className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-bold">Security Audit</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Last full platform security audit was completed 12 days ago. No critical vulnerabilities found.
                </p>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Audit Score</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-400">99 / 100</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
