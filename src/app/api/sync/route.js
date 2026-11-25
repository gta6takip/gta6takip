import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const REPOS = [
  { name: 'Hyphen (fxceless)', repo: 'fxceless/victory-gta6' },
  { name: 'VIctory', repo: 'Marvisak/VIctory' },
  { name: 'JoshuuDev (victory-amd)', repo: 'JoshuuDev/victory-amd' },
  { name: 'AnyXboxX', repo: 'LooperSalty/AnyXboxX' },
  { name: 'XCL', repo: 'ivall/xcl' },
  { name: 'Xbox2Windows', repo: 'R0Y00/Xbox2Windows' },
  { name: 'Palmetto', repo: 'luizwidmer/palmetto' },
];

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ ok: false, error: 'Supabase env eksik' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const nowIso = new Date().toISOString();

    for (const item of REPOS) {
      try {
        const res = await fetch(`https://api.github.com/repos/${item.repo}/commits?per_page=3`, {
          headers: { 'User-Agent': 'GTA6takip-Bot' },
          cache: 'no-store',
        });

        if (res.ok) {
          const commits = await res.json();
          const latestMsg = commits?.[0]?.commit?.message?.split('\n')?.[0];

          const updatePayload = { updated_at: nowIso };
          if (latestMsg && latestMsg.length > 4) {
            updatePayload.description = `Son GitHub güncellemesi: "${latestMsg.slice(0, 140)}"`;
          }

          await supabase.from('projects').update(updatePayload).eq('name', item.name);
        } else {
          await supabase.from('projects').update({ updated_at: nowIso }).eq('name', item.name);
        }
      } catch {
        await supabase.from('projects').update({ updated_at: nowIso }).eq('name', item.name);
      }
    }

    await supabase.from('projects').update({ updated_at: nowIso }).is('updated_at', null);

    return NextResponse.json({ ok: true, synced_at: nowIso });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Sync hatası' }, { status: 500 });
  }
}
