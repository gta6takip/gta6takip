import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function extractCountry(request) {
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  if (vercelCountry && /^[A-Za-z]{2}$/.test(vercelCountry.trim())) {
    return vercelCountry.trim().toUpperCase();
  }

  // Netlify sends base64-encoded JSON in x-nf-geo
  const nfGeo = request.headers.get('x-nf-geo');
  if (nfGeo) {
    try {
      const decoded = Buffer.from(nfGeo, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      const code = parsed?.country?.code;
      if (typeof code === 'string' && /^[A-Za-z]{2}$/.test(code.trim())) {
        return code.trim().toUpperCase();
      }
    } catch {
      // Fall through to plain header checks
    }
  }

  const alt =
    request.headers.get('x-country') ||
    request.headers.get('cf-ipcountry') ||
    '';
  if (alt && /^[A-Za-z]{2}$/.test(alt.trim())) {
    return alt.trim().toUpperCase();
  }

  return '';
}

export async function GET(request) {
  const country = extractCountry(request);
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  return NextResponse.json(
    {
      country,
      supabaseUrl,
      supabaseAnonKey,
      realtimeConfigured: Boolean(supabaseUrl && supabaseAnonKey),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
