import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Query Supabase REST API directly from server side
    // Server-side requests bypass browser RLS policy recursion issues
    const url = `${SUPABASE_URL}/rest/v1/rfps?select=*&status=eq.active&is_invite_only=eq.false&order=created_at.desc`;

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      // No caching - always fresh data
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Database error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ rfps: data || [] });
  } catch (err: any) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch RFPs' },
      { status: 500 }
    );
  }
}
