'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Shield, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Activity,
  Award,
  Package,
  Layers,
  MessageSquare,
  Lock,
  XCircle
} from 'lucide-react';

interface Project {
  id: string;
  project_number: string;
  title: string;
  status: string;
  contract_value: number;
  currency: string;
  start_date: string;
  expected_end_date: string;
  progress_percentage: number;
  sponsor_company_id: string;
  cro_company_id: string;
  sponsor?: { company_name: string };
  cro?: { company_name: string };
}

interface Milestone {
  id: string;
  milestone_number: number;
  title: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  payment_amount: number;
  due_date: string;
  description: string;
  deliverables?: string[];
  deliverable_urls?: string[];
  rejection_reason?: string;
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchProjectData();
  }, [id, profile]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          sponsor:sponsor_company_id (company_name),
          cro:cro_company_id (company_name)
        `)
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData as any);

      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', id)
        .order('milestone_number', { ascending: true });

      if (milestonesError) throw milestonesError;
      setMilestones(milestonesData || []);
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: 'submitted' | 'approved' | 'rejected', reason?: string) => {
    setSubmitting(true);
    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
      
      if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (newStatus === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      } else {
        updateData.rejected_at = new Date().toISOString();
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('milestones')
        .update(updateData)
        .eq('id', milestoneId);

      if (error) throw error;

      // Update local state
      setMilestones(prev => prev.map(m => 
        m.id === milestoneId ? { ...m, ...updateData } : m
      ));

      // Re-calculate project progress if approved
      if (newStatus === 'approved') {
        const approvedCount = milestones.filter(m => m.id === milestoneId || m.status === 'approved').length;
        const progress = Math.round((approvedCount / milestones.length) * 100);
        await supabase.from('projects').update({ progress_percentage: progress }).eq('id', id);
        setProject(prev => prev ? { ...prev, progress_percentage: progress } : null);
      }

    } catch (error) {
      console.error('Error updating milestone:', error);
      alert('Failed to update milestone status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </Layout>
  );

  if (!project) return (
    <Layout>
      <div className="text-center py-20">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go back</button>
      </div>
    </Layout>
  );

  const canVerify = profile?.role === 'sponsor' || profile?.role === 'admin';

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8 pb-20">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                  project.status === 'active' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-gray-500 mt-1 font-mono text-sm uppercase">#{project.project_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Overview */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Project Vitality
                  </h3>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-600">{project.progress_percentage}%</span>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Complete</p>
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-8 border border-slate-200 p-0.5">
                  <div 
                    className="h-full bg-linear-to-r from-blue-600 via-blue-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-lg shadow-blue-200/50"
                    style={{ width: `${project.progress_percentage}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Award className="w-5 h-5 text-indigo-500 mt-1" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Value</p>
                      <p className="text-lg font-bold text-gray-900">${project.contract_value.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Calendar className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Goal</p>
                      <p className="text-lg font-bold text-gray-900">{new Date(project.expected_end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Package className="w-5 h-5 text-emerald-500 mt-1" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Milestones</p>
                      <p className="text-lg font-bold text-gray-900">{milestones.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones Flow */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                    <Layers className="w-6 h-6 mr-3 text-blue-600" />
                    Milestone Governance
                  </h3>
                  <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>LIVE UPDATES</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {milestones.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-500 font-medium italic">
                      No milestones mapped to this project registry.
                    </div>
                  ) : (
                    milestones.map((milestone, idx) => (
                      <div 
                        key={milestone.id} 
                        className={`bg-white rounded-3xl p-6 border-2 transition duration-300 relative overflow-hidden group
                          ${milestone.status === 'approved' ? 'border-green-100' : 
                            milestone.status === 'submitted' ? 'border-blue-200 bg-blue-50/20' : 
                            milestone.status === 'rejected' ? 'border-red-100' : 'border-gray-100'}`}
                      >
                         <div className="absolute top-0 right-0 p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                              ${milestone.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' : 
                                milestone.status === 'submitted' ? 'bg-blue-600 text-white border-blue-700 animate-pulse' : 
                                milestone.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                            >
                              {milestone.status}
                            </span>
                         </div>

                         <div className="flex items-start gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0
                              ${milestone.status === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-900 text-white'}`}
                            >
                              {milestone.milestone_number}
                            </div>
                            <div className="flex-1">
                               <h4 className="text-lg font-extrabold text-gray-900 mb-1">{milestone.title}</h4>
                               <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-xl">{milestone.description}</p>
                               
                               <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 mb-6">
                                  <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5" /> DUE {new Date(milestone.due_date).toLocaleDateString()}</div>
                                  <div className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1.5" /> ${milestone.payment_amount.toLocaleString()}</div>
                               </div>

                               {milestone.status === 'submitted' && (
                                 <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                   <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center space-x-2">
                                         <Shield className="w-5 h-5 text-blue-600" />
                                         <span className="text-sm font-black text-gray-900 uppercase">Verification Hub</span>
                                      </div>
                                      <span className="text-[10px] text-gray-400 font-bold uppercase">Pending Audit</span>
                                   </div>
                                   <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                                      Verified deliverables have been uploaded by the CRO. Please review the documentation and certify completion to release payment.
                                   </p>
                                   
                                   {canVerify && (
                                     <div className="flex space-x-3">
                                        <button 
                                          onClick={() => handleUpdateMilestoneStatus(milestone.id, 'approved')}
                                          disabled={submitting}
                                          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          VERIFY & RELEASE
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const reason = prompt('Reason for rejection:');
                                            if (reason) handleUpdateMilestoneStatus(milestone.id, 'rejected', reason);
                                          }}
                                          disabled={submitting}
                                          className="px-6 border-2 border-slate-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center disabled:opacity-50"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          REJECT
                                        </button>
                                     </div>
                                   )}
                                 </div>
                               )}

                               {milestone.status === 'in_progress' && profile?.role !== 'sponsor' && (
                                 <div className="mt-4">
                                   <button 
                                     onClick={() => handleUpdateMilestoneStatus(milestone.id, 'submitted')}
                                     disabled={submitting}
                                     className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 shadow-lg shadow-blue-100"
                                   >
                                     <FileText className="w-4 h-4 mr-2" />
                                     SUBMIT DELIVERABLES
                                   </button>
                                 </div>
                               )}

                               {milestone.status === 'rejected' && milestone.rejection_reason && (
                                 <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mt-2">
                                    <p className="text-xs font-black text-red-600 uppercase mb-1 flex items-center">
                                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                                      Rejection Logic
                                    </p>
                                    <p className="text-sm text-red-800 italic">{milestone.rejection_reason}</p>
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
               <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
                  <div>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Contract Parties</h3>
                    <div className="space-y-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-blue-400 uppercase">Sponsor Organization</p>
                          <p className="font-bold text-lg">{project.sponsor?.company_name}</p>
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                             <CheckCircle className="w-3 h-3 text-blue-500" />
                             <span>KYC Verified</span>
                          </div>
                       </div>
                       <div className="w-full h-px bg-slate-800"></div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase">Executive Partner (CRO)</p>
                          <p className="font-bold text-lg">{project.cro?.company_name}</p>
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                             <Shield className="w-3 h-3 text-emerald-500" />
                             <span>GxP Certified</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-4">
                     <button className="w-full py-3 bg-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-700 transition flex items-center justify-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Master Service Agreement
                     </button>
                     <button className="w-full py-3 bg-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-700 transition flex items-center justify-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Audit Trail Log
                     </button>
                  </div>
                  
                  <div className="bg-blue-600/20 rounded-2xl p-4 border border-blue-500/30 text-center">
                     <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Escrow Status</p>
                     <p className="text-xl font-black italic">TRUSTED SECURE</p>
                  </div>
               </div>

               <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <MessageSquare className="w-8 h-8 font-bold" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Project Channel</h4>
                    <p className="text-sm text-gray-500 mt-1">Direct encrypted communication with your dedicated Project Manager.</p>
                  </div>
                  <button className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                    Open Messaging
                  </button>
               </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
