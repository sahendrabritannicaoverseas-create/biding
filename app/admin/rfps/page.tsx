'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { 
  FileText, 
  Search, 
  Clock, 
  DollarSign, 
  MoreVertical,
  XCircle,
  Eye,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  LayoutList
} from 'lucide-react';
import Link from 'next/link';

interface RFP {
  id: string;
  rfp_number: string;
  title: string;
  status: string;
  requirement_category: string;
  budget_range_min?: number;
  budget_range_max?: number;
  submission_deadline: string;
  created_at: string;
  sponsor?: {
    company_name: string;
  };
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; icon: any }> = {
  active: {
    label: 'Active',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    icon: CheckCircle2,
  },
  draft: {
    label: 'Draft',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    icon: FileText,
  },
  closed: {
    label: 'Closed',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-400',
    icon: XCircle,
  },
};

export default function AdminRFPsPage() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    setLoading(true);
    try {
      // Fetch RFPs without the join first to avoid RLS recursion issues
      const { data: rfpData, error: rfpError } = await supabase
        .from('rfps')
        .select('*')
        .order('created_at', { ascending: false });

      if (rfpError) {
        console.error('Supabase error fetching RFPs:', rfpError);
        throw rfpError;
      }

      if (!rfpData || rfpData.length === 0) {
        setRfps([]);
        return;
      }

      // Collect unique sponsor_company_ids
      const sponsorIds = [...new Set(rfpData.map((r: any) => r.sponsor_company_id).filter(Boolean))];

      let sponsorMap: Record<string, string> = {};
      if (sponsorIds.length > 0) {
        const { data: sponsorData } = await supabase
          .from('sponsor_companies')
          .select('id, company_name')
          .in('id', sponsorIds);

        if (sponsorData) {
          sponsorData.forEach((s: any) => { sponsorMap[s.id] = s.company_name; });
        }
      }

      // Merge sponsor names into RFP records
      const merged = rfpData.map((rfp: any) => ({
        ...rfp,
        sponsor: rfp.sponsor_company_id ? { company_name: sponsorMap[rfp.sponsor_company_id] || '—' } : null,
      }));

      setRfps(merged);
    } catch (error: any) {
      console.error('Error fetching RFPs:', error.message || error);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('rfps')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setRfps(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (error) {
      console.error('Error updating RFP status:', error);
      alert('Failed to update RFP status');
    }
  };

  const filteredRFPs = rfps.filter(rfp => {
    const matchesSearch = rfp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         rfp.rfp_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = rfps.filter(r => r.status === 'active').length;
  const draftCount = rfps.filter(r => r.status === 'draft').length;
  const closedCount = rfps.filter(r => r.status === 'closed').length;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-2">Admin Dashboard</p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">RFP Management</h1>
              <p className="text-slate-400 mt-1 font-medium">Monitor and manage all platform opportunities</p>
            </div>
          </div>

          {/* Stats Bar - Color coded */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total RFPs', value: rfps.length, icon: LayoutList, bg: 'bg-[#1E293B]', text: 'text-white', sub: 'text-slate-400', iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10' },
              { label: 'Active', value: activeCount, icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-900', sub: 'text-emerald-600', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
              { label: 'Draft', value: draftCount, icon: FileText, bg: 'bg-slate-50', text: 'text-slate-900', sub: 'text-slate-500', iconColor: 'text-slate-500', iconBg: 'bg-slate-100' },
              { label: 'Closed', value: closedCount, icon: XCircle, bg: 'bg-red-50', text: 'text-red-900', sub: 'text-red-500', iconColor: 'text-red-500', iconBg: 'bg-red-100' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 border border-white/5 shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-sm font-semibold ${stat.sub}`}>{stat.label}</p>
                  <div className={`w-8 h-8 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
              </div>
            ))}
          </div>


          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by title or RFP number..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
                />
              </div>
              <div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-600"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* RFP Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest">RFP Registry</p>
              <p className="text-xs font-bold text-slate-400">{filteredRFPs.length} results</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80">
                  <tr>
                    {['RFP Details', 'Sponsor', 'Budget', 'Deadline', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Syncing Data</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRFPs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <FileText className="w-10 h-10 mx-auto text-slate-200 mb-4" />
                        <p className="text-sm font-black text-slate-400">No RFPs Found</p>
                        <p className="text-xs text-slate-300 mt-1">Try changing the search or filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRFPs.map((rfp) => {
                      const sc = statusConfig[rfp.status] || statusConfig['draft'];
                      const StatusIcon = sc.icon;
                      return (
                        <tr key={rfp.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="px-6 py-5">
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{rfp.title}</div>
                              <div className="text-[10px] text-slate-400 font-black tracking-widest mt-1 font-mono">#{rfp.rfp_number}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-semibold text-slate-600">
                              {rfp.sponsor?.company_name || <span className="text-slate-300">—</span>}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            {rfp.budget_range_min ? (
                              <div className="flex items-center text-sm font-semibold text-slate-700">
                                <DollarSign className="w-3 h-3 text-emerald-500 mr-0.5" />
                                {rfp.budget_range_min.toLocaleString()}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300 font-bold">Not disclosed</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-3.5 h-3.5 text-slate-300" />
                              <span className="text-sm font-semibold text-slate-600">
                                {rfp.submission_deadline ? new Date(rfp.submission_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg ${sc.bg}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></div>
                              <span className={`text-[10px] font-black uppercase tracking-wider ${sc.text}`}>{sc.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end space-x-1">
                              <Link 
                                href={`/rfps/${rfp.id}`}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View RFP"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              {rfp.status === 'active' && (
                                <button 
                                  onClick={() => handleUpdateStatus(rfp.id, 'closed')}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                  title="Close RFP"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button className="p-2 text-slate-300 hover:bg-slate-100 rounded-lg transition">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
