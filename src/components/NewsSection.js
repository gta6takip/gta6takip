'use client';

import React from 'react';
import {
  RefreshCw,
  Globe,
  Newspaper,
  Code2,
  MessageSquare,
  Lock,
  Clock,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import {
  FALLBACK_DMCA,
  formatNewsRelativeTime,
} from '../lib/constants';

export function NewsSection({
  lang,
  isLight,
  newsFeedCache,
  newsFeedLoading,
  newsFeedCategory,
  setNewsFeedCategory,
  onRefreshNews,
  faqItems,
  openFaqIdx,
  setOpenFaqIdx,
  dmcaItems,
  radarOpen,
  setRadarOpen,
}) {
  const activeFeed = newsFeedCache[lang === 'en' ? 'en' : 'tr'];
  const allFeedItems = Array.isArray(activeFeed?.items) ? activeFeed.items : [];
  const filteredFeedItems =
    newsFeedCategory === 'all'
      ? allFeedItems
      : allFeedItems.filter((item) => item.category === newsFeedCategory);

  const feedCounts = activeFeed?.counts || {
    all: allFeedItems.length,
    press: allFeedItems.filter((i) => i.category === 'press').length,
    release: allFeedItems.filter((i) => i.category === 'release').length,
    community: allFeedItems.filter((i) => i.category === 'community').length,
    dmca: allFeedItems.filter((i) => i.category === 'dmca').length,
  };

  const categoryMeta = (cat) => {
    if (cat === 'dmca') {
      return {
        icon: Lock,
        label: lang === 'tr' ? 'DMCA Radarı' : 'DMCA',
        cls: isLight
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-red-500/10 text-red-400 border-red-500/20',
      };
    }
    if (cat === 'release') {
      return {
        icon: Code2,
        label: lang === 'tr' ? 'Sürüm & Kod' : 'Release',
        cls: isLight
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      };
    }
    if (cat === 'community') {
      return {
        icon: MessageSquare,
        label: 'Reddit',
        cls: isLight
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    }
    return {
      icon: Newspaper,
      label: lang === 'tr' ? 'Basın' : 'Press',
      cls: isLight
        ? 'bg-sky-50 text-sky-700 border-sky-200'
        : 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    };
  };

  const effectiveDmca =
    Array.isArray(dmcaItems) && dmcaItems.length > 0
      ? dmcaItems
      : FALLBACK_DMCA.map((d) => ({
          name: d.name,
          date: d.date,
          note: lang === 'tr' ? d.noteTr : d.noteEn,
          url: d.url,
        }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Live News Feed */}
      <section className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink">
              {lang === 'tr' ? 'Haberler & DMCA Akışı' : 'Live News & DMCA Feed'}
            </h2>
            <p className="text-xs text-ink-3">
              {lang === 'tr'
                ? 'Oyun basını, GitHub sürümleri, Reddit ve PortWatch DMCA bildirimleri otomatik taranır.'
                : 'Press coverage, GitHub releases, Reddit discussions, and PortWatch DMCA notices.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onRefreshNews}
            disabled={newsFeedLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-subtle bg-elevated text-xs font-medium text-ink-2 hover:text-ink hover:border-default ui-tactile disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${newsFeedLoading ? 'animate-spin text-accent' : ''}`} />
            <span>{lang === 'tr' ? 'Akışı Yenile' : 'Refresh'}</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'all', icon: Globe, tr: 'Tümü', en: 'All', count: feedCounts.all },
            { id: 'press', icon: Newspaper, tr: 'Basın', en: 'Press', count: feedCounts.press },
            { id: 'release', icon: Code2, tr: 'Sürüm & Kod', en: 'Releases', count: feedCounts.release },
            { id: 'community', icon: MessageSquare, tr: 'Reddit', en: 'Reddit', count: feedCounts.community },
            { id: 'dmca', icon: Lock, tr: 'DMCA Radarı', en: 'DMCA Radar', count: feedCounts.dmca },
          ].map((cat) => {
            const CatIcon = cat.icon;
            const active = newsFeedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setNewsFeedCategory(cat.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border ui-tactile ${
                  active
                    ? 'bg-active-pill border-transparent font-semibold'
                    : 'border-subtle bg-surface text-ink-2 hover:text-ink hover:border-default'
                }`}
              >
                <CatIcon strokeWidth={1.75} className="w-3.5 h-3.5 shrink-0" />
                <span>{lang === 'tr' ? cat.tr : cat.en}</span>
                <span className="font-tech text-[10px] opacity-75">{cat.count}</span>
              </button>
            );
          })}
        </div>

        {/* News Grid */}
        {newsFeedLoading && allFeedItems.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((sk) => (
              <div
                key={sk}
                className="rounded-lg border border-subtle bg-surface p-4 space-y-2.5 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 rounded bg-elevated" />
                  <div className="h-3 w-14 rounded bg-elevated" />
                </div>
                <div className="h-4 w-11/12 rounded bg-elevated" />
                <div className="h-3 w-3/4 rounded bg-elevated" />
              </div>
            ))}
          </div>
        ) : filteredFeedItems.length === 0 ? (
          <div className="rounded-lg border border-subtle bg-surface p-6 text-center text-xs text-ink-3">
            {lang === 'tr'
              ? 'Bu kategoride şimdilik yeni kayıt görünmüyor.'
              : 'No items in this category right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredFeedItems.map((item) => {
              const meta = categoryMeta(item.category);
              const MetaIcon = meta.icon;
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between gap-3 rounded-lg border border-subtle bg-surface p-4 hover:border-default hover-surface ui-tactile"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${meta.cls}`}
                      >
                        <MetaIcon strokeWidth={1.75} className="w-3 h-3 shrink-0" />
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center gap-1 font-tech text-[10px] text-ink-3">
                        <Clock className="w-3 h-3 shrink-0" />
                        {formatNewsRelativeTime(item.publishedAt, lang)}
                      </span>
                    </div>

                    <h3 className="text-[13px] font-semibold leading-snug text-ink line-clamp-2 group-hover:underline underline-offset-2">
                      {item.title}
                    </h3>

                    {item.summary && (
                      <p className="text-xs leading-relaxed text-ink-2 line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-subtle text-[11px]">
                    <span className="font-medium text-ink-2 truncate">{item.source}</span>
                    <span className="inline-flex items-center gap-1 text-ink-3 group-hover:text-ink shrink-0">
                      <span>{lang === 'tr' ? 'Kaynağa git' : 'Read'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Live DMCA & Security Radar */}
      <section className="rounded-lg border border-subtle bg-surface overflow-hidden">
        <button
          type="button"
          onClick={() => setRadarOpen((v) => !v)}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover-surface ui-tactile"
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-sm font-bold text-ink">
              {lang === 'tr' ? 'DMCA & Güvenlik Radarı' : 'DMCA & Security Radar'}
            </span>
            <span className="font-tech text-[11px] px-2 py-0.5 rounded bg-elevated border border-subtle text-ink-2">
              {effectiveDmca.length}{' '}
              {lang === 'tr' ? 'Kaldırılan · Sahte .EXE Uyarısı' : 'Removed · Fake .EXE Warning'}
            </span>
          </div>
          {radarOpen ? (
            <ChevronUp className="w-4 h-4 text-ink-3 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-3 shrink-0" />
          )}
        </button>

        {radarOpen && (
          <div className="px-4 pb-4 pt-3 border-t border-subtle space-y-3 bg-panel-tint">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {effectiveDmca.map((item) => (
                <div
                  key={item.name}
                  className="p-3 rounded-md border border-subtle bg-surface space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-red-500">{item.name}</span>
                    {item.date && (
                      <span className="font-tech text-[10px] text-ink-3">{String(item.date).slice(0, 10)}</span>
                    )}
                  </div>
                  <p className="text-ink-2 leading-relaxed">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-ink">
              <strong className="text-amber-500">
                {lang === 'tr' ? 'Güvenlik Uyarısı: ' : 'Security Warning: '}
              </strong>
              <span className="text-ink-2">
                {lang === 'tr'
                  ? 'İnternette dolaşan "GTA 6 PC Kurulum / Crack .exe" dosyalarının tamamı sahtedir ve yüksek oranda zararlı yazılım içerir. Hiçbir ekip halka açık tek tıkla kurulan bir oyun paketi dağıtmaz.'
                  : 'All "GTA 6 PC Installer / Crack .exe" files circulating online are fake malware. No team distributes a public one-click game installer.'}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Dynamic FAQ Accordion */}
      <section className="rounded-lg border border-subtle bg-surface overflow-hidden">
        <div className="px-4 py-3 border-b border-subtle bg-panel-tint flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent shrink-0" />
          <h2 className="text-sm font-bold text-ink">
            {lang === 'tr' ? 'Sık Sorulan Sorular' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover-surface ui-tactile"
                >
                  <span className="text-xs sm:text-[13px] font-semibold text-ink">
                    {lang === 'tr' ? item.qTr : item.qEn}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.live && (
                      <span className="font-tech text-[10px] px-1.5 py-0.5 rounded bg-elevated border border-subtle text-emerald-500">
                        {lang === 'tr' ? 'Canlı' : 'Live'}
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-ink-3" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-ink-3" />
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 text-xs leading-relaxed text-ink-2">
                    {lang === 'tr' ? item.aTr : item.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
