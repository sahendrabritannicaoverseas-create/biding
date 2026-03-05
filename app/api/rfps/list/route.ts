import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sponsorCompanyId = searchParams.get('sponsor_company_id');

    // Forward the Authorization header from the client if present (for authenticated requests)
    const authHeader = request.headers.get('Authorization') || `Bearer ${SUPABASE_ANON_KEY}`;

    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    };

    let url: string;
    if (sponsorCompanyId) {
      // Sponsor: fetch own RFPs
      url = `${SUPABASE_URL}/rest/v1/rfps?select=*&sponsor_company_id=eq.${sponsorCompanyId}&order=created_at.desc`;
    } else {
      // Vendors: fetch active public RFPs
      url = `${SUPABASE_URL}/rest/v1/rfps?select=*&status=eq.active&is_invite_only=eq.false&order=created_at.desc`;
    }

    const response = await fetch(url, { headers, cache: 'no-store' });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase RFPs list error:', response.status, errorText);
      return NextResponse.json({ error: `Database error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ rfps: data || [] });
  } catch (err: any) {
    console.error('RFPs list API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch RFPs' }, { status: 500 });
  }
}
