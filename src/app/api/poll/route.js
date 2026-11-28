import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const store = globalThis.__gta6takipMainPoll || {
  yes: 0,
  no: 0,
  votedIps: new Map(),
};
globalThis.__gta6takipMainPoll = store;

function getClientIp(request) {
  return (
    request.headers.get('x-nf-client-connection-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : [];
  } catch {
    return null;
  }
}

async function getPollCounts(ip) {
  const rows = await supabaseFetch('poll_votes?select=ip,vote');
  if (Array.isArray(rows)) {
    let yes = 0;
    let no = 0;
    let myVote = null;
    for (const r of rows) {
      if (r.vote === 'yes') yes += 1;
      if (r.vote === 'no') no += 1;
      if (r.ip === ip) myVote = r.vote;
    }
    return { yes, no, myVote, locked: Boolean(myVote), source: 'supabase' };
  }

  const memVote = store.votedIps.get(ip) || null;
  return {
    yes: store.yes,
    no: store.no,
    myVote: memVote,
    locked: Boolean(memVote),
    source: 'memory',
  };
}

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(request) {
  const ip = getClientIp(request);
  const data = await getPollCounts(ip);
  return NextResponse.json({ ok: true, ...data }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const current = await getPollCounts(ip);

    if (current.locked) {
      return NextResponse.json(
        { ok: false, alreadyVoted: true, ...current },
        { status: 409, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const vote = body.vote === 'yes' || body.vote === 'no' ? body.vote : null;
    if (!vote) {
      return NextResponse.json({ ok: false }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    await supabaseFetch('poll_votes', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ ip, vote }),
    });

    if (vote === 'yes') store.yes += 1;
    if (vote === 'no') store.no += 1;
    store.votedIps.set(ip, vote);

    const updated = await getPollCounts(ip);
    return NextResponse.json({ ok: true, ...updated }, { headers: NO_CACHE_HEADERS });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
