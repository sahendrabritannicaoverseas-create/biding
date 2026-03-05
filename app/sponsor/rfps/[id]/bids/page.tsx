'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, DollarSign, Clock, CheckCircle, Award, AlertCircle, Eye } from 'lucide-react';

interface Bid {
  id: string; bid_amount: number; estimated_timeline_months?: number; notes?: string;
  status: string; submitted_at: string; vendor_type: string;
  vendor_company?: { company_name: string; country: string; trust_score?: number; average_rating?: number; };
}

function RFPBidReviewContent({ id }: { id: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [rfp, setRfp] = useState<any>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const { data: rfpData } = await supabase.from('rfps').select('*').eq('id', id).maybeSingle();
      setRfp(rfpData);
      const { data: bidsData } = await supabase.from('bids').select('*').eq('rfp_id', id).order('submitted_at', { ascending: false });
      setBids(bidsData || []);
    } catch (error) { console.error('Error fetching data:', error); } finally { setLoading(false); }
  };

  const updateBidStatus = async (bidId: string, newStatus: string) => {
    setActionLoading(bidId);
    try {
      await supabase.from('bids').update({ status: newStatus }).eq('id', bidId);
      if (newStatus === 'awarded') {
        await supabase.from('rfps').update({ status: 'awarded' }).eq('id', id);
        await supabase.from('bids').update({ status: 'rejected' }).eq('rfp_id', id).neq('id', bidId);
      }
      fetchData();
    } catch (error) { console.error('Error updating bid:', error); } finally { setActionLoading(null); }
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-700', shortlisted: 'bg-green-100 text-green-700',
      awarded: 'bg-emerald-100 text-emerald-700', rejected: 'bg-gray-100 text-gray-700',
      bafo_requested: 'bg-yellow-100 text-yellow-700',
    };
    return statuses[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium"><ArrowLeft className="w-5 h-5" /><span>Back to My RFPs</span></button>
        {rfp && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-2"><h1 className="text-2xl font-bold text-gray-900">{rfp.title}</h1><span className={`px-3 py-1 text-xs font-semibold rounded-full ${rfp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{rfp.status?.toUpperCase()}</span></div>
            <p className="text-gray-600 font-medium">RFP #{rfp.rfp_number} • {bids.length} bids received</p>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200"><h2 className="text-xl font-bold text-gray-900">Submitted Bids</h2></div>
          <div className="divide-y divide-gray-200">
            {bids.length === 0 ? (
              <div className="p-12 text-center"><AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">No bids received yet</p></div>
            ) : bids.map(bid => (
              <div key={bid.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">{bid.vendor_company?.company_name || `${bid.vendor_type} Company`}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(bid.status)}`}>{bid.status?.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex items-center space-x-2"><DollarSign className="w-4 h-4 text-gray-400" /><span className="font-bold text-lg text-gray-900">${bid.bid_amount?.toLocaleString()}</span></div>
                      {bid.estimated_timeline_months && <div className="flex items-center space-x-2 text-gray-600"><Clock className="w-4 h-4" /><span>{bid.estimated_timeline_months} months</span></div>}
                      <div className="flex items-center space-x-2 text-gray-600"><span>Submitted: {new Date(bid.submitted_at).toLocaleDateString()}</span></div>
                    </div>
                    {bid.notes && <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{bid.notes}</p></div>}
                  </div>
                  {bid.status !== 'awarded' && bid.status !== 'rejected' && rfp?.status !== 'awarded' && (
                    <div className="ml-6 flex flex-col space-y-2">
                      <button onClick={() => updateBidStatus(bid.id, 'shortlisted')} disabled={!!actionLoading || bid.status === 'shortlisted'} className="inline-flex items-center space-x-2 text-green-700 border border-green-300 px-4 py-2 rounded-lg hover:bg-green-50 transition text-sm font-medium disabled:opacity-50"><CheckCircle className="w-4 h-4" /><span>Shortlist</span></button>
                      <button onClick={() => updateBidStatus(bid.id, 'bafo_requested')} disabled={!!actionLoading} className="inline-flex items-center space-x-2 text-yellow-700 border border-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-50 transition text-sm font-medium disabled:opacity-50"><Eye className="w-4 h-4" /><span>Request BAFO</span></button>
                      <button onClick={() => updateBidStatus(bid.id, 'awarded')} disabled={!!actionLoading} className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50"><Award className="w-4 h-4" /><span>Award</span></button>
                      <button onClick={() => updateBidStatus(bid.id, 'rejected')} disabled={!!actionLoading} className="inline-flex items-center space-x-2 text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"><span>Reject</span></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function RFPBidReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProtectedRoute allowedRoles={['sponsor']}><RFPBidReviewContent id={id} /></ProtectedRoute>;
}
