import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const { data: projects, error } = await supabase.from('projects').select('*');
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    let updatedCount = 0;

    for (const proj of projects || []) {
      if (!proj.is_open_source || !proj.github_repo) continue;

      const ghRes = await fetch(`https://api.github.com/repos/${proj.github_repo}/commits?per_page=5`, {
        headers: {
          'User-Agent': 'GTA6takip-Bot',
          Accept: 'application/vnd.github+json',
        },
        cache: 'no-store',
      });

      if (!ghRes.ok) continue;

      const commits = await ghRes.json();
      if (!Array.isArray(commits) || commits.length === 0) continue;

      const combinedText = commits
        .map((c) => `${c.commit?.message || ''}`)
        .join(' ')
        .toLowerCase();

      let bonus = 0;
      let detectedStage = proj.stage;

      if (combinedText.includes('60 fps') || combinedText.includes('stable') || combinedText.includes('playable')) {
        bonus = 10;
        detectedStage = 'Yüksek Performans / Oynanabilir';
      } else if (combinedText.includes('30 fps')) {
        bonus = 5;
        detectedStage = '30 FPS Hedefi';
      } else if (combinedText.includes('raytracing') || combinedText.includes('3d') || combinedText.includes('shader')) {
        bonus = 2;
      }

      const nextPercentage = Math.min(99, Number(proj.percentage || 0) + bonus);

      await supabase
        .from('projects')
        .update({
          percentage: nextPercentage,
          stage: detectedStage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', proj.id);

      updatedCount++;
    }

    return NextResponse.json({
      ok: true,
      message: `Otomatik kontrol tamamlandı. ${updatedCount} açık kaynak depo tarandı.`,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
