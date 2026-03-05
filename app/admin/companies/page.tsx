'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Shield, 
  ExternalLink,
  MoreVertical,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

type CompanyType = 'sponsor' | 'cro' | 'manufacturer' | 'lab' | 'distributor';

interface Company {
  id: string;
  company_name: string;
  country: string;
  verification_status: string;
  website?: string;
  type: CompanyType;
  created_at: string;
}

const companyTypeLabels: Record<CompanyType, string> = {
  sponsor: 'Pharma & Biotech',
  cro: 'CRO',
  manufacturer: 'Manufacturer',
  lab: 'Testing Lab',
  distributor: 'Distributor',
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const allCompanies: Company[] = [];
      const entries: Array<[string, CompanyType]> = [
        ['sponsor_companies', 'sponsor'],
        ['cro_companies', 'cro'],
        ['manufacturer_companies', 'manufacturer'],
        ['lab_companies', 'lab'],
        ['distributor_companies', 'distributor'],
      ];

      for (const [table, type] of entries) {
        const { data, error } = await supabase
          .from(table)
          .select('id, company_name, country, verification_status, website, created_at');
        
        if (data) {
          allCompanies.push(...data.map(c => ({ ...c, type })));
        }
      }

      // Sort by created_at descending (newest first)
      allCompanies.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setCompanies(allCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, type: CompanyType, status: string) => {
    try {
      const tableMap: Record<CompanyType, string> = {
        sponsor: 'sponsor_companies',
        cro: 'cro_companies',
        manufacturer: 'manufacturer_companies',
        lab: 'lab_companies',
        distributor: 'distributor_companies',
      };

      const { error } = await supabase
        .from(tableMap[type])
        .update({ verification_status: status })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCompanies(prev => prev.map(c => 
        (c.id === id && c.type === type) ? { ...c, verification_status: status } : c
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.verification_status === statusFilter;
    const matchesType = typeFilter === 'all' || company.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Companies</h1>
              <p className="text-gray-600 mt-1">Review and verify platform registrations</p>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-100">
                {companies.length} Total Companies
              </span>
              <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-medium border border-yellow-100">
                {companies.filter(c => c.verification_status === 'pending').length} Pending
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-1 md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by name or country..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="sponsor">Pharma & Biotech</option>
                  <option value="cro">CRO</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="lab">Testing Lab</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>
              <div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 pointer-events-none">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Company</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Country</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Registered</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                          <span>Loading companies...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900">No companies found</p>
                        <p className="text-gray-500">Adjust your filters to see more results</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((company) => (
                      <tr key={`${company.type}-${company.id}`} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 border border-blue-100">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{company.company_name}</div>
                              {company.website && (
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center mt-0.5">
                                  {company.website.replace(/^https?:\/\//, '')}
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {companyTypeLabels[company.type]}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {company.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(company.verification_status)} capitalize`}>
                            {company.verification_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(company.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {company.verification_status !== 'verified' && (
                              <button 
                                onClick={() => handleUpdateStatus(company.id, company.type, 'verified')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Verify Company"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            {company.verification_status !== 'rejected' && (
                              <button 
                                onClick={() => handleUpdateStatus(company.id, company.type, 'rejected')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Reject Registration"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                            <Link 
                              href={`/companies/${company.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View Public Profile"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </Link>
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
