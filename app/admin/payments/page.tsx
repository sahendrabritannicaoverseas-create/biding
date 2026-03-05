'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const paymentStats = [
    { label: 'Total Volume', value: '$1.24M', trend: '+12.5%', isUp: true },
    { label: 'Platform Revenue', value: '$62.4K', trend: '+8.2%', isUp: true },
    { label: 'Pending Payouts', value: '$45.2K', trend: '-2.4%', isUp: false },
    { label: 'Active Escrows', value: '18', trend: '+4', isUp: true },
  ];

  const transactions = [
    { id: 'TXN-001', company: 'GlobalPharma', type: 'Project Milestone', amount: 45000, status: 'Completed', date: 'Feb 28, 2024' },
    { id: 'TXN-002', company: 'Asia CRO', type: 'Platform Fee', amount: 500, status: 'Completed', date: 'Feb 27, 2024' },
    { id: 'TXN-003', company: 'MediGen Labs', type: 'Escrow Deposit', amount: 12500, status: 'Pending', date: 'Feb 26, 2024' },
    { id: 'TXN-004', company: 'BioNova', type: 'Milestone Payout', amount: 8400, status: 'Processing', date: 'Feb 25, 2024' },
    { id: 'TXN-005', company: 'Pacific Research', type: 'Platform Fee', amount: 500, status: 'Completed', date: 'Feb 24, 2024' },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
              <p className="text-gray-600 mt-1">Monitor transactions, revenue, and escrow accounts</p>
            </div>
            <button className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition drop-shadow-sm">
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paymentStats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <div className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded
                    ${stat.isUp ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}
                  >
                    {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters & Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-gray-900">Recent Transactions</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="Search transactions..." className="text-sm pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-64" />
                </div>
                <button className="p-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Company</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition cursor-pointer">
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">{txn.id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{txn.company}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{txn.type}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">${txn.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{txn.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center w-fit
                          ${txn.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                            txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}
                        >
                          {txn.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {txn.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                          {txn.status === 'Processing' && <TrendingUp className="w-3 h-3 mr-1" />}
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
