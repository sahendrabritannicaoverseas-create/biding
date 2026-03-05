import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Fetch counts from all company tables and active RFPs server-side
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'count=exact',
    };

    const [croRes, sponsorRes, mfgRes, labRes, distRes, rfpRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/cro_companies?select=id,country,total_projects&verification_status=eq.verified`, { headers, cache: 'no-store' }),
      fetch(`${SUPABASE_URL}/rest/v1/sponsor_companies?select=id,country&verification_status=eq.verified`, { headers, cache: 'no-store' }),
      fetch(`${SUPABASE_URL}/rest/v1/manufacturer_companies?select=id,country,total_partnerships&verification_status=eq.verified`, { headers, cache: 'no-store' }),
      fetch(`${SUPABASE_URL}/rest/v1/lab_companies?select=id,country,total_projects&verification_status=eq.verified`, { headers, cache: 'no-store' }),
      fetch(`${SUPABASE_URL}/rest/v1/distributor_companies?select=id,country,total_deals&verification_status=eq.verified`, { headers, cache: 'no-store' }),
      fetch(`${SUPABASE_URL}/rest/v1/rfps?select=id&status=eq.active&is_invite_only=eq.false`, { headers, cache: 'no-store' }),
    ]);

    const [croData, sponsorData, mfgData, labData, distData, rfpData] = await Promise.all([
      croRes.ok ? croRes.json() : [],
      sponsorRes.ok ? sponsorRes.json() : [],
      mfgRes.ok ? mfgRes.json() : [],
      labRes.ok ? labRes.json() : [],
      distRes.ok ? distRes.json() : [],
      rfpRes.ok ? rfpRes.json() : [],
    ]);

    const totalCompanies = (croData?.length || 0) + (sponsorData?.length || 0) +
      (mfgData?.length || 0) + (labData?.length || 0) + (distData?.length || 0);

    const allCountries = new Set([
      ...(croData?.map((c: any) => c.country) || []),
      ...(sponsorData?.map((c: any) => c.country) || []),
      ...(mfgData?.map((c: any) => c.country) || []),
      ...(labData?.map((c: any) => c.country) || []),
      ...(distData?.map((c: any) => c.country) || []),
    ]);

    const totalProjects =
      (croData?.reduce((sum: number, c: any) => sum + (c.total_projects || 0), 0) || 0) +
      (labData?.reduce((sum: number, c: any) => sum + (c.total_projects || 0), 0) || 0) +
      (mfgData?.reduce((sum: number, c: any) => sum + (c.total_partnerships || 0), 0) || 0) +
      (distData?.reduce((sum: number, c: any) => sum + (c.total_deals || 0), 0) || 0);

    return NextResponse.json({
      companies: totalCompanies,
      projects: totalProjects,
      countries: allCountries.size,
      activeRFPs: rfpData?.length || 0,
    });
  } catch (err: any) {
    console.error('Stats API error:', err);
    return NextResponse.json({ companies: 0, projects: 0, countries: 0, activeRFPs: 0 });
  }
}
