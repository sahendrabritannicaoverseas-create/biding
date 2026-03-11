'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, TrendingUp, CheckCircle, Award, ArrowRight, Search } from 'lucide-react';

export function CRODashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ availableRFPs: 0, activeBids: 0, activeProjects: 0, trustScore: 0 });
  const [recentRFPs, setRecentRFPs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (profile) fetchDashboardData(); }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile?.company_id) return;
    try {
      const { data: rfpsData } = await supabase.from('rfps').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(5);
      const { data: bidsData } = await supabase.from('bids').select('*').eq('vendor_company_id', profile.company_id).in('status', ['submitted', 'shortlisted', 'bafo_requested', 'bafo_submitted']);
      const { data: projectsData } = await supabase.from('projects').select('*').eq('cro_company_id', profile.company_id).eq('status', 'active');
      const { data: companyData } = await supabase.from('cro_companies').select('trust_score').eq('id', profile.company_id).maybeSingle();
      setStats({ availableRFPs: rfpsData?.length || 0, activeBids: bidsData?.length || 0, activeProjects: projectsData?.length || 0, trustScore: Number(companyData?.trust_score || 0) });
      setRecentRFPs(rfpsData || []);
    } catch (error) { console.error('Error fetching dashboard data:', error); } finally { setLoading(false); }
  };

  const statCards = [
    { title: 'Available RFPs', value: stats.availableRFPs, icon: FileText, color: 'bg-blue-500', link: '/rfps' },
    { title: 'Active Bids', value: stats.activeBids, icon: TrendingUp, color: 'bg-green-500', link: '/bids' },
    { title: 'Active Projects', value: stats.activeProjects, icon: CheckCircle, color: 'bg-orange-500', link: '/projects' },
    { title: 'Trust Score', value: stats.trustScore.toFixed(2), icon: Award, color: 'bg-slate-500', link: '/certifications' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name}</h1><p className="text-gray-600 mt-1">Explore new opportunities and manage your bids</p></div>
        <Link href="/rfps" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"><Search className="w-5 h-5" /><span>Browse RFPs</span></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(stat => { const Icon = stat.icon; return (
          <Link key={stat.title} href={stat.link} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition group">
            <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-gray-600">{stat.title}</p><p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p></div><div className={`${stat.color} p-3 rounded-lg`}><Icon className="w-6 h-6 text-white" /></div></div>
            <div className="flex items-center text-blue-600 text-sm font-medium mt-4 group-hover:translate-x-1 transition-transform">View details<ArrowRight className="w-4 h-4 ml-1" /></div>
          </Link>
        ); })}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200"><div className="flex justify-between items-center"><h2 className="text-xl font-bold text-gray-900">New RFP Opportunities</h2><Link href="/rfps" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">View all<ArrowRight className="w-4 h-4 ml-1" /></Link></div></div>
        <div className="divide-y divide-gray-200">
          {recentRFPs.length === 0 ? (
            <div className="p-12 text-center"><FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">No RFPs available at the moment.</p></div>
          ) : recentRFPs.map(rfp => (
            <Link key={rfp.id} href={`/rfps/${rfp.id}`} className="p-6 hover:bg-gray-50 transition block">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3"><h3 className="font-semibold text-gray-900">{rfp.title}</h3><span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Open</span></div>
                  <p className="text-sm text-gray-600 mt-1">{rfp.study_type} • {rfp.target_geography?.join(', ')}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500"><span>RFP #{rfp.rfp_number}</span><span>•</span><span>{rfp.bids_count || 0} bids</span><span>•</span><span>Deadline: {new Date(rfp.submission_deadline).toLocaleDateString()}</span></div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
