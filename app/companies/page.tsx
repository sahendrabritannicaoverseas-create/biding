'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Building2, Search, Filter, MapPin, Globe, Award, Microscope, FileText, Factory, Sparkles, TruckIcon, Star } from 'lucide-react';

type CompanyType = 'all' | 'sponsor' | 'cro' | 'manufacturer' | 'lab' | 'distributor';

interface Company {
  id: string; company_name: string; country: string; description: string;
  website: string; verification_status: string; trust_score?: number;
  average_rating?: number; type: CompanyType;
}

const companyTypeConfig = {
  sponsor: { label: 'Pharma & Biotech', icon: Microscope, color: 'text-blue-600 bg-blue-50' },
  cro: { label: 'CROs', icon: FileText, color: 'text-green-600 bg-green-50' },
  manufacturer: { label: 'Manufacturers', icon: Factory, color: 'text-orange-600 bg-orange-50' },
  lab: { label: 'Testing Labs', icon: Sparkles, color: 'text-yellow-600 bg-yellow-50' },
  distributor: { label: 'Distributors', icon: TruckIcon, color: 'text-cyan-600 bg-cyan-50' },
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<CompanyType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');

  useEffect(() => { fetchCompanies(); }, [selectedType]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const allCompanies: Company[] = [];
      const tables: Array<[string, CompanyType]> = [['sponsor_companies', 'sponsor'], ['cro_companies', 'cro'], ['manufacturer_companies', 'manufacturer'], ['lab_companies', 'lab'], ['distributor_companies', 'distributor']];
      for (const [table, type] of tables) {
        if (selectedType === 'all' || selectedType === type) {
          const { data } = await supabase.from(table).select('*').eq('verification_status', 'verified');
          if (data) allCompanies.push(...data.map(c => ({ ...c, type })));
        }
      }
      setCompanies(allCompanies);
    } catch (error) { console.error('Error fetching companies:', error); } finally { setLoading(false); }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || company.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || company.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = Array.from(new Set(companies.map(c => c.country))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2"><Building2 className="w-8 h-8 text-blue-600" /><span className="text-xl font-bold text-gray-900">LifeSci Exchange</span></Link>
            <div className="flex items-center space-x-6">
              <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 font-medium">Opportunities</Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
              <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">Verified Company Directory</h1>
          <p className="text-xl text-blue-100 mb-8">Browse and connect with verified life sciences companies worldwide</p>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search companies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
              <div className="relative"><Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><select value={selectedType} onChange={e => setSelectedType(e.target.value as CompanyType)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"><option value="all">All Company Types</option><option value="sponsor">Pharma & Biotech</option><option value="cro">CROs</option><option value="manufacturer">Manufacturers</option><option value="lab">Testing Labs</option><option value="distributor">Distributors</option></select></div>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"><option value="all">All Countries</option>{uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}</select></div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : (
          <>
            <div className="mb-6"><p className="text-gray-600">Showing <span className="font-semibold">{filteredCompanies.length}</span> verified companies</p></div>
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-16"><Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-xl text-gray-600">No companies found matching your criteria</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map(company => {
                  const config = companyTypeConfig[company.type as Exclude<CompanyType, 'all'>];
                  const Icon = config.icon;
                  return (
                    <div key={company.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${config.color} p-3 rounded-lg`}><Icon className="w-6 h-6" /></div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center"><Award className="w-3 h-3 mr-1" />Verified</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{company.company_name}</h3>
                      <p className="text-sm text-gray-500 mb-1">{config.label}</p>
                      <div className="flex items-center text-sm text-gray-600 mb-3"><MapPin className="w-4 h-4 mr-1" />{company.country}</div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{company.description || 'No description available'}</p>
                      {company.average_rating && company.average_rating > 0 && <div className="flex items-center mb-4"><Star className="w-4 h-4 text-yellow-500 fill-current" /><span className="text-sm font-semibold text-gray-900 ml-1">{company.average_rating.toFixed(1)}</span><span className="text-sm text-gray-500 ml-1">rating</span></div>}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"><Globe className="w-4 h-4 mr-1" />Website</a>}
                        <Link href={`/companies/${company.id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Profile →</Link>
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
