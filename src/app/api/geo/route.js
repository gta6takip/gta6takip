import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const country = request.headers.get('x-vercel-ip-country') || '';
  return NextResponse.json(
    { country: country.toUpperCase() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
