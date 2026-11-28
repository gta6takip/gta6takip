'use client';

import React from 'react';
import {
  Search,
  X,
  LayoutList,
  LayoutGrid,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  Code2,
  Info,
} from 'lucide-react';
import {
  INITIAL_TEAMS_LIMIT,
  MILESTONES,
  buildLeaderSummary,
  formatTeamUpdated,
  localizeDynamicText,
} from '../lib/constants';
import { GpuBadgeIcons, IconAmd, IconNvidia, RankBadge } from './Icons';

export function Leaderboard({
  lang,
  isLight,
  teams,
  filteredTeams,
  visibleTeams,
  amdCount,
  nvidiaCount,
  openCount,
  privateCount,
  gpuFilter,
  setGpuFilter,
  typeFilter,
  setTypeFilter,
  teamSearch,
  setTeamSearch,
  showAllTeams,
  setShowAllTeams,
  compactView,
  setCompactView,
  prevScores,
  lastSyncAt,
  onSelectTeam,
}) {
  return (
    <section className="space-y-3">
      {/* Header + Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-bold tracking-tight text-ink">
              {lang === 'tr' ? 'Aktif Ekipler' : 'Active Efforts'}
            </h2>
            <span className="font-tech text-xs text-ink-3">({filteredTeams.length})</span>
          </div>

          {/* Mobile View Toggle */}
          <div className="inline-flex sm:hidden rounded-md border border-subtle bg-elevated p-0.5">
            <button
              type="button"
              onClick={() => setCompactView(true)}
              className={`p-1.5 rounded ${compactView ? 'bg-active-pill' : 'text-ink-3'}`}
              aria-label={lang === 'tr' ? 'Tablo görünümü' : 'Table view'}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCompactView(false)}
              className={`p-1.5 rounded ${!compactView ? 'bg-active-pill' : 'text-ink-3'}`}
              aria-label={lang === 'tr' ? 'Detaylı kart görünümü' : 'Detailed card view'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-md border border-subtle bg-surface px-3 py-1.5 text-xs w-full sm:w-64 focus-within:border-strong transition-colors">
          <Search className="w-3.5 h-3.5 text-ink-3 shrink-0" />
          <input
            type="text"
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            placeholder={lang === 'tr' ? 'Ekip, GPU veya aşama ara...' : 'Search team, GPU, stage...'}
            className="w-full bg-transparent outline-none text-xs text-ink placeholder:text-ink-3"
          />
          {teamSearch && (
            <button
              type="button"
              onClick={() => setTeamSearch('')}
              aria-label={lang === 'tr' ? 'Aramayı temizle' : 'Clear search'}
              className="text-ink-3 hover:text-ink shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters + View Switcher Bar */}
      <div className="sticky top-[89px] sm:static z-30 -mx-3 px-3 py-2 sm:mx-0 sm:px-0 sm:py-0 bg-header-glass sm:bg-transparent sm:backdrop-blur-none border-b sm:border-b-0 border-subtle flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {/* GPU Filter */}
          <div className="inline-flex shrink-0 rounded-md border border-subtle bg-elevated p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => {
                setGpuFilter('all');
                setShowAllTeams(false);
              }}
              className={`px-2.5 py-1 rounded whitespace-nowrap ui-tactile ${
                gpuFilter === 'all' ? 'bg-active-pill font-semibold' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {lang === 'tr' ? 'Tüm GPU' : 'All GPUs'}
            </button>
            <button
              type="button"
              onClick={() => {
                setGpuFilter('amd');
                setShowAllTeams(false);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded whitespace-nowrap ui-tactile ${
                gpuFilter === 'amd'
                  ? 'bg-[#D92D36] text-white font-semibold'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              <IconAmd className="w-2.5 h-2.5" />
              <span>AMD</span>
              <span className="font-tech text-[10px] opacity-75">{amdCount}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setGpuFilter('nvidia');
                setShowAllTeams(false);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded whitespace-nowrap ui-tactile ${
                gpuFilter === 'nvidia'
                  ? 'bg-[#66A80F] text-white font-semibold'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              <IconNvidia className="w-3 h-3" />
              <span>NVIDIA</span>
              <span className="font-tech text-[10px] opacity-75">{nvidiaCount}</span>
            </button>
          </div>

          {/* Source Type Filter */}
          <div className="inline-flex shrink-0 rounded-md border border-subtle bg-elevated p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => {
                setTypeFilter('all');
                setShowAllTeams(false);
              }}
              className={`px-2.5 py-1 rounded whitespace-nowrap ui-tactile ${
                typeFilter === 'all' ? 'bg-active-pill font-semibold' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {lang === 'tr' ? `Tümü` : 'All'}
              <span className="font-tech text-[10px] ml-1 opacity-75">{teams.length}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('open');
                setShowAllTeams(false);
              }}
              className={`px-2.5 py-1 rounded whitespace-nowrap ui-tactile ${
                typeFilter === 'open' ? 'bg-active-pill font-semibold' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {lang === 'tr' ? 'Açık Kaynak' : 'Open'}
              <span className="font-tech text-[10px] ml-1 opacity-75">{openCount}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('private');
                setShowAllTeams(false);
              }}
              className={`px-2.5 py-1 rounded whitespace-nowrap ui-tactile ${
                typeFilter === 'private' ? 'bg-active-pill font-semibold' : 'text-ink-2 hover:text-ink'
              }`}
            >
              {lang === 'tr' ? 'Kapalı' : 'Private'}
              <span className="font-tech text-[10px] ml-1 opacity-75">{privateCount}</span>
            </button>
          </div>
        </div>

        {/* Desktop View Toggle */}
        <div className="hidden sm:inline-flex shrink-0 rounded-md border border-subtle bg-elevated p-0.5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setCompactView(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded ui-tactile ${
              compactView ? 'bg-active-pill font-semibold' : 'text-ink-2 hover:text-ink'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>{lang === 'tr' ? 'Tablo' : 'Table'}</span>
          </button>
          <button
            type="button"
            onClick={() => setCompactView(false)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded ui-tactile ${
              !compactView ? 'bg-active-pill font-semibold' : 'text-ink-2 hover:text-ink'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{lang === 'tr' ? 'Detaylı' : 'Cards'}</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 ? (
        <div className="rounded-lg border border-subtle bg-surface p-8 text-center text-xs text-ink-3">
          {lang === 'tr' ? 'Arama veya filtrelere uyan ekip bulunamadı.' : 'No teams match your filters.'}
        </div>
      ) : compactView ? (
        /* STRUCTURED TABLE VIEW (SteamDB / Digital Foundry Style) */
        <div className="rounded-lg border border-subtle bg-surface overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-[38px_minmax(0,1.4fr)_136px_78px_minmax(0,1.15fr)_136px_32px] items-center gap-3 px-4 py-2 border-b border-subtle bg-panel-tint text-[10px] font-tech uppercase tracking-wider text-ink-3">
            <span>#</span>
            <span>{lang === 'tr' ? 'Ekip / Kaynak' : 'Effort / Source'}</span>
            <span>GPU</span>
            <span>FPS</span>
            <span>{lang === 'tr' ? 'Aşama' : 'Stage'}</span>
            <span className="text-right">{lang === 'tr' ? 'İlerleme' : 'Progress'}</span>
            <span />
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {visibleTeams.map((team) => {
              const rank = team.globalRank;
              const barWidth = Math.min(100, Math.max(2, team.progress));
              const prevVal = prevScores[team.name];
              const diffVal =
                typeof prevVal === 'number' && team.progress > prevVal
                  ? Number((team.progress - prevVal).toFixed(1))
                  : 0;
              const deltaText = team.delta || (diffVal > 0 ? `+${diffVal}%` : '');

              return (
                <div
                  key={team.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectTeam(team)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTeam(team);
                    }
                  }}
                  className="group px-3.5 sm:px-4 py-3 hover-surface ui-tactile cursor-pointer"
                >
                  {/* Desktop Row */}
                  <div className="hidden md:grid grid-cols-[38px_minmax(0,1.4fr)_136px_78px_minmax(0,1.15fr)_136px_32px] items-center gap-3">
                    <div className="flex items-center">
                      <RankBadge rank={rank} isLight={isLight} />
                    </div>

                    <div className="min-w-0 flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink truncate group-hover:underline underline-offset-2">
                        {team.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 border ${
                          team.type === 'private'
                            ? 'border-subtle bg-elevated text-ink-3'
                            : isLight
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {team.type === 'private' ? (
                          <Lock className="w-2.5 h-2.5" />
                        ) : (
                          <Code2 className="w-2.5 h-2.5" />
                        )}
                        <span>
                          {team.type === 'private'
                            ? lang === 'tr'
                              ? 'Kapalı'
                              : 'Private'
                            : lang === 'tr'
                              ? 'Açık'
                              : 'Open'}
                        </span>
                      </span>
                      {team.hasLauncher && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium border border-accent-soft bg-accent-soft text-accent shrink-0">
                          Launcher
                        </span>
                      )}
                      {team.platformTag && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium border border-subtle bg-elevated text-ink-2 shrink-0">
                          {team.platformTag}
                        </span>
                      )}
                      {deltaText && (
                        <span className="font-tech text-[10px] font-semibold text-emerald-500 shrink-0">
                          ▲ {deltaText}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-ink-2 min-w-0">
                      <GpuBadgeIcons gpu={team.gpu} isLight={isLight} />
                      <span className="truncate">{localizeDynamicText(team.gpu || '—', lang)}</span>
                    </div>

                    <span className="font-tech text-xs font-medium text-ink truncate">
                      {localizeDynamicText(team.fps, lang)}
                    </span>

                    <span className="text-xs text-ink-2 truncate">
                      {localizeDynamicText(team.stage || '—', lang)}
                    </span>

                    <div className="flex items-center justify-end gap-2.5">
                      <div className="w-16 h-1.5 rounded-full bg-track overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor:
                              rank === 1 || team.progress >= 50
                                ? 'var(--accent)'
                                : 'var(--ink-muted)',
                          }}
                        />
                      </div>
                      <span
                        className={`font-tech text-xs font-bold w-12 text-right ${
                          rank === 1 ? 'text-accent' : 'text-ink'
                        }`}
                      >
                        {lang === 'tr' ? `%${team.progress}` : `${team.progress}%`}
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <a
                        href={team.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-elevated ui-tactile"
                        title={lang === 'tr' ? 'Kaynağa git' : 'Open source'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Mobile Compact Row */}
                  <div className="md:hidden space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <RankBadge rank={rank} isLight={isLight} size="sm" />
                        <span className="text-[13px] font-semibold text-ink truncate">
                          {team.name}
                        </span>
                        <span className="text-[10px] text-ink-3 shrink-0">
                          {team.type === 'private'
                            ? lang === 'tr'
                              ? 'Kapalı'
                              : 'Private'
                            : lang === 'tr'
                              ? 'Açık'
                              : 'Open'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-tech text-sm font-bold ${
                            rank === 1 ? 'text-accent' : 'text-ink'
                          }`}
                        >
                          {lang === 'tr' ? `%${team.progress}` : `${team.progress}%`}
                        </span>
                        <a
                          href={team.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded text-ink-3 hover:text-ink"
                          aria-label="Source"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px] text-ink-2">
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <span className="font-tech font-medium text-ink">
                          {localizeDynamicText(team.fps, lang)}
                        </span>
                        {team.gpu && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <GpuBadgeIcons gpu={team.gpu} isLight={isLight} />
                            <span className="truncate">{localizeDynamicText(team.gpu, lang)}</span>
                          </span>
                        )}
                      </div>
                      {team.stage && (
                        <span className="text-[10px] text-ink-3 truncate shrink-0 max-w-[140px]">
                          {localizeDynamicText(team.stage, lang)}
                        </span>
                      )}
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-track overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor:
                            rank === 1 || team.progress >= 50
                              ? 'var(--accent)'
                              : 'var(--ink-muted)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* EXPANDED CARD VIEW */
        <div className="space-y-3">
          {visibleTeams.map((team) => {
            const rank = team.globalRank;
            const barWidth = Math.min(100, Math.max(2, team.progress));
            const updatedText = formatTeamUpdated(team.updatedAt || lastSyncAt, lang);
            const leaderSummary = rank === 1 ? buildLeaderSummary(team, lang) : '';
            const prevVal = prevScores[team.name];
            const diffVal =
              typeof prevVal === 'number' && team.progress > prevVal
                ? Number((team.progress - prevVal).toFixed(1))
                : 0;
            const deltaText = team.delta || (diffVal > 0 ? `+${diffVal}%` : '');

            return (
              <article
                key={team.name}
                className={`rounded-lg border bg-surface p-4 space-y-3 ui-tactile ${
                  rank === 1 ? 'border-accent-soft' : 'border-subtle hover:border-default'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <RankBadge rank={rank} isLight={isLight} />
                      <button
                        type="button"
                        onClick={() => onSelectTeam(team)}
                        className="text-base font-bold text-ink hover:underline underline-offset-2 truncate text-left"
                      >
                        {team.name}
                      </button>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          team.type === 'private'
                            ? 'border-subtle bg-elevated text-ink-3'
                            : isLight
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {team.type === 'private' ? (
                          <Lock className="w-2.5 h-2.5" />
                        ) : (
                          <Code2 className="w-2.5 h-2.5" />
                        )}
                        <span>
                          {team.type === 'private'
                            ? lang === 'tr'
                              ? 'Kapalı Ekip'
                              : 'Private'
                            : lang === 'tr'
                              ? 'Açık Kaynak'
                              : 'Open Source'}
                        </span>
                      </span>
                      {deltaText && (
                        <span className="font-tech text-[11px] font-semibold text-emerald-500">
                          ▲ {deltaText}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap text-xs text-ink-2">
                      <span className="font-tech font-semibold text-ink">
                        {localizeDynamicText(team.fps, lang)}
                      </span>
                      {team.gpu && (
                        <>
                          <span className="text-ink-3">·</span>
                          <span className="inline-flex items-center gap-1">
                            <GpuBadgeIcons gpu={team.gpu} isLight={isLight} />
                            <span>{localizeDynamicText(team.gpu, lang)}</span>
                          </span>
                        </>
                      )}
                      {team.stage && (
                        <>
                          <span className="text-ink-3">·</span>
                          <span>{localizeDynamicText(team.stage, lang)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`font-display text-2xl font-bold leading-none ${
                        rank === 1 ? 'text-accent' : 'text-ink'
                      }`}
                    >
                      {lang === 'tr' ? `%${team.progress}` : `${team.progress}%`}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectTeam(team)}
                      className="px-2.5 py-1.5 rounded-md border border-subtle bg-elevated text-[11px] font-semibold text-ink-2 hover:text-ink hover:border-default ui-tactile"
                    >
                      {lang === 'tr' ? 'Detay' : 'Details'}
                    </button>
                    <a
                      href={team.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md border border-subtle bg-elevated text-ink-2 hover:text-ink hover:border-default ui-tactile"
                      title={lang === 'tr' ? 'Kaynağa git' : 'Source'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Progress + Milestones */}
                <div className="space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-track overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor:
                          rank === 1 || team.progress >= 50 ? 'var(--accent)' : 'var(--ink-muted)',
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {MILESTONES.map((m) => {
                      const reached = team.progress >= m.min;
                      return (
                        <div key={m.key} className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: reached ? 'var(--accent)' : 'var(--border-strong)',
                            }}
                          />
                          <span
                            className={`text-[10px] truncate ${
                              reached ? 'text-ink-2 font-medium' : 'text-ink-3 opacity-60'
                            }`}
                          >
                            {m[lang]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {leaderSummary && (
                  <div className="rounded-md border border-subtle bg-panel-tint px-3.5 py-2.5 text-xs leading-relaxed text-ink-2 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
                    <p>{leaderSummary}</p>
                  </div>
                )}

                {updatedText && (
                  <div className="pt-2 border-t border-subtle flex items-center justify-between text-[11px] text-ink-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        {lang === 'tr' ? 'Son güncelleme:' : 'Updated:'}{' '}
                        <strong className="font-medium text-ink-2">{updatedText}</strong>
                      </span>
                    </span>
                    {team.commits7d > 0 && (
                      <span className="font-tech">
                        {team.commits7d} {lang === 'tr' ? 'commit (7g)' : 'commits (7d)'}
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Expand / Collapse All Teams Button */}
      {filteredTeams.length > INITIAL_TEAMS_LIMIT && teamSearch.trim().length === 0 && (
        <button
          type="button"
          onClick={() => setShowAllTeams((v) => !v)}
          className="w-full py-2.5 px-4 rounded-lg border border-subtle bg-surface hover:border-default hover-surface text-xs font-semibold text-ink-2 hover:text-ink flex items-center justify-center gap-1.5 ui-tactile"
        >
          {showAllTeams ? (
            <>
              <span>{lang === 'tr' ? `İlk ${INITIAL_TEAMS_LIMIT} Ekibi Göster` : `Show Top ${INITIAL_TEAMS_LIMIT}`}</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>
                {lang === 'tr'
                  ? `Tüm Ekipleri Göster (${filteredTeams.length - INITIAL_TEAMS_LIMIT} ekip daha)`
                  : `Show All Efforts (${filteredTeams.length - INITIAL_TEAMS_LIMIT} more)`}
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </section>
  );
}
