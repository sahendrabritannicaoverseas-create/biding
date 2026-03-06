'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText, Calendar, DollarSign, Users, Eye, Plus, Clock,
  CheckCircle, XCircle, TrendingUp, AlertTriangle, Search, Filter,
  ChevronRight, BarChart2, Layers
} from 'lucide-react';

interface RFP {
  id: string;
  rfp_number: string;
  title: string;
  description: string;
  study_type: string;
  budget_range_min: number;
  budget_range_max: number;
  submission_deadline: string;
  status: string;
  created_at: string;
  bid_count?: number;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  active:  { label: 'Active',   bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
  draft:   { label: 'Draft',    bg: 'bg-slate-500/10',   text: 'text-slate-400',   dot: 'bg-slate-400',   border: 'border-slate-500/20' },
  closed:  { label: 'Closed',   bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-400',     border: 'border-red-500/20' },
  awarded: { label: 'Awarded',  bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-400',    border: 'border-blue-500/20' },
};

function MyRFPsContent() {
  const { profile } = useAuth();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { if (profile) fetchRFPs(); }, [profile]);

  const fetchRFPs = async () => {
    if (!profile?.company_id) return;
    try {
      const { data: rfpData, error: rfpError } = await supabase
        .from('rfps')
        .select('*')
        .eq('sponsor_company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (rfpError) {
        console.error('Error fetching RFPs:', {
          message: rfpError.message,
          code: rfpError.code,
          details: rfpError.details,
          hint: rfpError.hint,
          profile_company_id: profile.company_id,
        });
        throw rfpError;
      }

      const rfpsWithBidCounts = await Promise.all((rfpData || []).map(async rfp => {
        const { count, error: bidError } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('rfp_id', rfp.id);
        if (bidError) console.warn('Could not fetch bid count for rfp', rfp.id, bidError.message);
        return { ...rfp, bid_count: count || 0 };
      }));

      setRfps(rfpsWithBidCounts);
    } catch (error: any) {
      console.error('Error fetching RFPs:', error?.message ?? error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: rfps.length,
    active: rfps.filter(r => r.status === 'active').length,
    draft: rfps.filter(r => r.status === 'draft').length,
    totalBids: rfps.reduce((sum, r) => sum + (r.bid_count || 0), 0),
    avgBidsPerRFP: rfps.length > 0
      ? (rfps.reduce((sum, r) => sum + (r.bid_count || 0), 0) / rfps.length).toFixed(1)
      : '0',
  };

  const filteredRFPs = rfps.filter(rfp => {
    const matchesFilter = filter === 'all' || rfp.status === filter;
    const matchesSearch = !search ||
      rfp.title.toLowerCase().includes(search.toLowerCase()) ||
      rfp.rfp_number?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const FILTER_TABS = [
    { id: 'all',     label: 'All',     count: rfps.length },
    { id: 'active',  label: 'Active',  count: stats.active },
    { id: 'draft',   label: 'Draft',   count: stats.draft },
    { id: 'closed',  label: 'Closed',  count: rfps.filter(r => r.status === 'closed').length },
    { id: 'awarded', label: 'Awarded', count: rfps.filter(r => r.status === 'awarded').length },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading RFPs…</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-1">
              Sponsor Portal
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My RFPs</h1>
            <p className="text-slate-400 mt-1 font-medium text-sm">
              Manage your requests for proposals and review bids
            </p>
          </div>
          <Link
            href="/sponsor/create-rfp"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create New RFP
          </Link>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total RFPs',    value: stats.total,          icon: Layers,    bg: 'bg-[#1E293B]',  text: 'text-white',         sub: 'text-slate-400', iconColor: 'text-blue-400',    iconBg: 'bg-blue-500/10' },
            { label: 'Active RFPs',   value: stats.active,         icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-900', sub: 'text-emerald-600', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
            { label: 'Total Bids',    value: stats.totalBids,      icon: Users,     bg: 'bg-blue-50',    text: 'text-blue-900',      sub: 'text-blue-600',   iconColor: 'text-blue-600',    iconBg: 'bg-blue-100' },
            { label: 'Avg Bids / RFP',value: stats.avgBidsPerRFP,  icon: BarChart2, bg: 'bg-violet-50',  text: 'text-violet-900',    sub: 'text-violet-600', iconColor: 'text-violet-600',  iconBg: 'bg-violet-100' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 sm:p-5 border border-white/5 shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-semibold ${s.sub}`}>{s.label}</p>
                  <div className={`w-8 h-8 ${s.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>
                </div>
                <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* ── Filter + Search Bar ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title or RFP number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
            />
          </div>
          {/* Filter tabs – scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-black ${
                  filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── RFP List ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">RFP Registry</p>
            <p className="text-xs font-bold text-slate-400">{filteredRFPs.length} result{filteredRFPs.length !== 1 ? 's' : ''}</p>
          </div>

          {filteredRFPs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-sm font-black text-slate-800 mb-1">No RFPs Found</h3>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">
                {search || filter !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : 'You haven\'t created any RFPs yet.'}
              </p>
              {!search && filter === 'all' && (
                <Link
                  href="/sponsor/create-rfp"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First RFP
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredRFPs.map(rfp => {
                const sc = STATUS_CONFIG[rfp.status] || STATUS_CONFIG['draft'];
                const isExpiringSoon =
                  rfp.status === 'active' &&
                  new Date(rfp.submission_deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={rfp.id}
                    className="group px-5 sm:px-8 py-5 hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Card body: info above buttons */}
                    <div className="flex flex-col gap-4">

                      {/* Left: info */}
                      <div className="flex-1 min-w-0">
                        {/* Title + badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base truncate">
                            {rfp.title}
                          </h3>
                          {/* Status badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${sc.bg} ${sc.text} ${sc.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                          {isExpiringSoon && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              Expiring Soon
                            </span>
                          )}
                        </div>

                        {/* Sub-line */}
                        <p className="text-[11px] font-black text-slate-400 tracking-widest uppercase font-mono mb-3">
                          #{rfp.rfp_number}
                          {rfp.study_type && <span className="normal-case font-sans font-semibold tracking-normal"> · {rfp.study_type}</span>}
                        </p>

                        {/* Meta pills */}
                        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                            ${rfp.budget_range_min?.toLocaleString()} – ${rfp.budget_range_max?.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            Due {new Date(rfp.submission_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-violet-400" />
                            <span className="font-black text-slate-700">{rfp.bid_count}</span>
                            &nbsp;{rfp.bid_count === 1 ? 'Bid' : 'Bids'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                            Created {new Date(rfp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Description */}
                        {rfp.description && (
                          <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {rfp.description}
                          </p>
                        )}
                      </div>

                      {/* Action buttons — full width on mobile, auto on sm+ */}
                      <div className="flex gap-2">
                        <Link
                          href={`/sponsor/rfps/${rfp.id}/bids`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all hover:shadow-md active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Bids
                          {(rfp.bid_count || 0) > 0 && (
                            <span className="bg-white/20 text-white rounded-md px-1.5 py-0.5 text-[10px] font-black">
                              {rfp.bid_count}
                            </span>
                          )}
                        </Link>
                        <Link
                          href={`/rfps/${rfp.id}`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View RFP
                        </Link>
                      </div>
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

export default function MyRFPsPage() {
  return (
    <ProtectedRoute allowedRoles={['sponsor']}>
      <MyRFPsContent />
    </ProtectedRoute>
  );
}
