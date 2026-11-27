'use client';

import React from 'react';
import { Cpu, Monitor, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import {
  GPU_BENCHMARKS,
  GPU_PRESETS,
  evaluateSystemForPort,
} from '../lib/constants';
import { IconAmd, IconNvidia } from './Icons';

export function SystemCheck({
  lang,
  isLight,
  teams,
  sysGpu,
  setSysGpu,
  sysVram,
  setSysVram,
  sysRam,
  setSysRam,
}) {
  const evalRes = evaluateSystemForPort(sysGpu, sysVram, sysRam, lang, teams);

  const statusTone =
    evalRes.level === 'high' || evalRes.level === 'good'
      ? {
          bar: '#22C55E',
          badge: isLight
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          icon: CheckCircle2,
        }
      : evalRes.level === 'mid'
        ? {
            bar: '#F59E0B',
            badge: isLight
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/25',
            icon: Info,
          }
        : {
            bar: '#EF4444',
            badge: isLight
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-red-500/10 text-red-400 border-red-500/25',
            icon: AlertTriangle,
          };

  const StatusIcon = statusTone.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-ink flex items-center gap-2">
          <Cpu className="w-4 h-4 text-accent" />
          <span>
            {lang === 'tr' ? 'Sistemim GTA 6 Portunu Açar mı?' : 'Can My PC Run the GTA VI Port?'}
          </span>
        </h2>
        <p className="text-xs text-ink-2">
          {lang === 'tr'
            ? 'Mevcut açık kaynak ve topluluk port testlerine göre GPU, VRAM ve RAM profilini kontrol et.'
            : 'Check your GPU, VRAM, and RAM against real community GTA VI PC port benchmarks.'}
        </p>
      </div>

      {/* Interactive Checker Card */}
      <section className="rounded-lg border border-subtle bg-surface p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 font-tech">
              {lang === 'tr' ? 'Ekran Kartı (GPU)' : 'Graphics Card (GPU)'}
            </label>
            <select
              value={sysGpu}
              onChange={(e) => {
                const nextId = e.target.value;
                setSysGpu(nextId);
                const preset = GPU_PRESETS.find((g) => g.id === nextId);
                if (preset) setSysVram(preset.defaultVram);
              }}
              className="w-full rounded-md border border-default bg-elevated px-3 py-2.5 text-xs font-medium text-ink outline-none"
            >
              {GPU_PRESETS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 font-tech">
              VRAM
            </label>
            <select
              value={sysVram}
              onChange={(e) => setSysVram(Number(e.target.value))}
              className="w-full rounded-md border border-default bg-elevated px-3 py-2.5 text-xs font-medium text-ink outline-none"
            >
              {[4, 6, 8, 12, 16].map((v) => (
                <option key={v} value={v}>
                  {v === 16 ? '16 GB+' : `${v} GB`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3 font-tech">
              {lang === 'tr' ? 'Sistem RAM' : 'System RAM'}
            </label>
            <select
              value={sysRam}
              onChange={(e) => setSysRam(Number(e.target.value))}
              className="w-full rounded-md border border-default bg-elevated px-3 py-2.5 text-xs font-medium text-ink outline-none"
            >
              {[8, 16, 32, 64].map((r) => (
                <option key={r} value={r}>
                  {r === 64 ? '64 GB+' : `${r} GB`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verdict Panel */}
        <div className="rounded-md border border-subtle bg-panel-tint overflow-hidden relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ backgroundColor: statusTone.bar }}
          />
          <div className="pl-5 pr-4 py-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusTone.badge}`}
              >
                <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                {evalRes.badge}
              </span>
              <span className="inline-flex items-center gap-1.5 font-tech text-xs font-bold text-ink">
                <Monitor className="w-3.5 h-3.5 text-accent" />
                {evalRes.fps}
              </span>
            </div>

            <p className="text-xs sm:text-[13px] leading-relaxed text-ink-2">{evalRes.text}</p>

            <div className="pt-2.5 border-t border-subtle flex items-center justify-between gap-2 flex-wrap text-[11px]">
              <span className="text-ink-2">
                <strong className="text-ink font-semibold">
                  {lang === 'tr' ? 'Takip Edilecek Hat: ' : 'Recommended Track: '}
                </strong>
                <span className="font-tech">{evalRes.watchTeam}</span>
              </span>
              <span className="text-ink-3">
                {lang === 'tr'
                  ? 'Resmi olmayan PortWatch testlerine dayalı tahmindir.'
                  : 'Estimate based on unofficial PortWatch test data.'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Reference Benchmark Table */}
      <section className="rounded-lg border border-subtle bg-surface overflow-hidden">
        <div className="px-4 py-2.5 border-b border-subtle bg-panel-tint flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink">
            {lang === 'tr' ? 'Doğrulanmış Topluluk GPU Referansları' : 'Observed Community GPU Benchmarks'}
          </h3>
          <span className="font-tech text-[10px] text-ink-3 uppercase">
            {lang === 'tr' ? 'PortWatch Verisi' : 'PortWatch Data'}
          </span>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {GPU_BENCHMARKS.map((row) => (
            <div
              key={row.name}
              className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {row.vendor === 'amd' ? (
                  <IconAmd className={`w-3 h-3 ${isLight ? 'text-[#C81E2B]' : 'text-[#F05A60]'}`} />
                ) : (
                  <IconNvidia className={`w-3.5 h-3.5 ${isLight ? 'text-[#4F7D00]' : 'text-[#84CC16]'}`} />
                )}
                <span className="font-semibold text-ink truncate">{row.name}</span>
                <span className="font-tech text-[10px] text-ink-3 hidden sm:inline">{row.arch}</span>
              </div>
              <span className="font-tech font-semibold text-ink shrink-0">{row.fps}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
