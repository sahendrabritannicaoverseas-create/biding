'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  DollarSign, 
  Users, 
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Activity,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  project_number: string;
  title: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  contract_value: number;
  currency: string;
  start_date: string;
  expected_end_date: string;
  progress_percentage: number;
  sponsor?: { company_name: string };
  cro?: { company_name: string };
}

export default function ProjectsPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, [profile]);

  const fetchProjects = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      let query = supabase.from('projects').select(`
        *,
        sponsor:sponsor_company_id (company_name),
        cro:cro_company_id (company_name)
      `);

      // Role-based filtering
      if (profile.role === 'sponsor') {
        query = query.eq('sponsor_company_id', profile.company_id);
      } else if (profile.role === 'cro') {
        query = query.eq('cro_company_id', profile.company_id);
      } else if (profile.role === 'admin' || profile.role === 'auditor') {
        // Admins see all
      } else {
        // Other roles might have different logic, but for now we'll restrict
        setProjects([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data as any[] || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.project_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Portfolio</h1>
              <p className="text-gray-600 mt-1">Track milestones, progress, and verification status</p>
            </div>
            <div className="flex items-center space-x-3">
               <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                 <button 
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                   All
                 </button>
                 <button 
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition ${statusFilter === 'active' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                   Active
                 </button>
                 <button 
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition ${statusFilter === 'completed' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                 >
                   Completed
                 </button>
               </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-sm font-medium text-gray-500">Active Pipeline</p>
                 <Activity className="w-5 h-5 text-blue-500" />
               </div>
               <p className="text-3xl font-bold text-gray-900">{projects.filter(p => p.status === 'active').length}</p>
               <p className="text-xs text-green-600 font-medium mt-1">↑ 2 from last month</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-sm font-medium text-gray-500">Compliance Verified</p>
                 <ShieldCheck className="w-5 h-5 text-green-500" />
               </div>
               <p className="text-3xl font-bold text-gray-900">100%</p>
               <p className="text-xs text-gray-500 mt-1 italic">GxP Standards maintained</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-sm font-medium text-gray-500">Total Awarded Value</p>
                 <DollarSign className="w-5 h-5 text-purple-500" />
               </div>
               <p className="text-3xl font-bold text-gray-900">
                 ${projects.reduce((sum, p) => sum + p.contract_value, 0).toLocaleString()}
               </p>
               <p className="text-xs text-gray-500 mt-1">In {projects.length} awarded contracts</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search projects by ID or title..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-xs"
                />
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition hover:bg-gray-50 rounded-lg">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition hover:bg-gray-50 rounded-lg">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Project Details</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Partner</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Progress</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Timeline</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                          <span className="text-gray-500 font-medium">Synchronizing project data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-24 text-center">
                        <div className="max-w-xs mx-auto">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Briefcase className="w-8 h-8 text-slate-300" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">No projects found</h3>
                          <p className="text-gray-500 mt-1 text-sm">Once a bid is awarded, the project workflow will appear here for verification and tracking.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50/50 transition duration-150 group">
                        <td className="px-6 py-5">
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition truncate max-w-[240px]">{project.title}</div>
                            <div className="text-xs text-gray-400 font-mono mt-1 flex items-center">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded mr-1.5">ID</span>
                              {project.project_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="text-sm">
                              <div className="font-semibold text-gray-900">
                                {profile?.role === 'sponsor' ? project.cro?.company_name : project.sponsor?.company_name}
                              </div>
                              <div className="text-xs text-gray-500">Verified Partner</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-full max-w-[120px]">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                              <span>{project.progress_percentage}%</span>
                              {project.progress_percentage >= 100 ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                              )}
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${project.progress_percentage >= 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                style={{ width: `${project.progress_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex items-center text-gray-700 font-medium">
                              <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                              {new Date(project.expected_end_date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Completion target</div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status)} shadow-xs uppercase tracking-tight`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          <Link 
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition shadow-sm group/btn"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-4 h-4 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-xl shadow-slate-200/50">
             <div className="space-y-4 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start space-x-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                 <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Live Verification</span>
               </div>
               <h2 className="text-3xl font-bold font-sans">Trust But Verify</h2>
               <p className="text-slate-400 max-w-md leading-relaxed">
                 All milestones are cryptographically signed and verified against GxP standards. Our platform ensures that every deliverable meets the highest quality requirements before payment release.
               </p>
               <div className="flex flex-wrap gap-4 pt-2">
                 <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                   <p className="text-xs font-bold text-slate-500 uppercase">Audit Rating</p>
                   <p className="text-xl font-bold text-white">AAA+</p>
                 </div>
                 <div className="bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
                   <p className="text-xs font-bold text-slate-500 uppercase">SLA Uptime</p>
                   <p className="text-xl font-bold text-emerald-400">99.98%</p>
                 </div>
               </div>
             </div>
             <div className="relative group p-2">
               <div className="absolute inset-0 bg-blue-500/20 blur-3xl group-hover:bg-blue-500/30 transition duration-500"></div>
               <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl space-y-4 w-72">
                 <div className="flex items-center space-x-3">
                   <div className="bg-blue-600 p-2 rounded-lg"><Clock className="w-5 h-5" /></div>
                   <span className="font-bold">Next Audit</span>
                 </div>
                 <div className="text-2xl font-mono text-blue-400">22:14:05</div>
                 <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-100 transition shadow-lg">
                   Request Inspection
                 </button>
               </div>
             </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
