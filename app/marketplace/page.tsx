'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Building2, Search, Filter, MapPin, Clock, DollarSign, FileText, Microscope, Factory, Sparkles, TruckIcon, Users, Calendar } from 'lucide-react';

interface RFP {
  id: string; rfp_number: string; title: string; description: string;
  requirement_category: string; study_type: string; target_geography: string[];
  budget_range_min: number; budget_range_max: number; is_budget_visible: boolean;
  submission_deadline: string; bids_count: number; created_at: string;
}

type CategoryFilter = 'all' | 'clinical_trial' | 'manufacturing' | 'lab_testing' | 'marketing_distribution' | 'device_validation';

export default function MarketplacePage() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  useEffect(() => { fetchRFPs(); }, []);

  const fetchRFPs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('rfps').select('*').eq('status', 'active').eq('is_invite_only', false).order('created_at', { ascending: false });
      if (error) throw error;
      setRfps(data || []);
    } catch (error) { console.error('Error fetching RFPs:', error); } finally { setLoading(false); }
  };

  const filteredRFPs = rfps.filter(rfp => {
    const matchesSearch = rfp.title.toLowerCase().includes(searchQuery.toLowerCase()) || rfp.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rfp.requirement_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
    clinical_trial: { label: 'Clinical Trials', icon: Microscope, color: 'text-blue-600 bg-blue-50' },
    manufacturing: { label: 'Manufacturing', icon: Factory, color: 'text-orange-600 bg-orange-50' },
    lab_testing: { label: 'Lab Testing', icon: Sparkles, color: 'text-yellow-600 bg-yellow-50' },
    marketing_distribution: { label: 'Marketing & Distribution', icon: TruckIcon, color: 'text-cyan-600 bg-cyan-50' },
    device_validation: { label: 'Device Validation', icon: FileText, color: 'text-slate-600 bg-slate-50' },
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const diffTime = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2"><Building2 className="w-8 h-8 text-blue-600" /><span className="text-xl font-bold text-gray-900">LifeSci Exchange</span></Link>
            <div className="flex items-center space-x-6">
              <Link href="/companies" className="text-gray-700 hover:text-blue-600 font-medium">Companies</Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
              <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Global Opportunities Marketplace</h1>
          <p className="text-xl text-blue-100 mb-8">Discover and bid on requirements from verified companies worldwide</p>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search opportunities..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
              <div className="relative"><Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value as CategoryFilter)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"><option value="all">All Categories</option><option value="clinical_trial">Clinical Trials</option><option value="manufacturing">Manufacturing</option><option value="lab_testing">Lab Testing</option><option value="marketing_distribution">Marketing & Distribution</option><option value="device_validation">Device Validation</option></select></div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center"><p className="text-gray-600">Showing <span className="font-semibold">{filteredRFPs.length}</span> active opportunities</p><div className="text-sm text-gray-500">Sign in to submit bids and access full details</div></div>
            {filteredRFPs.length === 0 ? (
              <div className="text-center py-16"><FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-xl text-gray-600">No opportunities found matching your criteria</p></div>
            ) : (
              <div className="space-y-6">
                {filteredRFPs.map(rfp => {
                  const config = categoryConfig[rfp.requirement_category] || categoryConfig.clinical_trial;
                  const Icon = config.icon;
                  const daysLeft = getDaysUntilDeadline(rfp.submission_deadline);
                  return (
                    <div key={rfp.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
                      <div className="flex items-start space-x-4">
                        <div className={`${config.color} p-3 rounded-lg flex-shrink-0`}><Icon className="w-6 h-6" /></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2"><h3 className="text-xl font-bold text-gray-900">{rfp.title}</h3><span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Open</span></div>
                          <p className="text-sm text-gray-500 mb-3">{config.label} • RFP #{rfp.rfp_number}</p>
                          <p className="text-gray-700 line-clamp-2 mb-4">{rfp.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center text-sm text-gray-600"><MapPin className="w-4 h-4 mr-2 text-gray-400" /><span>{rfp.target_geography?.join(', ')}</span></div>
                            <div className="flex items-center text-sm text-gray-600"><Users className="w-4 h-4 mr-2 text-gray-400" /><span>{rfp.bids_count || 0} bids</span></div>
                            <div className="flex items-center text-sm text-gray-600"><Calendar className="w-4 h-4 mr-2 text-gray-400" /><span>{daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</span></div>
                            {rfp.is_budget_visible && rfp.budget_range_min && <div className="flex items-center text-sm text-gray-600"><DollarSign className="w-4 h-4 mr-2 text-gray-400" /><span>${rfp.budget_range_min.toLocaleString()} - ${rfp.budget_range_max?.toLocaleString()}</span></div>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                        <div className="flex items-center text-sm text-gray-500"><Clock className="w-4 h-4 mr-1" />Posted {new Date(rfp.created_at).toLocaleDateString()}</div>
                        <Link href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm">Sign in to bid</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
