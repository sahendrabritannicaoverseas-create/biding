import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    // Get auth token from header (passed by admin page)
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || SUPABASE_ANON_KEY;

    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Admin: fetch all RFPs; public: fetch active public only
    const rfpUrl = isAdmin
      ? `${SUPABASE_URL}/rest/v1/rfps?select=*&order=created_at.desc`
      : `${SUPABASE_URL}/rest/v1/rfps?select=*&status=eq.active&is_invite_only=eq.false&order=created_at.desc`;

    const response = await fetch(rfpUrl, { headers, cache: 'no-store' });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Database error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const rfpData = await response.json();

    if (!isAdmin) {
      return NextResponse.json({ rfps: rfpData || [] });
    }

    // For admin: also fetch sponsor names
    const sponsorIds = [...new Set(
      (rfpData || []).map((r: any) => r.sponsor_company_id).filter(Boolean)
    )] as string[];

    let sponsors: Record<string, string> = {};

    if (sponsorIds.length > 0) {
      const sponsorRes = await fetch(
        `${SUPABASE_URL}/rest/v1/sponsor_companies?select=id,company_name&id=in.(${sponsorIds.join(',')})`,
        { headers, cache: 'no-store' }
      );
      if (sponsorRes.ok) {
        const sponsorData = await sponsorRes.json();
        sponsorData?.forEach((s: any) => { sponsors[s.id] = s.company_name; });
      }
    }

    // Merge sponsor names
    const merged = (rfpData || []).map((rfp: any) => ({
      ...rfp,
      sponsor: rfp.sponsor_company_id
        ? { company_name: sponsors[rfp.sponsor_company_id] || '—' }
        : null,
    }));

    return NextResponse.json({ rfps: merged });
  } catch (err: any) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch RFPs' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || SUPABASE_ANON_KEY;
    const { id, status } = await request.json();

    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    };

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rfps?id=eq.${id}`,
      { method: 'PATCH', headers, body: JSON.stringify({ status }) }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
