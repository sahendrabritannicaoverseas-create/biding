'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Calendar, MapPin, DollarSign, Users, Clock, Building2, ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface RFP {
  id: string; rfp_number: string; title: string; description: string;
  study_type: string; requirement_category: string;
  budget_range_min: number; budget_range_max: number;
  target_geography: string[]; submission_deadline: string; status: string;
  sample_size?: number; estimated_duration_months?: number;
  is_invite_only: boolean; special_requirements?: string; created_at: string;
}

function RFPDetailsContent({ id }: { id: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [existingBid, setExistingBid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidData, setBidData] = useState({ bidAmount: '', timeline: '', notes: '' });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchRFPDetails(); }, [id, profile]);

  const fetchRFPDetails = async () => {
    try {
      const { data: rfpData, error: rfpError } = await supabase.from('rfps').select('*').eq('id', id).maybeSingle();
      if (rfpError) throw rfpError;
      setRfp(rfpData);
      if (profile?.company_id) {
        const { data: bidDataRes } = await supabase.from('bids').select('*').eq('rfp_id', id).eq('vendor_company_id', profile.company_id).maybeSingle();
        setExistingBid(bidDataRes);
      }
    } catch (error) {
      setError('Failed to load RFP details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.company_id) return;
    setSubmitting(true); setError('');
    try {
      const { error: insertError } = await supabase.from('bids').insert({
        rfp_id: id, vendor_company_id: profile.company_id, vendor_type: profile.role,
        bid_amount: parseFloat(bidData.bidAmount), estimated_timeline_months: parseInt(bidData.timeline) || null,
        notes: bidData.notes || null, submitted_by: profile.id, status: 'submitted',
      });
      if (insertError) throw insertError;
      setSubmitSuccess(true); setShowBidForm(false);
      setTimeout(() => router.push('/bids'), 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to submit bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmitBid = () => {
    if (!profile || rfp?.status !== 'active' || existingBid) return false;
    return ['cro', 'manufacturer', 'lab', 'distributor'].includes(profile.role || '');
  };

  if (loading) return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;
  if (!rfp) return <Layout><div className="text-center py-16"><AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-900 mb-2">RFP Not Found</h2><Link href="/rfps" className="text-blue-600 hover:text-blue-700 font-semibold">Back to RFPs</Link></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <button onClick={() => router.back()} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>
        {submitSuccess && <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><div><h3 className="font-semibold text-green-900">Bid Submitted Successfully!</h3><p className="text-sm text-green-700 mt-1">Redirecting to bids page...</p></div></div>}
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-700">{error}</p></div>}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{rfp.title}</h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${rfp.status === 'active' ? 'bg-green-100 text-green-700' : rfp.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>{rfp.status.toUpperCase()}</span>
              </div>
              <p className="text-gray-600 font-medium">RFP #{rfp.rfp_number}</p>
            </div>
            {canSubmitBid() && !showBidForm && (
              <button onClick={() => setShowBidForm(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                <Send className="w-5 h-5" /><span>Submit Bid</span>
              </button>
            )}
            {existingBid && <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2"><p className="text-sm font-medium text-blue-900">You have already submitted a bid</p><Link href="/bids" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View your bids →</Link></div>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-start space-x-3"><DollarSign className="w-5 h-5 text-gray-400 mt-1" /><div><p className="text-sm text-gray-600">Budget Range</p><p className="font-semibold text-gray-900">${rfp.budget_range_min?.toLocaleString()} - ${rfp.budget_range_max?.toLocaleString()}</p></div></div>
            <div className="flex items-start space-x-3"><Calendar className="w-5 h-5 text-gray-400 mt-1" /><div><p className="text-sm text-gray-600">Deadline</p><p className="font-semibold text-gray-900">{new Date(rfp.submission_deadline).toLocaleDateString()}</p></div></div>
            {rfp.estimated_duration_months && <div className="flex items-start space-x-3"><Clock className="w-5 h-5 text-gray-400 mt-1" /><div><p className="text-sm text-gray-600">Duration</p><p className="font-semibold text-gray-900">{rfp.estimated_duration_months} months</p></div></div>}
            {rfp.sample_size && <div className="flex items-start space-x-3"><Users className="w-5 h-5 text-gray-400 mt-1" /><div><p className="text-sm text-gray-600">Sample Size</p><p className="font-semibold text-gray-900">{rfp.sample_size} subjects</p></div></div>}
          </div>
          <div className="space-y-6">
            <div><h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2><p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{rfp.description}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><h3 className="font-semibold text-gray-900 mb-2 flex items-center"><FileText className="w-5 h-5 mr-2 text-gray-400" />Study Type</h3><p className="text-gray-700">{rfp.study_type}</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-2 flex items-center"><Building2 className="w-5 h-5 mr-2 text-gray-400" />Category</h3><p className="text-gray-700">{rfp.requirement_category?.replace(/_/g, ' ')}</p></div>
              <div><h3 className="font-semibold text-gray-900 mb-2 flex items-center"><MapPin className="w-5 h-5 mr-2 text-gray-400" />Target Geography</h3><p className="text-gray-700">{rfp.target_geography?.join(', ')}</p></div>
            </div>
            {rfp.special_requirements && <div><h3 className="font-semibold text-gray-900 mb-2">Special Requirements</h3><p className="text-gray-700 whitespace-pre-wrap">{rfp.special_requirements}</p></div>}
          </div>
        </div>
        {showBidForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Bid</h2>
            <form onSubmit={handleSubmitBid} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Bid Amount (USD) <span className="text-red-600">*</span></label>
                <div className="relative"><DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="number" required min="0" step="0.01" value={bidData.bidAmount} onChange={(e) => setBidData({ ...bidData, bidAmount: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your bid amount" /></div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Estimated Timeline (months)</label>
                <input type="number" min="1" value={bidData.timeline} onChange={(e) => setBidData({ ...bidData, timeline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 12" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Proposal Notes</label>
                <textarea value={bidData.notes} onChange={(e) => setBidData({ ...bidData, notes: e.target.value })} rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your capabilities, experience, and approach..." />
              </div>
              <div className="flex items-center space-x-4 pt-4">
                <button type="submit" disabled={submitting} className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50">
                  {submitting ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Submitting...</span></> : <><Send className="w-5 h-5" /><span>Submit Bid</span></>}
                </button>
                <button type="button" onClick={() => setShowBidForm(false)} className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function RFPDetailsPage({ params }: { params: { id: string } }) {
  return <ProtectedRoute><RFPDetailsContent id={params.id} /></ProtectedRoute>;
}
