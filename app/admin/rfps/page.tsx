'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  Building2, 
  MoreVertical,
  Calendar,
  XCircle,
  Eye
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
      // In a real app, you might want a join or a view
      const { data, error } = await supabase
        .from('rfps')
        .select(`
          *,
          sponsor_companies (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to handle the join structure
      const formattedRfps = data?.map((item: any) => ({
        ...item,
        sponsor: item.sponsor_companies
      })) || [];

      setRfps(formattedRfps);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
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

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RFP Management</h1>
              <p className="text-gray-600 mt-1">Monitor and manage platform opportunities</p>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-100">
                {rfps.length} Total RFPs
              </span>
              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium border border-green-100">
                {rfps.filter(r => r.status === 'active').length} Active
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by title or RFP number..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">RFP Details</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Sponsor</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Budget</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Deadline</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                          <span>Loading RFPs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRFPs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900">No RFPs found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRFPs.map((rfp) => (
                      <tr key={rfp.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{rfp.title}</div>
                            <div className="text-xs text-gray-500 font-mono mt-1">#{rfp.rfp_number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {rfp.sponsor?.company_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {rfp.budget_range_min ? (
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-0.5" />
                              {rfp.budget_range_min.toLocaleString()}
                            </span>
                          ) : 'Not disclosed'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(rfp.submission_deadline).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                            ${rfp.status === 'active' ? 'bg-green-100 text-green-700' : 
                              rfp.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {rfp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                             <Link 
                              href={`/rfps/${rfp.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View RFP"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            {rfp.status === 'active' && (
                              <button 
                                onClick={() => handleUpdateStatus(rfp.id, 'closed')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Close RFP"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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
