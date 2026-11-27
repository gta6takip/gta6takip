'use client';

import React from 'react';
import {
  ExternalLink,
  Star,
  Download,
  ArrowUpRight,
} from 'lucide-react';
import {
  MILESTONES,
  formatTeamUpdated,
  localizeDynamicText,
} from '../lib/constants';
import { GpuBadgeIcons, RankBadge } from './Icons';

export function HeroTelemetry({
  lang,
  isLight,
  leader,
  secondTeam,
  thirdTeam,
  totalEfforts,
  bootingCount,
  playableCount,
  top3Avg,
  peakFps,
  amdCount,
  nvidiaCount,
  lastSyncAt,
  featuredPort,
  onSelectTeam,
}) {
  const leaderPct = Math.min(100, Math.max(0, Number(leader.progress) || 0));
  const remainingPct = Math.max(0, 100 - leaderPct).toFixed(1).replace(/\.0$/, '');
  const fpsPct = Math.min(100, Math.round((peakFps / 30) * 100));
  const filledSegments = Math.round(leaderPct / 5);
  const totalGpuTagged = Math.max(1, amdCount + nvidiaCount);
  const amdShare = Math.round((amdCount / totalGpuTagged) * 100);
  const syncLabel = lastSyncAt ? formatTeamUpdated(lastSyncAt, lang) : '';

  return (
    <div className="space-y-4">
      {/* Main Telemetry Card */}
      <section className="rounded-lg border border-subtle bg-surface overflow-hidden">
        {/* Top Meta Strip */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-subtle bg-panel-tint flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <h1 className="font-tech font-semibold tracking-wider uppercase text-ink-2">
              {lang === 'tr' ? 'GTA VI PC Port Takip Endeksi' : 'GTA VI PC Port Tracking Index'}
            </h1>
          </div>
          <div className="flex items-center gap-3 font-tech text-ink-3">
            {syncLabel && (
              <span>
                {lang === 'tr' ? 'Güncelleme:' : 'Synced:'} <strong className="text-ink-2 font-medium">{syncLabel}</strong>
              </span>
            )}
            <span className="hidden sm:inline opacity-40">·</span>
            <span className="hidden sm:inline">
              {lang === 'tr' ? `İlk 3 Ort. %${top3Avg}` : `Top-3 Avg ${top3Avg}%`}
            </span>
          </div>
        </div>

        {/* Hero Body: Left Primary Progress + Right Live Hardware Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
          {/* Left Primary Stat */}
          <div className="md:col-span-7 p-4 sm:p-5 space-y-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                {lang === 'tr'
                  ? 'Genel Lider & Performans Durumu'
                  : 'Overall Leader & Performance'}
              </div>

              <div className="mt-2 flex items-end gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => onSelectTeam({ ...leader, globalRank: 1 })}
                  className="font-display text-[56px] sm:text-[64px] font-extrabold leading-[0.88] tracking-tight text-ink hover:text-accent ui-tactile"
                  title={lang === 'tr' ? 'Lider detaylarını gör' : 'Inspect leader details'}
                >
                  {lang === 'tr' ? `%${leader.progress}` : `${leader.progress}%`}
                </button>

                <div className="pb-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <RankBadge rank={1} isLight={isLight} size="sm" />
                    <button
                      type="button"
                      onClick={() => onSelectTeam({ ...leader, globalRank: 1 })}
                      className="text-sm sm:text-base font-bold text-ink hover:underline underline-offset-2 truncate"
                    >
                      {leader.name}
                    </button>
                    <span className="font-tech text-xs px-1.5 py-0.5 rounded bg-elevated border border-subtle text-ink-2">
                      {localizeDynamicText(leader.fps, lang)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-2 flex-wrap">
                    {leader.gpu && (
                      <span className="inline-flex items-center gap-1">
                        <GpuBadgeIcons gpu={leader.gpu} isLight={isLight} />
                        <span>{localizeDynamicText(leader.gpu, lang)}</span>
                      </span>
                    )}
                    {leader.stage && (
                      <>
                        <span className="text-ink-3">·</span>
                        <span>{localizeDynamicText(leader.stage, lang)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 20-Segment Precision Telemetry Bar */}
            <div className="space-y-2">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}
                role="progressbar"
                aria-valuenow={leaderPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {Array.from({ length: 20 }).map((_, idx) => {
                  const isFilled = idx < filledSegments;
                  return (
                    <div
                      key={idx}
                      className="h-2 rounded-[1px] transition-colors"
                      style={{
                        backgroundColor: isFilled ? 'var(--accent)' : 'var(--track-bg)',
                      }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] font-tech text-ink-3">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span className="text-ink-2">
                  {lang === 'tr' ? `100% hedefine ${remainingPct} puan` : `${remainingPct} pts to 100%`}
                </span>
              </div>
            </div>

            {/* Milestones Row */}
            <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1.5 pt-0.5">
              {MILESTONES.map((m) => {
                const reached = leaderPct >= m.min;
                return (
                  <div
                    key={m.key}
                    className={`inline-flex items-center gap-1.5 text-[11px] whitespace-nowrap ${
                      reached ? 'text-ink-2 font-medium' : 'text-ink-3 opacity-60'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: reached ? 'var(--accent)' : 'var(--border-strong)',
                      }}
                    />
                    <span>{m[lang]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Real Telemetry Metrics (Zero fake sparkline) */}
          <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between gap-4 bg-panel-tint">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <div className="text-[10px] font-tech uppercase tracking-wider text-ink-3">
                  {lang === 'tr' ? 'Takip Edilen' : 'Tracked'}
                </div>
                <div className="font-display text-2xl font-bold text-ink leading-none">
                  {totalEfforts}
                  <span className="font-sans text-xs font-medium text-ink-3 ml-1">
                    {lang === 'tr' ? 'proje' : 'efforts'}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] font-tech uppercase tracking-wider text-ink-3">
                  {lang === 'tr' ? 'Oyunu Başlatan' : 'Booting'}
                </div>
                <div className="font-display text-2xl font-bold text-ink leading-none">
                  {bootingCount}
                  <span className="font-sans text-xs font-medium text-ink-3 ml-1">
                    / {playableCount} {lang === 'tr' ? 'oynanabilir' : 'playable'}
                  </span>
                </div>
              </div>
            </div>

            {/* 30 FPS Target Meter */}
            <div className="space-y-1.5 pt-2 border-t border-subtle">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-tech uppercase tracking-wider text-ink-3">
                  {lang === 'tr' ? '30 FPS Barajı' : '30 FPS Benchmark'}
                </span>
                <span className="font-tech font-semibold text-ink">
                  {peakFps} <span className="text-ink-3">/ 30 FPS</span>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-track overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${fpsPct}%`,
                    backgroundColor: 'var(--accent)',
                  }}
                />
              </div>
            </div>

            {/* Active Hardware Split (AMD vs NVIDIA live counts) */}
            <div className="space-y-1.5 pt-2 border-t border-subtle">
              <div className="flex items-center justify-between text-[11px] font-tech">
                <span className="text-ink-2">
                  AMD <strong className="text-ink">{amdCount}</strong>
                </span>
                <span className="text-ink-3 text-[10px] uppercase">
                  {lang === 'tr' ? 'Aktif GPU Dağılımı' : 'Active GPU Split'}
                </span>
                <span className="text-ink-2">
                  NVIDIA <strong className="text-ink">{nvidiaCount}</strong>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-track">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${amdShare}%`, backgroundColor: '#E5484D' }}
                />
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${100 - amdShare}%`, backgroundColor: '#74B816' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 3-Column Podium Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-subtle divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]">
          {[leader, secondTeam, thirdTeam].filter(Boolean).map((pTeam, idx) => (
            <button
              key={pTeam.name}
              type="button"
              onClick={() => onSelectTeam({ ...pTeam, globalRank: idx + 1 })}
              className="group text-left px-4 py-3 hover-surface ui-tactile flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <RankBadge rank={idx + 1} isLight={isLight} size="sm" />
                  <span className="text-[13px] font-semibold text-ink truncate group-hover:underline underline-offset-2">
                    {pTeam.name}
                  </span>
                </div>
                <div className="font-tech text-[11px] text-ink-3 truncate mt-0.5">
                  {localizeDynamicText(pTeam.fps, lang)} · {localizeDynamicText(pTeam.gpu, lang)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`font-display text-2xl font-bold leading-none ${
                    idx === 0 ? 'text-accent' : 'text-ink'
                  }`}
                >
                  {lang === 'tr' ? `%${pTeam.progress}` : `${pTeam.progress}%`}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Port: ScarlettPort Editorial Callout (Zero Rainbow Pill Soup) */}
      {featuredPort && (
        <section className="rounded-lg border border-subtle bg-surface overflow-hidden relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <div className="pl-5 pr-4 py-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="font-tech font-bold uppercase tracking-wider text-accent">
                  {lang === 'tr' ? 'Öne Çıkan Proje' : 'Spotlight'}
                </span>
                <span className="text-ink-3">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-ink-2">
                  <Download className="w-3 h-3 text-ink-3" />
                  {lang === 'tr' ? 'Hazır Windows Launcher' : 'Prebuilt Windows Launcher'}
                </span>
                {featuredPort.releaseTag && (
                  <>
                    <span className="text-ink-3">·</span>
                    <span className="font-tech text-ink-2">{featuredPort.releaseTag}</span>
                  </>
                )}
                {featuredPort.stars > 0 && (
                  <>
                    <span className="text-ink-3">·</span>
                    <span className="inline-flex items-center gap-1 font-tech text-ink-2">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {featuredPort.stars.toLocaleString('tr-TR')}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-baseline gap-2.5 flex-wrap">
                <h2 className="text-base font-bold tracking-tight text-ink">
                  {featuredPort.name}
                </h2>
                <span className="font-tech text-xs text-ink-2">
                  {localizeDynamicText(featuredPort.fps, lang)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-ink-3">
                  <GpuBadgeIcons gpu={featuredPort.gpu} isLight={isLight} />
                  <span>{featuredPort.gpu}</span>
                </span>
              </div>

              <p className="text-xs leading-relaxed text-ink-2 max-w-2xl">
                {lang === 'tr' ? featuredPort.summaryTr : featuredPort.summaryEn}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 sm:w-36 pt-2 sm:pt-0 border-t sm:border-t-0 border-subtle">
              <div className="text-left sm:text-right">
                <div className="font-display text-2xl font-bold leading-none text-ink">
                  {lang === 'tr' ? `%${featuredPort.progress}` : `${featuredPort.progress}%`}
                </div>
                <div className="text-[10px] font-tech text-ink-3 mt-0.5">
                  {featuredPort.isEstimated
                    ? lang === 'tr'
                      ? 'GitHub Tahmini'
                      : 'GitHub Est.'
                    : lang === 'tr'
                      ? 'PortWatch Puanı'
                      : 'PortWatch Score'}
                </div>
              </div>

              <a
                href={featuredPort.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-default bg-elevated text-xs font-semibold text-ink hover:border-strong hover-surface ui-tactile"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-ink-3" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
