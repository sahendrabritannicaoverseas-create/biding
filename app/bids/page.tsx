'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, FileText, DollarSign, Calendar, CheckCircle, Clock, XCircle, AlertCircle, ArrowRight, Eye } from 'lucide-react';

interface Bid {
  id: string; rfp_id: string; bid_amount: number;
  estimated_timeline_months?: number; notes?: string; status: string; submitted_at: string;
  rfp: { rfp_number: string; title: string; study_type: string; submission_deadline: string; status: string; };
}

function BidsContent() {
  const { profile } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { if (profile) fetchBids(); }, [profile]);

  const fetchBids = async () => {
    if (!profile?.company_id) return;
    try {
      // Step 1: Fetch bids without the JOIN to avoid RLS 500 errors
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('vendor_company_id', profile.company_id)
        .order('submitted_at', { ascending: false });

      if (bidsError) {
        console.error('Bids fetch error:', bidsError.message, bidsError.code, bidsError.details, bidsError.hint);
        throw bidsError;
      }

      if (!bidsData || bidsData.length === 0) {
        setBids([]);
        return;
      }

      // Step 2: Fetch the related RFPs separately using the rfp_ids
      const rfpIds = [...new Set(bidsData.map((b: any) => b.rfp_id))];
      const { data: rfpsData, error: rfpsError } = await supabase
        .from('rfps')
        .select('id, rfp_number, title, study_type, submission_deadline, status')
        .in('id', rfpIds);

      if (rfpsError) {
        console.error('RFPs fetch error:', rfpsError.message, rfpsError.code, rfpsError.details, rfpsError.hint);
        // Don't throw — show bids even if RFP details fail
      }

      // Step 3: Merge rfp data into each bid
      const rfpMap: Record<string, any> = {};
      (rfpsData || []).forEach((rfp: any) => { rfpMap[rfp.id] = rfp; });

      const mergedBids = bidsData.map((bid: any) => ({
        ...bid,
        rfp: rfpMap[bid.rfp_id] || {
          rfp_number: 'N/A', title: 'Unknown RFP',
          study_type: '', submission_deadline: '', status: ''
        },
      }));

      setBids(mergedBids);
    } catch (error: any) {
      console.error('Error fetching bids:', error?.message || error?.code || JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      submitted: { label: 'Submitted', icon: Clock, color: 'bg-blue-100 text-blue-700', iconColor: 'text-blue-600' },
      shortlisted: { label: 'Shortlisted', icon: CheckCircle, color: 'bg-green-100 text-green-700', iconColor: 'text-green-600' },
      bafo_requested: { label: 'BAFO Requested', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-600' },
      awarded: { label: 'Awarded', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700', iconColor: 'text-emerald-600' },
      rejected: { label: 'Not Selected', icon: XCircle, color: 'bg-gray-100 text-gray-700', iconColor: 'text-gray-600' },
    };
    return configs[status] || { label: status, icon: FileText, color: 'bg-gray-100 text-gray-700', iconColor: 'text-gray-600' };
  };

  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['submitted', 'shortlisted', 'bafo_requested', 'bafo_submitted'].includes(bid.status);
    return bid.status === filter;
  });

  const stats = {
    total: bids.length,
    active: bids.filter(b => ['submitted', 'shortlisted', 'bafo_requested', 'bafo_submitted'].includes(b.status)).length,
    awarded: bids.filter(b => b.status === 'awarded').length,
    totalValue: bids.filter(b => b.status === 'awarded').reduce((sum, b) => sum + Number(b.bid_amount), 0),
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div><h1 className="text-3xl font-bold text-gray-900">My Bids</h1><p className="text-gray-600 mt-1">Track and manage all your submitted bids</p></div>
          <Link href="/rfps" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
            <Eye className="w-5 h-5" /><span>Browse RFPs</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Bids', value: stats.total, icon: FileText, color: 'text-gray-400' },
            { title: 'Active Bids', value: stats.active, icon: Clock, color: 'text-blue-500' },
            { title: 'Awarded', value: stats.awarded, icon: CheckCircle, color: 'text-green-500' },
            { title: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
          ].map(s => { const Icon = s.icon; return (
            <div key={s.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2"><p className="text-sm font-medium text-gray-600">{s.title}</p><Icon className={`w-5 h-5 ${s.color}`} /></div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            </div>
          ); })}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {[{ id: 'all', label: `All (${bids.length})` }, { id: 'active', label: `Active (${stats.active})` }, { id: 'awarded', label: `Awarded (${stats.awarded})` }, { id: 'rejected', label: 'Not Selected' }].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-lg font-medium transition ${filter === f.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredBids.length === 0 ? (
              <div className="p-12 text-center"><FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No bids found</h3><Link href="/rfps" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"><span>Browse available RFPs</span><ArrowRight className="w-4 h-4" /></Link></div>
            ) : filteredBids.map(bid => {
              const statusConfig = getStatusConfig(bid.status);
              const StatusIcon = statusConfig.icon;
              return (
                <Link key={bid.id} href={`/rfps/${bid.rfp_id}`} className="p-6 hover:bg-gray-50 transition block">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{bid.rfp.title}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>{statusConfig.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">RFP #{bid.rfp.rfp_number} • {bid.rfp.study_type}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600"><DollarSign className="w-4 h-4" /><span className="font-semibold text-gray-900">${bid.bid_amount.toLocaleString()}</span></div>
                        {bid.estimated_timeline_months && <div className="flex items-center space-x-2 text-gray-600"><Clock className="w-4 h-4" /><span>{bid.estimated_timeline_months} months</span></div>}
                        <div className="flex items-center space-x-2 text-gray-600"><Calendar className="w-4 h-4" /><span>Submitted {new Date(bid.submitted_at).toLocaleDateString()}</span></div>
                        <div className="flex items-center space-x-2 text-gray-600"><StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} /><span>RFP {bid.rfp.status}</span></div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 shrink-0 ml-4 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function BidsPage() {
  return <ProtectedRoute><BidsContent /></ProtectedRoute>;
}
