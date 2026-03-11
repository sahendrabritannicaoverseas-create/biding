'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Award, 
  Microscope, 
  FileText, 
  Factory, 
  Sparkles, 
  TruckIcon, 
  ArrowRight,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Layout } from '@/components/Layout';

type CompanyType = 'sponsor' | 'cro' | 'manufacturer' | 'lab' | 'distributor';

interface Company {
  id: string;
  company_name: string;
  country: string;
  description: string;
  website: string;
  verification_status: string;
  trust_score?: number;
  average_rating?: number;
  type: CompanyType;
}

const companyTypeConfig = {
  sponsor: { 
    label: 'Pharma & Biotech', 
    description: 'Leading research and development organizations',
    icon: Microscope, 
    color: 'blue' 
  },
  cro: { 
    label: 'Clinical Research (CRO)', 
    description: 'Expert research services for clinical excellence',
    icon: FileText, 
    color: 'emerald' 
  },
  manufacturer: { 
    label: 'Contract Manufacturing', 
    description: 'Specialized manufacturing and scaling solutions',
    icon: Factory, 
    color: 'orange' 
  },
  lab: { 
    label: 'Testing Labs', 
    description: 'Precision analytical and diagnostic services',
    icon: Sparkles, 
    color: 'purple' 
  },
  distributor: { 
    label: 'Global Distributors', 
    description: 'Logistics and supply chain partners',
    icon: TruckIcon, 
    color: 'sky' 
  },
};

export default function CompaniesSeparatedPage() {
  const [groupedCompanies, setGroupedCompanies] = useState<Record<CompanyType, Company[]>>({
    sponsor: [],
    cro: [],
    manufacturer: [],
    lab: [],
    distributor: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const tables: Array<[string, CompanyType]> = [
        ['sponsor_companies', 'sponsor'],
        ['cro_companies', 'cro'],
        ['manufacturer_companies', 'manufacturer'],
        ['lab_companies', 'lab'],
        ['distributor_companies', 'distributor']
      ];

      const newGroups: Record<CompanyType, Company[]> = {
        sponsor: [], cro: [], manufacturer: [], lab: [], distributor: [],
      };

      for (const [table, type] of tables) {
        const { data } = await supabase
          .from(table)
          .select('*')
          .eq('verification_status', 'verified')
          .limit(4); // Show top 4 in each category for the "separated" view
        
        if (data) {
          newGroups[type] = data.map(c => ({ ...c, type }));
        }
      }
      setGroupedCompanies(newGroups);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const ColorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/20",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20",
    orange: "bg-orange-50 text-orange-600 border-orange-100 ring-orange-500/20",
    purple: "bg-purple-50 text-purple-600 border-purple-100 ring-purple-500/20",
    sky: "bg-sky-50 text-sky-600 border-sky-100 ring-sky-500/20",
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="min-h-screen pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-gray-100">
          <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-6">
                Discover Verified <span className="text-blue-600">Partners</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect with pre-vetted life science organizations across specialized sectors. 
                Our community and verification processes ensure transparency and quality.
              </p>
            </div>
          </div>
        </section>
        {/* Separated Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-20">
          {(Object.keys(companyTypeConfig) as CompanyType[]).map((type) => {
            const config = companyTypeConfig[type];
            const companies = groupedCompanies[type];
            const Icon = config.icon;
            const colorClass = ColorStyles[config.color as keyof typeof ColorStyles];

            if (companies.length === 0) return null;

            return (
              <section key={type} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-end justify-between mb-8 pb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                       <div className={`p-2 rounded-lg ${colorClass} border`}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
                    </div>
                    <p className="text-gray-500">{config.description}</p>
                  </div>
                  <Link 
                    href={`/companies?type=${type}`}
                    className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 group transition"
                  >
                    View All {config.label}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {companies.map((company) => (
                    <div 
                      key={company.id} 
                      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                         <div className={`p-2 rounded-xl ${colorClass.split(' ')[0]} border border-transparent group-hover:border-current/10 transition-colors`}>
                           <Building2 className="w-6 h-6" />
                         </div>
                         {company.verification_status === 'verified' && (
                           <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                             <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                           </div>
                         )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                        {company.company_name}
                      </h3>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-3 font-medium">
                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                        {company.country}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-grow">
                        {company.description || 'Verified industry partner focusing on innovation and quality pharmaceutical solutions.'}
                      </p>

                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                        {company.website ? (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        ) : <div />}
                        
                        <Link 
                          href={`/companies/${company.id}`}
                          className="flex items-center text-xs font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          PROFILE <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
