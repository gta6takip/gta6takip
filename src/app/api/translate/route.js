import { NextResponse } from 'next/server';
import { translateBatchToTurkish } from '../../../lib/translate';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const raw = Array.isArray(body?.texts) ? body.texts : [];
    const texts = raw
      .filter((t) => typeof t === 'string' && t.trim().length > 0)
      .slice(0, 20)
      .map((t) => t.slice(0, 500));

    if (texts.length === 0) {
      return NextResponse.json(
        { ok: true, translations: [] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const trMap = await translateBatchToTurkish(texts);
    const translations = texts.map((t) => trMap.get(t) || t);

    return NextResponse.json(
      { ok: true, translations },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, translations: [] },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
