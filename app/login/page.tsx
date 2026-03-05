'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Building2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (
    role: 'sponsor' | 'cro' | 'manufacturer' | 'lab' | 'distributor' | 'auditor' | 'admin',
    email: string
  ) => {
    setError('');
    setLoading(true);
    const testPassword = 'demo123456';
    try {
      try {
        await signIn(email, testPassword);
      } catch (signInError) {
        const name = email.split('@')[0];
        await signUp(email, testPassword, role, name);
        await signIn(email, testPassword);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Auto-login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition">LifeSci Exchange</h1>
          </Link>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-3">Quick Demo Login - Click any company type:</p>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-1">Pharma Sponsors:</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'GlobalPharma', email: 'globalpharma@demo.com' },
                { label: 'MediGen', email: 'medigen@demo.com' },
                { label: 'NeuroSpecialty', email: 'neurospecialty@demo.com' },
                { label: 'BioNova', email: 'bionova@demo.com' },
              ].map((btn) => (
                <button key={btn.email} type="button" onClick={() => handleQuickLogin('sponsor', btn.email)}
                  disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-xs disabled:opacity-50">
                  {btn.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-700 mb-1">CROs:</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Asia CRO', email: 'asiacro@demo.com' },
                { label: 'OncoTrials', email: 'oncotrials@demo.com' },
                { label: 'BioPhase', email: 'biophase@demo.com' },
                { label: 'Pacific CRO', email: 'pacific@demo.com' },
              ].map((btn) => (
                <button key={btn.email} type="button" onClick={() => handleQuickLogin('cro', btn.email)}
                  disabled={loading} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-xs disabled:opacity-50">
                  {btn.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Manufacturers:</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Apex API', email: 'apexapi@demo.com' },
                { label: 'PharmaMfg', email: 'pharmamanufacture@demo.com' },
                { label: 'BioMfg Intl', email: 'biomanufacturing@demo.com' },
              ].map((btn) => (
                <button key={btn.email} type="button" onClick={() => handleQuickLogin('manufacturer', btn.email)}
                  disabled={loading} className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium text-xs disabled:opacity-50">
                  {btn.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Labs:</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Precision Lab', email: 'precisionbio@demo.com' },
                { label: 'StabilityTech', email: 'stability@demo.com' },
              ].map((btn) => (
                <button key={btn.email} type="button" onClick={() => handleQuickLogin('lab', btn.email)}
                  disabled={loading} className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium text-xs disabled:opacity-50">
                  {btn.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Distributors:</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'PharmaDistribute', email: 'pharmadistribute@demo.com' },
                { label: 'PharmaMarketing', email: 'pharmamarketing@demo.com' },
              ].map((btn) => (
                <button key={btn.email} type="button" onClick={() => handleQuickLogin('distributor', btn.email)}
                  disabled={loading} className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium text-xs disabled:opacity-50">
                  {btn.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => handleQuickLogin('admin', 'admin@demo.com')}
              disabled={loading} className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-medium text-sm disabled:opacity-50">
              Admin Account
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or sign in with your account</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your password" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
