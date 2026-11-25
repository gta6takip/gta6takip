import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const store = globalThis.__gta6takipMainPoll || {
  yes: 0,
  no: 0,
  voters: new Map(),
};
globalThis.__gta6takipMainPoll = store;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const voterId = searchParams.get('voterId') || '';
  const myVote = voterId ? store.voters.get(voterId) || null : null;

  return NextResponse.json({
    ok: true,
    yes: store.yes,
    no: store.no,
    myVote,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const vote = body.vote === 'yes' || body.vote === 'no' ? body.vote : null;
    const voterId = String(body.voterId || '').trim().slice(0, 64);

    if (!vote || !voterId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const prevVote = store.voters.get(voterId);
    if (prevVote === vote) {
      return NextResponse.json({
        ok: true,
        yes: store.yes,
        no: store.no,
        myVote: vote,
      });
    }

    if (prevVote === 'yes' && store.yes > 0) store.yes -= 1;
    if (prevVote === 'no' && store.no > 0) store.no -= 1;

    if (vote === 'yes') store.yes += 1;
    if (vote === 'no') store.no += 1;
    store.voters.set(voterId, vote);

    return NextResponse.json({
      ok: true,
      yes: store.yes,
      no: store.no,
      myVote: vote,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
