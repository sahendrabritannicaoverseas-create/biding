'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Calendar, DollarSign, Users, Eye, Plus, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface RFP {
  id: string; rfp_number: string; title: string; description: string; study_type: string;
  budget_range_min: number; budget_range_max: number; submission_deadline: string;
  status: string; created_at: string; bid_count?: number;
}

function MyRFPsContent() {
  const { profile } = useAuth();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { if (profile) fetchRFPs(); }, [profile]);

  const fetchRFPs = async () => {
    if (!profile?.company_id) return;
    try {
      const { data: rfpData, error: rfpError } = await supabase.from('rfps').select('*').eq('sponsor_company_id', profile.company_id).order('created_at', { ascending: false });
      if (rfpError) throw rfpError;
      const rfpsWithBidCounts = await Promise.all((rfpData || []).map(async rfp => {
        const { count } = await supabase.from('bids').select('*', { count: 'exact', head: true }).eq('rfp_id', rfp.id);
        return { ...rfp, bid_count: count || 0 };
      }));
      setRfps(rfpsWithBidCounts);
    } catch (error) { console.error('Error fetching RFPs:', error); } finally { setLoading(false); }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      active: { label: 'Active', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
      draft: { label: 'Draft', icon: Clock, color: 'bg-gray-100 text-gray-700' },
      closed: { label: 'Closed', icon: XCircle, color: 'bg-red-100 text-red-700' },
      awarded: { label: 'Awarded', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
    };
    return configs[status] || { label: status, icon: FileText, color: 'bg-gray-100 text-gray-700' };
  };

  const filteredRFPs = rfps.filter(rfp => filter === 'all' || rfp.status === filter);
  const stats = { total: rfps.length, active: rfps.filter(r => r.status === 'active').length, totalBids: rfps.reduce((sum, r) => sum + (r.bid_count || 0), 0), avgBidsPerRFP: rfps.length > 0 ? (rfps.reduce((sum, r) => sum + (r.bid_count || 0), 0) / rfps.length).toFixed(1) : '0' };

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div><h1 className="text-3xl font-bold text-gray-900">My RFPs</h1><p className="text-gray-600 mt-1">Manage your RFPs and review bids</p></div>
          <Link href="/sponsor/create-rfp" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"><Plus className="w-5 h-5" /><span>Create RFP</span></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[{ title: 'Total RFPs', value: stats.total, icon: FileText, color: 'text-gray-400' }, { title: 'Active RFPs', value: stats.active, icon: CheckCircle, color: 'text-green-500' }, { title: 'Total Bids', value: stats.totalBids, icon: Users, color: 'text-blue-500' }, { title: 'Avg Bids/RFP', value: stats.avgBidsPerRFP, icon: TrendingUp, color: 'text-purple-500' }].map(s => { const Icon = s.icon; return (
            <div key={s.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"><div className="flex items-center justify-between mb-2"><p className="text-sm font-medium text-gray-600">{s.title}</p><Icon className={`w-5 h-5 ${s.color}`} /></div><p className="text-3xl font-bold text-gray-900">{s.value}</p></div>
          ); })}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {[{ id: 'all', label: `All (${rfps.length})` }, { id: 'active', label: `Active (${stats.active})` }, { id: 'draft', label: 'Draft' }, { id: 'closed', label: 'Closed' }].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-lg font-medium transition ${filter === f.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredRFPs.length === 0 ? (
              <div className="p-12 text-center"><FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No RFPs found</h3><Link href="/sponsor/create-rfp" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"><Plus className="w-5 h-5" /><span>Create Your First RFP</span></Link></div>
            ) : filteredRFPs.map(rfp => {
              const statusConfig = getStatusConfig(rfp.status);
              const StatusIcon = statusConfig.icon;
              const isExpiringSoon = new Date(rfp.submission_deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              return (
                <div key={rfp.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{rfp.title}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>{statusConfig.label}</span>
                        {rfp.status === 'active' && isExpiringSoon && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">Expiring Soon</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">RFP #{rfp.rfp_number} • {rfp.study_type}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-2 text-gray-600"><DollarSign className="w-4 h-4" /><span>${rfp.budget_range_min?.toLocaleString()} - ${rfp.budget_range_max?.toLocaleString()}</span></div>
                        <div className="flex items-center space-x-2 text-gray-600"><Calendar className="w-4 h-4" /><span>Due {new Date(rfp.submission_deadline).toLocaleDateString()}</span></div>
                        <div className="flex items-center space-x-2 text-gray-600"><Users className="w-4 h-4" /><span className="font-semibold text-gray-900">{rfp.bid_count} {rfp.bid_count === 1 ? 'Bid' : 'Bids'}</span></div>
                        <div className="flex items-center space-x-2 text-gray-600"><Clock className="w-4 h-4" /><span>Created {new Date(rfp.created_at).toLocaleDateString()}</span></div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{rfp.description}</p>
                    </div>
                    <div className="ml-4 flex flex-col space-y-2">
                      <Link href={`/sponsor/rfps/${rfp.id}/bids`} className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"><Eye className="w-4 h-4" /><span>View Bids</span></Link>
                      <Link href={`/rfps/${rfp.id}`} className="inline-flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-semibold text-sm"><FileText className="w-4 h-4" /><span>View RFP</span></Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function MyRFPsPage() {
  return <ProtectedRoute allowedRoles={['sponsor']}><MyRFPsContent /></ProtectedRoute>;
}
