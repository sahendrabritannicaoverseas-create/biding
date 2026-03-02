'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { FileText, Search, Filter, Calendar, MapPin, ArrowRight } from 'lucide-react';

function RFPListContent() {
  const { profile } = useAuth();
  const [rfps, setRfps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile) fetchRFPs();
  }, [profile]);

  const fetchRFPs = async () => {
    try {
      let query = supabase.from('rfps').select('*').order('created_at', { ascending: false });
      if (profile?.role === 'sponsor') {
        query = query.eq('sponsor_company_id', profile.company_id);
      } else if (['cro', 'manufacturer', 'lab', 'distributor'].includes(profile?.role || '')) {
        query = query.eq('status', 'active').eq('is_invite_only', false);
      }
      const { data, error } = await query;
      if (error) throw error;
      setRfps(data || []);
    } catch (error) {
      console.error('Error fetching RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRfps = rfps.filter(
    (rfp) =>
      rfp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.rfp_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.study_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile?.role === 'sponsor' ? 'My RFPs' : 'Available RFPs'}</h1>
            <p className="text-gray-600 mt-1">{profile?.role === 'sponsor' ? 'Manage your requests for proposals' : 'Browse and bid on active RFPs'}</p>
          </div>
          {profile?.role === 'sponsor' && (
            <Link href="/rfps/create" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
              <FileText className="w-5 h-5" /><span>Create RFP</span>
            </Link>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search RFPs by title, number, or study type..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <button className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
              <Filter className="w-5 h-5" /><span>Filters</span>
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredRfps.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No RFPs found</h3>
            <p className="text-gray-600">{searchTerm ? 'Try adjusting your search criteria' : profile?.role === 'sponsor' ? 'Create your first RFP to get started' : 'Check back later for new opportunities'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRfps.map((rfp) => (
              <Link key={rfp.id} href={`/rfps/${rfp.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">{rfp.title}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${rfp.status === 'active' ? 'bg-green-100 text-green-700' : rfp.status === 'draft' ? 'bg-gray-100 text-gray-700' : rfp.status === 'awarded' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {rfp.status?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-3">RFP #{rfp.rfp_number}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-2">{rfp.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600"><FileText className="w-4 h-4" /><span className="font-medium">{rfp.study_type}</span></div>
                      <div className="flex items-center space-x-2 text-gray-600"><MapPin className="w-4 h-4" /><span>{rfp.target_geography?.join(', ')}</span></div>
                      <div className="flex items-center space-x-2 text-gray-600"><Calendar className="w-4 h-4" /><span>Deadline: {new Date(rfp.submission_deadline).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition flex-shrink-0 ml-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function RFPsPage() {
  return (
    <ProtectedRoute>
      <RFPListContent />
    </ProtectedRoute>
  );
}
