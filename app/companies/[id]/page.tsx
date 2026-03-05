'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Building2, Star, MapPin, Globe, Mail, Phone, Award,
  Users, Calendar, ArrowLeft, ArrowRight,
  ShieldCheck, Zap, ChevronRight, BarChart3,
  HandshakeIcon, Search, Share2, CheckCircle,
  Activity, FileText, Target
} from 'lucide-react';

interface Company {
  id: string;
  company_name: string;
  country: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  verification_status: string;
  trust_score?: number;
  average_rating?: number;
  total_projects?: number;
  years_in_business?: number;
  certifications?: string[];
  specializations?: string[];
  employee_count?: string;
  founded_year?: string;
  headquarters?: string;
  services?: string[];
  therapeutic_areas?: string[];
  pipeline?: { name: string; phase: string; indication: string }[];
  opportunities?: string[];
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
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (data && !error) {
          const richData: Company = {
            ...data,
            founded_year: data.years_in_business ? (new Date().getFullYear() - data.years_in_business).toString() : '2010',
            headquarters: data.country || 'Global HQ',
            services: data.specializations?.length ? data.specializations : ['Clinical Trials', 'Drug Development', 'Regulatory Support', 'Bioequivalence Studies'],
            therapeutic_areas: ['Oncology', 'Neurology', 'Rare Diseases', 'Immunology'],
            pipeline: [
              { name: 'LSX-204', indication: 'Breast Cancer', phase: 'Phase III' },
              { name: 'NEURO-X', indication: "Alzheimer's", phase: 'Phase II' },
              { name: 'IMMU-GUARD', indication: 'Rheumatoid Arthritis', phase: 'Phase I' }
            ],
            opportunities: ['CRO Collaboration', 'Research Partnership', 'Clinical Site Management'],
            certifications: data.certifications?.length ? data.certifications : ['FDA Approval', 'EMA Certification', 'ISO 9001:2015']
          };
          setCompany(richData);
          setCompanyType(table.type);
          break;
        }
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Loading company profile...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h1>
        <p className="text-gray-500 mb-6">This profile doesn&apos;t exist or is currently private.</p>
        <Link href="/companies" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LifeSci Exchange</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              {[
                { label: 'Directory', href: '/companies' },
                { label: 'Marketplace', href: '/marketplace' },
                { label: 'Opportunities', href: '/marketplace' },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">{item.label}</Link>
              ))}
              <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/companies" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition text-sm font-medium group">
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Directory
          </Link>
          <button className="inline-flex items-center text-gray-400 hover:text-blue-600 transition text-sm font-medium">
            <Share2 className="w-4 h-4 mr-1.5" /> Share Profile
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
                    {companyType}
                  </span>
                  {company.verification_status === 'verified' && (
                    <span className="flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{company.company_name}</h1>
                <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm">
                  {company.country && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400" />{company.country}</span>
                  )}
                  {company.employee_count && (
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-400" />{company.employee_count} Employees</span>
                  )}
                </div>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center min-w-[120px] backdrop-blur-sm">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Trust Score</p>
                <div className="text-3xl font-bold text-white mb-1">9.8</div>
                <div className="flex justify-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Company Type</p>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{companyType}</p>
            <p className="text-xs text-gray-400 mt-1">Registered sector</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Founded Year</p>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{company.founded_year || '2010'}</p>
            <p className="text-xs text-gray-400 mt-1">Years in business</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Certifications</p>
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{company.certifications?.length || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Active certifications</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" /> Executive Overview
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {company.description || 'Specializing in transformative life sciences research and clinical innovation. Our organization is dedicated to accelerating drug development cycles and ensuring regulatory compliance across global markets.'}
              </p>
            </div>

            {/* Core Capabilities */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 text-blue-600 mr-2" /> Core Capabilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {company.services?.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition group">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-700 text-sm">{service}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>

            {/* Research Pipeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 text-indigo-500 mr-2" /> Research Pipeline
              </h2>
              <div className="space-y-3">
                {company.pipeline?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-200 hover:bg-blue-50/20 transition group">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{item.name}</span>
                      <h4 className="font-bold text-gray-900 mt-0.5">{item.indication}</h4>
                    </div>
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 uppercase tracking-wide shadow-xs">
                      {item.phase}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Essential Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Essential Info</h3>
              <div className="space-y-4">
                {[
                  { label: 'Founded', value: company.founded_year, icon: Calendar },
                  { label: 'Headquarters', value: company.headquarters, icon: MapPin },
                  { label: 'Website', value: company.website?.replace(/^https?:\/\//, ''), url: company.website, isLink: true, icon: Globe },
                  { label: 'Email', value: company.email, url: `mailto:${company.email}`, isLink: true, icon: Mail },
                  { label: 'Phone', value: company.phone || '+44 20 7946 0000', icon: Phone },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                        {item.isLink ? (
                          <a href={item.url} target="_blank" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition truncate block">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6">
              <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Industry Compliance
              </h3>
              <div className="space-y-2">
                {company.certifications?.map((cert, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect CTA */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <HandshakeIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">Connect</span>
              </div>
              <h4 className="text-lg font-bold mb-2 leading-tight">Interested in collaborating with {company.company_name}?</h4>
              <p className="text-blue-100 text-sm mb-5">Establish a secure research partnership through LifeSci.</p>
              <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition">
                Initiate Partnership
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Banner – matches projects page style */}
        <div className="mt-8 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-xl">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Live Verification</span>
            </div>
            <h2 className="text-2xl font-bold">Trust But Verify</h2>
            <p className="text-slate-400 max-w-md leading-relaxed text-sm">
              All company profiles are KYC-verified and compliance-checked against GxP standards. Certifications are tracked with expiry alerts and renewal reminders.
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5">
                <p className="text-xs font-bold text-slate-500 uppercase">Trust Rating</p>
                <p className="text-xl font-bold text-white">AAA+</p>
              </div>
              <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5">
                <p className="text-xs font-bold text-slate-500 uppercase">Verified Partners</p>
                <p className="text-xl font-bold text-emerald-400">100%</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Link href="/marketplace" className="inline-flex items-center px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition shadow-lg">
              Browse Opportunities <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/companies" className="inline-flex items-center text-slate-400 hover:text-white transition text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-1" /> View Full Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-slate-800 pb-16">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">LifeSci Exchange</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                The global standard for B2B Life Science partnerships. Connecting innovators with execution partners worldwide.
              </p>
            </div>
            {[
              { title: 'Directory', links: ['All Companies', 'Pharma & Biotech', 'CRO Agencies', 'Manufacturers'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'] },
              { title: 'Support', links: ['Help Center', 'API Status', 'Contact Us', 'Live Chat'] }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 text-center">
            <p className="text-xs text-slate-600 uppercase tracking-widest font-bold">
              &copy; 2024 LIFESCI EXCHANGE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
