'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Users, Building2, FileText, DollarSign, ArrowRight } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCompanies: 0, activeRFPs: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: usersData } = await supabase.from('user_profiles').select('id');
      const { data: companiesData } = await supabase.from('sponsor_companies').select('id').eq('verification_status', 'verified');
      const { data: croCompaniesData } = await supabase.from('cro_companies').select('id').eq('verification_status', 'verified');
      const { data: rfpsData } = await supabase.from('rfps').select('id').eq('status', 'active');
      setStats({ totalUsers: usersData?.length || 0, totalCompanies: (companiesData?.length || 0) + (croCompaniesData?.length || 0), activeRFPs: rfpsData?.length || 0, totalRevenue: 0 });
    } catch (error) { console.error('Error fetching dashboard data:', error); } finally { setLoading(false); }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { title: 'Companies', value: stats.totalCompanies, icon: Building2, color: 'bg-green-500' },
    { title: 'Active RFPs', value: stats.activeRFPs, icon: FileText, color: 'bg-orange-500' },
    { title: 'Platform Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-slate-500' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1><p className="text-gray-600 mt-1">Platform overview and management</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(stat => { const Icon = stat.icon; return (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-gray-600">{stat.title}</p><p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p></div><div className={`${stat.color} p-3 rounded-lg`}><Icon className="w-6 h-6 text-white" /></div></div>
          </div>
        ); })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/companies" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition group">
          <Building2 className="w-8 h-8 text-blue-600 mb-4" /><h3 className="text-lg font-bold text-gray-900">Manage Companies</h3>
          <p className="text-gray-600 mt-2">Review and verify sponsor and CRO company registrations</p>
          <div className="flex items-center text-blue-600 text-sm font-medium mt-4 group-hover:translate-x-1 transition-transform">View companies<ArrowRight className="w-4 h-4 ml-1" /></div>
        </Link>
        <Link href="/admin/compliance" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition group">
          <FileText className="w-8 h-8 text-green-600 mb-4" /><h3 className="text-lg font-bold text-gray-900">Compliance Monitoring</h3>
          <p className="text-gray-600 mt-2">Track GxP compliance and review audit flags</p>
          <div className="flex items-center text-blue-600 text-sm font-medium mt-4 group-hover:translate-x-1 transition-transform">View compliance<ArrowRight className="w-4 h-4 ml-1" /></div>
        </Link>
      </div>
    </div>
  );
}
