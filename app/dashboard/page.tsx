'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { SponsorDashboard } from '@/components/dashboards/SponsorDashboard';
import { CRODashboard } from '@/components/dashboards/CRODashboard';
import { ManufacturerDashboard } from '@/components/dashboards/ManufacturerDashboard';
import { LabDashboard } from '@/components/dashboards/LabDashboard';
import { DistributorDashboard } from '@/components/dashboards/DistributorDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { AuditorDashboard } from '@/components/dashboards/AuditorDashboard';

function DashboardContent() {
  const { profile } = useAuth();

  const renderDashboard = () => {
    switch (profile?.role) {
      case 'sponsor': return <SponsorDashboard />;
      case 'cro': return <CRODashboard />;
      case 'manufacturer': return <ManufacturerDashboard />;
      case 'lab': return <LabDashboard />;
      case 'distributor': return <DistributorDashboard />;
      case 'admin': return <AdminDashboard />;
      case 'auditor': return <AuditorDashboard />;
      default: return <div>Unknown role</div>;
    }
  };

  return <Layout>{renderDashboard()}</Layout>;
}

export default function DashboardPage() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}
