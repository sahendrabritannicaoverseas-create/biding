'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Save, Send } from 'lucide-react';

const STUDY_TYPES = ['BA/BE', 'Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Bioanalysis', 'PK/PD', 'Regulatory', 'Preclinical', 'Nutraceutical'];
const MOLECULE_TYPES = ['Generic', 'Botanical', 'Biologic', 'Nutraceutical', 'Novel Drug'];
const REGULATORY_AUTHORITIES = ['US FDA', 'EMA', 'DCGI', 'NPRA', 'CDSCO', 'TGA', 'MHRA', 'PMDA'];
const COUNTRIES = ['United States', 'India', 'Singapore', 'Malaysia', 'China', 'European Union', 'United Kingdom', 'Japan', 'Australia', 'Canada'];

function CreateRFPContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', studyType: 'BA/BE', moleculeType: 'Generic',
    targetGeography: [] as string[], regulatoryAuthorities: [] as string[],
    sampleSize: '', estimatedDuration: '', budgetMin: '', budgetMax: '',
    isBudgetVisible: false, isInviteOnly: false, isReverseBidding: false,
    submissionDeadline: '', startDate: '',
  });

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'active') => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const rfpNumber = `RFP-${Date.now()}`;
      const rfpData = {
        rfp_number: rfpNumber, sponsor_company_id: profile?.company_id, created_by: profile?.id,
        title: formData.title, description: formData.description, study_type: formData.studyType,
        molecule_type: formData.moleculeType, target_geography: formData.targetGeography,
        regulatory_authorities: formData.regulatoryAuthorities,
        sample_size: formData.sampleSize ? parseInt(formData.sampleSize) : null,
        estimated_duration_months: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : null,
        budget_range_min: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
        budget_range_max: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
        is_budget_visible: formData.isBudgetVisible, is_invite_only: formData.isInviteOnly,
        is_reverse_bidding: formData.isReverseBidding, submission_deadline: formData.submissionDeadline,
        start_date: formData.startDate || null, status,
        published_at: status === 'active' ? new Date().toISOString() : null,
      };
      const { error: insertError } = await supabase.from('rfps').insert(rfpData);
      if (insertError) throw insertError;
      router.push('/rfps');
    } catch (err: any) {
      setError(err.message || 'Failed to create RFP');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (array: string[], value: string, key: string) => {
    const newArr = array.includes(value) ? array.filter(i => i !== value) : [...array, value];
    setFormData({ ...formData, [key]: newArr });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2"><FileText className="w-8 h-8 text-blue-600" /><h1 className="text-3xl font-bold text-gray-900">Create New RFP</h1></div>
          <p className="text-gray-600">Post a Request for Proposal to receive competitive bids from qualified partners</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
        <form className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">RFP Title *</label><input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Phase III Clinical Trial for Diabetes Treatment" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Description *</label><textarea required rows={5} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Provide detailed information about the study requirements..." /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Study Type *</label><select value={formData.studyType} onChange={e => setFormData({ ...formData, studyType: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">{STUDY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Molecule Type *</label><select value={formData.moleculeType} onChange={e => setFormData({ ...formData, moleculeType: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">{MOLECULE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Geography &amp; Regulatory</h2>
            <div className="space-y-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-3">Target Geography * (Select all that apply)</label><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{COUNTRIES.map(country => <label key={country} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={formData.targetGeography.includes(country)} onChange={() => toggleSelection(formData.targetGeography, country, 'targetGeography')} className="rounded text-blue-600 focus:ring-blue-500" /><span className="text-sm">{country}</span></label>)}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-3">Regulatory Authorities * (Select all that apply)</label><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{REGULATORY_AUTHORITIES.map(auth => <label key={auth} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={formData.regulatoryAuthorities.includes(auth)} onChange={() => toggleSelection(formData.regulatoryAuthorities, auth, 'regulatoryAuthorities')} className="rounded text-blue-600 focus:ring-blue-500" /><span className="text-sm">{auth}</span></label>)}</div></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Study Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Sample Size</label><input type="number" value={formData.sampleSize} onChange={e => setFormData({ ...formData, sampleSize: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Number of subjects" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (months)</label><input type="number" value={formData.estimatedDuration} onChange={e => setFormData({ ...formData, estimatedDuration: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Duration in months" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Submission Deadline *</label><input type="date" required value={formData.submissionDeadline} onChange={e => setFormData({ ...formData, submissionDeadline: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Expected Start Date</label><input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Budget &amp; Options</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Budget Range Min (USD)</label><input type="number" value={formData.budgetMin} onChange={e => setFormData({ ...formData, budgetMin: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Minimum budget" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Budget Range Max (USD)</label><input type="number" value={formData.budgetMax} onChange={e => setFormData({ ...formData, budgetMax: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Maximum budget" /></div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-3"><input type="checkbox" checked={formData.isBudgetVisible} onChange={e => setFormData({ ...formData, isBudgetVisible: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" /><span className="text-sm font-medium text-gray-700">Make budget range visible to bidders</span></label>
                <label className="flex items-center space-x-3"><input type="checkbox" checked={formData.isInviteOnly} onChange={e => setFormData({ ...formData, isInviteOnly: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" /><span className="text-sm font-medium text-gray-700">Invite-only RFP (manually select partners)</span></label>
                <label className="flex items-center space-x-3"><input type="checkbox" checked={formData.isReverseBidding} onChange={e => setFormData({ ...formData, isReverseBidding: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" /><span className="text-sm font-medium text-gray-700">Enable reverse bidding (lowest price visible)</span></label>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button type="button" onClick={e => handleSubmit(e, 'draft')} disabled={loading} className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-semibold disabled:opacity-50"><Save className="w-5 h-5" /><span>Save as Draft</span></button>
            <button type="button" onClick={e => handleSubmit(e, 'active')} disabled={loading} className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"><Send className="w-5 h-5" /><span>Publish RFP</span></button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default function CreateRFPPage() {
  return <ProtectedRoute allowedRoles={['sponsor']}><CreateRFPContent /></ProtectedRoute>;
}
