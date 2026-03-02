'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2,
  Home,
  FileText,
  Users,
  DollarSign,
  LogOut,
  Menu,
  X,
  Bell,
  Award,
  TrendingUp,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getNavigationItems = () => {
    switch (profile?.role) {
      case 'sponsor':
        return [
          { icon: Home, label: 'Dashboard', path: '/dashboard' },
          { icon: FileText, label: 'My RFPs', path: '/sponsor/my-rfps' },
          { icon: FileText, label: 'Create RFP', path: '/sponsor/create-rfp' },
          { icon: TrendingUp, label: 'Browse RFPs', path: '/rfps' },
          { icon: CheckCircle, label: 'Projects', path: '/projects' },
          { icon: DollarSign, label: 'Payments', path: '/payments' },
        ];
      case 'cro':
      case 'manufacturer':
      case 'lab':
      case 'distributor':
        return [
          { icon: Home, label: 'Dashboard', path: '/dashboard' },
          { icon: FileText, label: 'Browse RFPs', path: '/rfps' },
          { icon: TrendingUp, label: 'My Bids', path: '/bids' },
          { icon: CheckCircle, label: 'Projects', path: '/projects' },
          { icon: Award, label: 'Certifications', path: '/certifications' },
          { icon: DollarSign, label: 'Invoices', path: '/invoices' },
        ];
      case 'admin':
        return [
          { icon: Home, label: 'Dashboard', path: '/dashboard' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: Building2, label: 'Companies', path: '/admin/companies' },
          { icon: FileText, label: 'RFPs', path: '/admin/rfps' },
          { icon: Shield, label: 'Compliance', path: '/admin/compliance' },
          { icon: DollarSign, label: 'Payments', path: '/admin/payments' },
        ];
      case 'auditor':
        return [
          { icon: Home, label: 'Dashboard', path: '/dashboard' },
          { icon: FileText, label: 'RFPs', path: '/rfps' },
          { icon: CheckCircle, label: 'Projects', path: '/projects' },
          { icon: Shield, label: 'Audit Logs', path: '/audit-logs' },
          { icon: Award, label: 'Compliance', path: '/compliance' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">CRO BidExchange</h1>
                  <p className="text-xs text-gray-500">{profile?.role?.toUpperCase()}</p>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
