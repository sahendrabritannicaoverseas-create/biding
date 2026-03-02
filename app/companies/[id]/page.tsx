'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Building2, MapPin, Globe, Mail, Phone, Award,
  Star, Users, Calendar, ArrowLeft, ExternalLink,
} from 'lucide-react';

interface Company {
  id: string; company_name: string; country: string; description: string;
  website?: string; email?: string; phone?: string; verification_status: string;
  trust_score?: number; average_rating?: number; total_projects?: number;
  years_in_business?: number; certifications?: string[]; specializations?: string[];
  employee_count?: string;
}

export default function CompanyProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [companyType, setCompanyType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) fetchCompanyProfile(); }, [id]);

  const fetchCompanyProfile = async () => {
    const tables = [
      { name: 'sponsor_companies', type: 'Pharma & Biotech' },
      { name: 'cro_companies', type: 'CRO' },
      { name: 'manufacturer_companies', type: 'Manufacturer' },
      { name: 'lab_companies', type: 'Testing Lab' },
      { name: 'distributor_companies', type: 'Distributor' },
    ];
    try {
      for (const table of tables) {
        const { data, error } = await supabase.from(table.name).select('*').eq('id', id).eq('verification_status', 'verified').maybeSingle();
        if (data && !error) { setCompany(data); setCompanyType(table.type); break; }
      }
    } catch (error) { console.error('Error fetching company profile:', error); } finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const NavBar = () => (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2"><Building2 className="w-8 h-8 text-blue-600" /><span className="text-xl font-bold text-gray-900">LifeSci Exchange</span></Link>
          <div className="flex items-center space-x-6">
            <Link href="/companies" className="text-gray-700 hover:text-blue-600 font-medium">Directory</Link>
            <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 font-medium">Opportunities</Link>
            <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
          </div>
        </div>
      </div>
    </nav>
  );

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h1>
          <p className="text-gray-600 mb-6">The company you&apos;re looking for doesn&apos;t exist or is not verified.</p>
          <Link href="/companies" className="text-blue-600 hover:text-blue-700 font-semibold">Back to Directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/companies" className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium mb-6">
          <ArrowLeft className="w-5 h-5" /><span>Back to Directory</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h1 className="text-4xl font-bold text-white">{company.company_name}</h1>
                  <span className="px-4 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-full flex items-center">
                    <Award className="w-4 h-4 mr-1" />Verified
                  </span>
                </div>
                <p className="text-xl text-blue-100 mb-2">{companyType}</p>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center space-x-2"><MapPin className="w-5 h-5" /><span>{company.country}</span></div>
                  {company.years_in_business && <div className="flex items-center space-x-2"><Calendar className="w-5 h-5" /><span>{company.years_in_business} years in business</span></div>}
                </div>
              </div>
              {company.average_rating && company.average_rating > 0 && (
                <div className="bg-white rounded-lg px-6 py-4 text-center">
                  <div className="flex items-center justify-center mb-1"><Star className="w-6 h-6 text-yellow-500 fill-current" /><span className="text-3xl font-bold text-gray-900 ml-2">{company.average_rating.toFixed(1)}</span></div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* About */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{company.description || 'No description available.'}</p>
            </div>

            {/* Stats */}
            {(company.total_projects || company.employee_count || company.trust_score) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {company.total_projects && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-2"><Award className="w-6 h-6 text-blue-600" /><p className="text-sm font-medium text-gray-600">Total Projects</p></div>
                    <p className="text-3xl font-bold text-gray-900">{company.total_projects}</p>
                  </div>
                )}
                {company.employee_count && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-2"><Users className="w-6 h-6 text-green-600" /><p className="text-sm font-medium text-gray-600">Employees</p></div>
                    <p className="text-3xl font-bold text-gray-900">{company.employee_count}</p>
                  </div>
                )}
                {company.trust_score && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-2"><Star className="w-6 h-6 text-yellow-600" /><p className="text-sm font-medium text-gray-600">Trust Score</p></div>
                    <p className="text-3xl font-bold text-gray-900">{company.trust_score}/100</p>
                  </div>
                )}
              </div>
            )}

            {/* Specializations */}
            {company.specializations && company.specializations.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-3">
                  {company.specializations.map((spec, index) => (
                    <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">{spec}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {company.certifications && company.certifications.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Certifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {company.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-green-50 rounded-lg p-4">
                      <Award className="w-5 h-5 text-green-600 shrink-0" /><span className="text-sm font-medium text-gray-900">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-blue-600 hover:text-blue-700">
                    <Globe className="w-5 h-5" /><span className="font-medium">{company.website}</span><ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {company.email && (
                  <a href={`mailto:${company.email}`} className="flex items-center space-x-3 text-gray-700 hover:text-gray-900">
                    <Mail className="w-5 h-5" /><span className="font-medium">{company.email}</span>
                  </a>
                )}
                {company.phone && (
                  <a href={`tel:${company.phone}`} className="flex items-center space-x-3 text-gray-700 hover:text-gray-900">
                    <Phone className="w-5 h-5" /><span className="font-medium">{company.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Interested in working together?</h3>
              <p className="text-gray-700 mb-4">Sign up to access our platform and connect with verified companies.</p>
              <div className="flex items-center space-x-4">
                <Link href="/signup" className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">Get Started</Link>
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign In</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
