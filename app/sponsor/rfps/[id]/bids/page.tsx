'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import {
  ArrowLeft, DollarSign, Clock, CheckCircle, Award, AlertCircle,
  Eye, XCircle, Building2, Star, Globe, Users, FileText, TrendingUp, Loader2
} from 'lucide-react';

interface Bid {
  id: string;
  bid_amount: number;
  estimated_timeline_months?: number;
  notes?: string;
  status: string;
  submitted_at: string;
  vendor_type: string;
  vendor_company?: {
    company_name: string;
    country: string;
    trust_score?: number;
    average_rating?: number;
  };
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  submitted:     { label: 'Submitted',      bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-400',    border: 'border-blue-500/20' },
  shortlisted:   { label: 'Shortlisted',    bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
  awarded:       { label: 'Awarded',        bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400',   border: 'border-amber-500/20' },
  rejected:      { label: 'Rejected',       bg: 'bg-slate-500/10',   text: 'text-slate-400',   dot: 'bg-slate-400',   border: 'border-slate-500/20' },
  bafo_requested:{ label: 'BAFO Requested', bg: 'bg-violet-500/10',  text: 'text-violet-400',  dot: 'bg-violet-400',  border: 'border-violet-500/20' },
};

const RFP_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  active:  { label: 'Active',   bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  awarded: { label: 'Awarded',  bg: 'bg-amber-500/10',   text: 'text-amber-400' },
  closed:  { label: 'Closed',   bg: 'bg-red-500/10',     text: 'text-red-400' },
  draft:   { label: 'Draft',    bg: 'bg-slate-500/10',   text: 'text-slate-400' },
};

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
      const { data: rfpData } = await supabase
        .from('rfps').select('*').eq('id', id).maybeSingle();
      setRfp(rfpData);

      const { data: bidsData } = await supabase
        .from('bids').select('*').eq('rfp_id', id).order('submitted_at', { ascending: false });
      setBids(bidsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBidStatus = async (bidId: string, newStatus: string) => {
    setActionLoading(bidId + newStatus);
    try {
      await supabase.from('bids').update({ status: newStatus }).eq('id', bidId);
      
      if (newStatus === 'awarded') {
        const awardedBid = bids.find(b => b.id === bidId) as any;
        if (awardedBid) {
          const projectNumber = `PRJ-${Date.now().toString().slice(-6)}`;
          
          // Calculate end date based on timeline months
          let expectedEndDate = null;
          if (awardedBid.estimated_timeline_months) {
            const date = new Date();
            date.setMonth(date.getMonth() + awardedBid.estimated_timeline_months);
            expectedEndDate = date.toISOString().split('T')[0];
          }

          const { error: projectError } = await supabase.from('projects').insert([{
            title: rfp.title,
            project_number: projectNumber,
            sponsor_company_id: rfp.sponsor_company_id,
            cro_company_id: awardedBid.vendor_company_id,
            contract_value: awardedBid.bid_amount,
            currency: 'USD',
            start_date: new Date().toISOString().split('T')[0],
            expected_end_date: expectedEndDate,
            status: 'active',
            progress_percentage: 0
          }]);

          if (projectError) {
            console.error('Error creating project:', projectError);
          }
        }

        await supabase.from('rfps').update({ status: 'awarded' }).eq('id', id);
        await supabase.from('bids').update({ status: 'rejected' }).eq('rfp_id', id).neq('id', bidId);
      }
      await fetchData();
    } catch (error) {
      console.error('Error updating bid:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const submittedCount  = bids.filter(b => b.status === 'submitted').length;
  const shortlistedCount = bids.filter(b => b.status === 'shortlisted').length;
  const awardedBid      = bids.find(b => b.status === 'awarded');

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Bids…</span>
        </div>
      </Layout>
    );
  }

  const rfpStatus = rfp?.status ? (RFP_STATUS[rfp.status] || RFP_STATUS['draft']) : null;

  return (
    <Layout>
      <div className="space-y-6 pb-8">

        {/* ── Back nav ── */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to My RFPs
        </button>

        {/* ── RFP Header Card ── */}
        {rfp && (
          <div className="bg-[#1E293B] rounded-2xl p-5 sm:p-8 shadow-sm border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-2">
                  Bid Review
                </p>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {rfp.title}
                  </h1>
                  {rfpStatus && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${rfpStatus.bg} ${rfpStatus.text}`}>
                      {rfpStatus.label}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-black text-slate-500 tracking-widest font-mono">
                  #{rfp.rfp_number}
                  {rfp.study_type && (
                    <span className="normal-case font-sans font-semibold tracking-normal text-slate-400">
                      &nbsp;·&nbsp;{rfp.study_type}
                    </span>
                  )}
                </p>
                {rfp.description && (
                  <p className="mt-3 text-sm text-slate-400 line-clamp-2 leading-relaxed max-w-2xl">
                    {rfp.description}
                  </p>
                )}
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 sm:gap-3 shrink-0">
                {[
                  { label: 'Total Bids',   value: bids.length,       color: 'text-white' },
                  { label: 'Shortlisted',  value: shortlistedCount,  color: 'text-emerald-400' },
                  { label: 'Pending',      value: submittedCount,    color: 'text-blue-400' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl px-3 py-3 text-center">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Bids List ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Submitted Bids</p>
            <p className="text-xs font-bold text-slate-400">
              {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
            </p>
          </div>

          {bids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-800 mb-1">No Bids Yet</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Bids submitted by vendors will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {bids.map(bid => {
                const sc = STATUS_CONFIG[bid.status] || STATUS_CONFIG['submitted'];
                const isAwarded = bid.status === 'awarded';
                const isRejected = bid.status === 'rejected';
                const canAct = !isAwarded && !isRejected && rfp?.status !== 'awarded';

                return (
                  <div
                    key={bid.id}
                    className={`px-5 sm:px-8 py-6 transition-colors ${
                      isAwarded ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Top row: company + status + action buttons */}
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">

                      {/* ── Bid Info ── */}
                      <div className="flex-1 min-w-0">
                        {/* Company name + status badge */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-blue-500" />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">
                              {bid.vendor_company?.company_name || `${bid.vendor_type} Company`}
                            </h3>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${sc.bg} ${sc.text} ${sc.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                          {isAwarded && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600">
                              <Award className="w-3 h-3" />
                              Winner
                            </span>
                          )}
                        </div>

                        {/* Vendor meta */}
                        <div className="flex flex-wrap items-center gap-3 ml-10 mb-4 text-xs font-semibold text-slate-400">
                          <span className="capitalize">{bid.vendor_type?.replace(/_/g, ' ')}</span>
                          {bid.vendor_company?.country && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {bid.vendor_company.country}
                              </span>
                            </>
                          )}
                          {bid.vendor_company?.average_rating != null && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star className="w-3 h-3 fill-current" />
                                {bid.vendor_company.average_rating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Key metrics */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bid Amount</p>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-emerald-500" />
                              <span className="text-base font-black text-slate-900">
                                {bid.bid_amount?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {bid.estimated_timeline_months && (
                            <div className="bg-slate-50 rounded-xl p-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Timeline</p>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span className="text-base font-black text-slate-900">
                                  {bid.estimated_timeline_months}
                                  <span className="text-xs font-semibold text-slate-400 ml-1">mo</span>
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Submitted</p>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">
                                {new Date(bid.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {bid.notes && (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Proposal Notes</p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                              {bid.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ── Action Buttons ── */}
                      {canAct ? (
                        <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2 shrink-0 lg:w-36">
                          <button
                            onClick={() => updateBidStatus(bid.id, 'shortlisted')}
                            disabled={!!actionLoading || bid.status === 'shortlisted'}
                            className="inline-flex items-center justify-center gap-1.5 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                          >
                            {actionLoading === bid.id + 'shortlisted'
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <CheckCircle className="w-3.5 h-3.5" />
                            }
                            Shortlist
                          </button>
                          <button
                            onClick={() => updateBidStatus(bid.id, 'bafo_requested')}
                            disabled={!!actionLoading}
                            className="inline-flex items-center justify-center gap-1.5 border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                          >
                            {actionLoading === bid.id + 'bafo_requested'
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Eye className="w-3.5 h-3.5" />
                            }
                            BAFO
                          </button>
                          <button
                            onClick={() => updateBidStatus(bid.id, 'awarded')}
                            disabled={!!actionLoading}
                            className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                          >
                            {actionLoading === bid.id + 'awarded'
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Award className="w-3.5 h-3.5" />
                            }
                            Award
                          </button>
                          <button
                            onClick={() => updateBidStatus(bid.id, 'rejected')}
                            disabled={!!actionLoading}
                            className="inline-flex items-center justify-center gap-1.5 border border-slate-200 text-slate-500 hover:bg-slate-100 px-3 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                          >
                            {actionLoading === bid.id + 'rejected'
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <XCircle className="w-3.5 h-3.5" />
                            }
                            Reject
                          </button>
                        </div>
                      ) : (
                        /* Outcome label for finalised bids */
                        <div className={`shrink-0 lg:w-36 flex items-center justify-center rounded-2xl p-4 ${
                          isAwarded ? 'bg-amber-50' : 'bg-slate-50'
                        }`}>
                          {isAwarded
                            ? <div className="text-center">
                                <Award className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                                <p className="text-xs font-black text-amber-600 uppercase tracking-wider">Awarded</p>
                              </div>
                            : <div className="text-center">
                                <XCircle className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Rejected</p>
                              </div>
                          }
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function RFPBidReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute allowedRoles={['sponsor']}>
      <RFPBidReviewContent id={id} />
    </ProtectedRoute>
  );
}
