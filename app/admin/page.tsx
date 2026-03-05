'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { 
  Users, 
  Building2, 
  FileText, 
  Shield, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Activity,
  Briefcase
} from 'lucide-react';

export default function AdminPage() {
  const adminCards = [
    { title: 'User Accounts', description: 'Monitor and manage user profiles', icon: Users, path: '/admin/users', color: 'bg-blue-50 text-blue-600', count: '18+' },
    { title: 'Company Directory', description: 'Verify and review registrations', icon: Building2, path: '/admin/companies', color: 'bg-green-50 text-green-600', count: '12' },
    { title: 'Marketplace RFPs', description: 'Manage platform opportunities', icon: FileText, path: '/admin/rfps', color: 'bg-orange-50 text-orange-600', count: '24' },
    { title: 'Active Projects', description: 'Track milestones and compliance', icon: Briefcase, path: '/projects', color: 'bg-indigo-50 text-indigo-600', count: '8' },
    { title: 'Compliance Hub', description: 'Track GxP and certifications', icon: Shield, path: '/admin/compliance', color: 'bg-purple-50 text-purple-600', count: '99%' },
    { title: 'Platform Payments', description: 'Volume and escrow monitoring', icon: DollarSign, path: '/admin/payments', color: 'bg-cyan-50 text-cyan-600', count: '$1.2M' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-8 text-gray-900">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-sans">Admin Control Center</h1>
            <p className="text-gray-600 mt-1">Global platform overview and administration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link 
                  key={card.path} 
                  href={card.path}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${card.color} p-3 rounded-xl`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 font-mono tracking-tighter">
                      {card.count}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{card.description}</p>
                  <div className="flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Access Module</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="flex items-center space-x-2 text-blue-400 mb-4">
                  <Activity className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-bold tracking-widest uppercase">System Status</span>
                </div>
                <h2 className="text-3xl font-bold mb-4 font-sans">Platform is Healthy</h2>
                <p className="text-slate-400 leading-relaxed italic">
                  All systems are operational. Average response time is 142ms. No critical alerts in the last 24 hours. Last automated backup was completed 4 hours ago.
                </p>
              </div>
              <div className="flex space-x-4">
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">Active Sessions</p>
                  <p className="text-2xl font-bold">142</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">Daily Uptime</p>
                  <p className="text-2xl font-bold text-green-400">99.9%</p>
                </div>
              </div>
            </div>
            <TrendingUp className="absolute -right-12 -bottom-12 w-96 h-96 text-blue-500 opacity-5 -rotate-12" />
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
