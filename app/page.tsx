'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Microscope,
  Factory,
  TruckIcon,
  FileText,
  TrendingUp,
  Shield,
  Globe,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    companies: 0,
    projects: 0,
    countries: 0,
    activeRFPs: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Use server-side API route to bypass browser-side RLS policy recursion
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const data = await res.json();
      setStats({
        companies: data.companies || 0,
        projects: data.projects || 0,
        countries: data.countries || 0,
        activeRFPs: data.activeRFPs || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const platformStats = [
    { label: 'Active Companies', value: stats.companies > 0 ? `${stats.companies}` : '18+', icon: Building2 },
    { label: 'Projects Completed', value: stats.projects > 0 ? `${stats.projects.toLocaleString()}+` : '1,200+', icon: CheckCircle },
    { label: 'Countries', value: stats.countries > 0 ? `${stats.countries}+` : '15+', icon: Globe },
    { label: 'Total Value', value: '$250M+', icon: TrendingUp },
  ];

  const companyTypes = [
    { title: 'Pharma & Biotech', description: 'Post clinical trial requirements, find manufacturing partners, secure distribution rights', icon: Microscope, color: 'bg-blue-500', examples: ['Phase I-IV Trials', 'BA/BE Studies', 'API Sourcing'] },
    { title: 'CROs & Research', description: 'Bid on clinical trials, preclinical studies, bioanalysis, and regulatory consulting', icon: FileText, color: 'bg-green-500', examples: ['GCP Certified', 'Multi-site Studies', 'Fast Enrollment'] },
    { title: 'Manufacturers', description: 'Offer contract manufacturing, API production, finished dosage forms to global buyers', icon: Factory, color: 'bg-orange-500', examples: ['WHO-GMP', 'EU-GMP', 'US FDA Approved'] },
    { title: 'Testing Labs', description: 'Provide calibration, validation, stability, bio-compatibility testing services', icon: Sparkles, color: 'bg-yellow-500', examples: ['NABL Accredited', 'ISO 17025', 'Quick Turnaround'] },
    { title: 'Distributors & Marketers', description: 'Secure country rights, marketing partnerships, import/export opportunities', icon: TruckIcon, color: 'bg-cyan-500', examples: ['Multi-Country Network', 'Regulatory Expertise', 'Established Channels'] },
    { title: 'Medical Devices', description: 'Find validation partners, testing facilities, and distribution networks', icon: Shield, color: 'bg-slate-500', examples: ['Device Testing', 'CE Marking', 'FDA 510(k)'] },
  ];

  const howItWorks = [
    { step: 1, title: 'Post Your Requirement', description: 'Create detailed RFPs for clinical trials, manufacturing, testing, or distribution needs', icon: FileText },
    { step: 2, title: 'Receive Competitive Bids', description: 'Verified vendors submit proposals with technical and commercial details', icon: TrendingUp },
    { step: 3, title: 'Compare & Select', description: 'Evaluate bids based on cost, timeline, certifications, and past ratings', icon: CheckCircle },
    { step: 4, title: 'Execute & Track', description: 'Manage projects, milestones, payments, and compliance in one platform', icon: Users },
  ];

  const trustFeatures = [
    'Company KYC & Verification', 'Certification Validation', 'Inspection History Tracking',
    'Rating & Review System', 'Audit Trail & Compliance', 'Secure Document Storage',
    'Escrow Payment Protection', 'Regulatory Compliance Tools',
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LifeSci Exchange</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 font-medium">Browse Opportunities</Link>
              <Link href="/companies" className="text-gray-700 hover:text-blue-600 font-medium">Find Companies</Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
              <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20 bg-linear-to-br from-blue-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              The Global B2B Marketplace for<span className="text-blue-600"> Life Sciences</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect pharma companies, CROs, manufacturers, testing labs, and distributors worldwide. Post requirements, receive competitive bids, and execute deals with verified partners.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/signup" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition text-lg">
                <span>Join the Platform</span><ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/marketplace" className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition text-lg border-2 border-blue-600">
                <span>Browse Opportunities</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {platformStats.map((stat) => { const Icon = stat.icon; return (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Who Uses LifeSci Exchange?</h2>
            <p className="text-xl text-gray-600">A comprehensive platform serving every segment of the life sciences industry</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyTypes.map((type) => { const Icon = type.icon; return (
              <div key={type.title} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition group">
                <div className={`${type.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{type.description}</p>
                <div className="space-y-2">
                  {type.examples.map((example) => (
                    <div key={example} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span>{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">From requirement to execution, manage everything in one platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => { const Icon = item.icon; return (
              <div key={item.step} className="text-center">
                <div className="relative">
                  <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                </div>
                <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Trust & Compliance at Every Step</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">LifeSci Exchange is built specifically for regulated industries. We understand the critical importance of verification, compliance, and audit trails in life sciences.</p>
              <div className="grid grid-cols-2 gap-4">
                {trustFeatures.map((feature) => (
                  <div key={feature} className="flex items-start">
                    <Shield className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-linear-to-br from-blue-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
              <div className="space-y-6">
                {[
                  { title: 'Company Verification', text: 'All companies undergo KYC verification and document validation before accessing the platform' },
                  { title: 'Certification Tracking', text: 'GCP, GMP, ISO, NABL certifications are tracked with expiry alerts and renewal reminders' },
                  { title: 'Audit Trail', text: 'Immutable audit logs track every action for regulatory compliance and transparency' },
                ].map((item) => (
                  <div key={item.title} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">{item.title}</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Join the Global Life Sciences Network?</h2>
          <p className="text-xl text-blue-100 mb-8">Whether you&apos;re looking to post requirements or bid on opportunities, get started in minutes</p>
          <Link href="/signup" className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition text-lg">
            <span>Create Free Account</span><ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <span className="text-lg font-bold text-white">LifeSci Exchange</span>
              </div>
              <p className="text-sm text-gray-400">The global B2B marketplace connecting life sciences companies worldwide</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/marketplace" className="hover:text-white">Browse Opportunities</Link></li>
                <li><Link href="/companies" className="hover:text-white">Find Companies</Link></li>
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Trust & Safety</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
                <li><a href="#" className="hover:text-white">Support Center</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 LifeSci Exchange. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
