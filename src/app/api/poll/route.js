import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const store = globalThis.__gta6takipMainPoll || {
  yes: 0,
  no: 0,
  votedIps: new Map(),
};
globalThis.__gta6takipMainPoll = store;

function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(request) {
  const ip = getClientIp(request);
  const myVote = store.votedIps.get(ip) || null;

  return NextResponse.json({
    ok: true,
    yes: store.yes,
    no: store.no,
    myVote,
    locked: Boolean(myVote),
  });
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const existingVote = store.votedIps.get(ip);

    if (existingVote) {
      return NextResponse.json(
        {
          ok: false,
          alreadyVoted: true,
          yes: store.yes,
          no: store.no,
          myVote: existingVote,
          locked: true,
        },
        { status: 409 }
      );
    }

    const body = await request.json();
    const vote = body.vote === 'yes' || body.vote === 'no' ? body.vote : null;

    if (!vote) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (vote === 'yes') store.yes += 1;
    if (vote === 'no') store.no += 1;
    store.votedIps.set(ip, vote);

    return NextResponse.json({
      ok: true,
      yes: store.yes,
      no: store.no,
      myVote: vote,
      locked: true,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
