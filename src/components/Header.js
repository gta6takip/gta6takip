'use client';

import React from 'react';
import {
  ChevronDown,
  Check,
  RefreshCw,
  Smartphone,
  Trophy,
  MessageSquare,
  Cpu,
  Newspaper,
  PanelRightClose,
  PanelRightOpen,
  Eye,
} from 'lucide-react';
import {
  APP_VERSION,
  THEMES,
  THEME_GROUPS,
  getCountryLabel,
} from '../lib/constants';
import {
  BrandLogoMark,
  CountryFlag,
  FlagTR,
  FlagUS,
} from './Icons';

export function Header({
  lang,
  themeKey,
  activeTab,
  onSelectTab,
  onlineCount,
  chatActiveCount,
  unreadWhileClosed,
  countryStats,
  onlineMenuOpen,
  setOnlineMenuOpen,
  themeMenuOpen,
  setThemeMenuOpen,
  onSelectTheme,
  onSelectLang,
  onOpenChangelog,
  isStandalone,
  onInstallPwa,
  countdown,
  syncing,
  onRefresh,
  chatDockOpen,
  onToggleChatDock,
}) {
  const theme = THEMES[themeKey] || THEMES.leonida;

  const renderThemePopover = () =>
    themeMenuOpen && (
      <div className="absolute right-0 mt-2 w-64 rounded-lg border border-default bg-surface p-1.5 shadow-popover z-50 space-y-2">
        {THEME_GROUPS.map((grp) => {
          const groupThemes = Object.values(THEMES).filter((t) => t.group === grp.id);
          return (
            <div key={grp.id} className="space-y-0.5">
              <div className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-tech uppercase tracking-wider text-ink-3">
                {grp.id === 'eyecare' && <Eye className="w-3 h-3 text-emerald-500 shrink-0" />}
                <span>{lang === 'tr' ? grp.tr : grp.en}</span>
              </div>
              {groupThemes.map((t) => {
                const isSelected = themeKey === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTheme(t.id)}
                    className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left hover-surface ui-tactile ${
                      isSelected ? 'bg-panel-tint text-ink' : 'text-ink-2'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5 min-w-0">
                      <span className="inline-flex items-center gap-0.5 shrink-0">
                        {t.swatches.map((hex, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-[3px] border border-black/20"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-xs truncate ${isSelected ? 'font-semibold text-ink' : 'font-medium'}`}>
                          {t.label[lang]}
                        </span>
                        <span className="block text-[10px] text-ink-3 truncate">
                          {t.sub[lang]}
                        </span>
                      </span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    );

  const navItems = [
    { id: 'race', icon: Trophy, tr: 'Yarış Tablosu', en: 'Leaderboard' },
    { id: 'chat', icon: MessageSquare, tr: 'Canlı Sohbet', en: 'Live Chat' },
    { id: 'system', icon: Cpu, tr: 'Sistem Testi', en: 'System Check' },
    { id: 'news', icon: Newspaper, tr: 'Haber & DMCA', en: 'News & DMCA' },
  ];

  const renderOnlinePopover = () =>
    onlineMenuOpen && (
      <div className="absolute right-0 mt-2 w-56 rounded-lg border border-default bg-surface p-2 shadow-popover z-50 space-y-1">
        <div className="px-2 py-1 flex items-center justify-between text-[10px] font-tech uppercase tracking-wider text-ink-3">
          <span>{lang === 'tr' ? 'Bağlı Ülkeler' : 'Active Regions'}</span>
          <span className="text-ink-2 font-semibold">{onlineCount}</span>
        </div>
        <div className="max-h-56 overflow-y-auto gta-scroll space-y-0.5">
          {countryStats.map((c) => (
            <div
              key={c.code}
              className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs bg-panel-tint"
            >
              <span className="inline-flex items-center gap-2 min-w-0 text-ink">
                <CountryFlag code={c.code} />
                <span className="truncate font-medium">{getCountryLabel(c.code, lang)}</span>
              </span>
              <span className="font-tech font-semibold text-ink-2 shrink-0">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <header className="sticky top-0 z-40 border-b border-subtle bg-header-glass">
      <div className="max-w-[1380px] mx-auto px-3 sm:px-5 lg:px-6">
        {/* Desktop & Mobile Top Row */}
        <div className="h-14 flex items-center justify-between gap-2">
          {/* Left: Brand + Desktop Inline Nav */}
          <div className="flex items-center gap-3 xl:gap-4 min-w-0 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('race');
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                title={lang === 'tr' ? 'Ana görünüme dön' : 'Back to overview'}
                className="group inline-flex items-center gap-2 text-left cursor-pointer"
              >
                <BrandLogoMark />
                <span className="font-brand inline-flex items-baseline leading-none select-none">
                  <span className="font-display font-extrabold tracking-tight text-[21px] text-ink">
                    GTA6
                  </span>
                  <span className="font-semibold tracking-[0.09em] text-[12px] ml-0.5 text-ink-2">
                    TAKIP
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenChangelog}
                className="sm:inline-flex lg:hidden xl:inline-flex font-tech px-1.5 py-0.5 text-[10px] font-medium rounded border border-subtle bg-elevated text-ink-2 hover:text-ink hover:border-default ui-tactile"
                title={lang === 'tr' ? 'Sürüm Notları' : 'Release Notes'}
              >
                {APP_VERSION}
              </button>
            </div>

            {/* Desktop Primary Nav (Inline in header for clean single-bar chrome) */}
            <nav
              className="hidden lg:flex items-center gap-0.5 h-14 shrink-0"
              aria-label={lang === 'tr' ? 'Ana Menü' : 'Primary Navigation'}
            >
              {navItems.map((tab) => {
                const IconComp = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`relative h-full inline-flex items-center gap-1.5 px-2 xl:px-2.5 text-[12px] xl:text-[13px] font-medium whitespace-nowrap shrink-0 ui-tactile ${
                      active ? 'text-ink font-semibold' : 'text-ink-2 hover:text-ink'
                    }`}
                  >
                    <IconComp
                      strokeWidth={1.75}
                      className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-accent' : 'text-ink-3'}`}
                    />
                    <span>{lang === 'tr' ? tab.tr : tab.en}</span>
                    {tab.id === 'chat' && (
                      <span className="inline-flex items-center gap-1 ml-0.5">
                        {unreadWhileClosed > 0 && !active ? (
                          <span className="font-tech px-1.5 py-[1px] rounded text-[10px] font-semibold bg-accent">
                            +{unreadWhileClosed}
                          </span>
                        ) : (
                          <span className="font-tech text-[11px] text-ink-3">
                            {Math.max(chatActiveCount, active ? 1 : 0)}
                          </span>
                        )}
                      </span>
                    )}
                    {active && (
                      <span
                        className="absolute bottom-0 inset-x-2 h-[2px] rounded-full"
                        style={{ backgroundColor: 'var(--accent)' }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Utility Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Online Presence Pill */}
            <div className="relative" data-dropdown-root="true">
              <button
                type="button"
                onClick={() => {
                  setThemeMenuOpen(false);
                  setOnlineMenuOpen((v) => !v);
                }}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-subtle bg-elevated text-xs font-medium text-ink whitespace-nowrap hover:border-default ui-tactile"
                title={
                  lang === 'tr'
                    ? `${onlineCount} kişi çevrimiçi — ülke dağılımını gör`
                    : `${onlineCount} online — view regions`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-tech font-semibold">{onlineCount}</span>
                <span className="hidden 2xl:inline text-ink-2">
                  {lang === 'tr' ? 'çevrimiçi' : 'online'}
                </span>
                <ChevronDown className="w-3 h-3 text-ink-3" />
              </button>
              {renderOnlinePopover()}
            </div>

            {/* Language Switcher */}
            <div className="hidden sm:inline-flex items-center rounded-md border border-subtle bg-elevated p-0.5">
              <button
                type="button"
                onClick={() => onSelectLang('tr')}
                className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-[11px] font-semibold ui-tactile ${
                  lang === 'tr' ? 'bg-active-pill' : 'text-ink-2 hover:text-ink'
                }`}
              >
                <FlagTR className="w-3 h-2 rounded-[1px]" />
                <span>TR</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectLang('en')}
                className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-[11px] font-semibold ui-tactile ${
                  lang === 'en' ? 'bg-active-pill' : 'text-ink-2 hover:text-ink'
                }`}
              >
                <FlagUS className="w-3 h-2 rounded-[1px]" />
                <span>EN</span>
              </button>
            </div>

            {/* Theme Switcher */}
            <div className="relative hidden sm:block" data-dropdown-root="true">
              <button
                type="button"
                onClick={() => {
                  setOnlineMenuOpen(false);
                  setThemeMenuOpen((v) => !v);
                }}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-subtle bg-elevated text-xs font-medium text-ink-2 hover:text-ink hover:border-default ui-tactile"
                title={lang === 'tr' ? 'Tema değiştir' : 'Switch theme'}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: theme.dot }}
                />
                <span className="hidden 2xl:inline">{lang === 'tr' ? 'Tema' : 'Theme'}</span>
                <ChevronDown className="w-3 h-3 text-ink-3" />
              </button>
              {renderThemePopover()}
            </div>

            {/* PWA Install (Compact icon until wide desktop) */}
            {!isStandalone && (
              <button
                type="button"
                onClick={onInstallPwa}
                className="hidden md:inline-flex lg:hidden xl:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-subtle bg-elevated text-xs font-medium text-ink-2 hover:text-ink hover:border-default ui-tactile"
                title={lang === 'tr' ? 'Uygulama olarak ekle' : 'Install as App'}
                aria-label={lang === 'tr' ? 'Uygulama olarak ekle' : 'Install as App'}
              >
                <Smartphone className="w-3.5 h-3.5 text-ink-3" />
                <span className="hidden 2xl:inline">{lang === 'tr' ? 'Uygulama' : 'App'}</span>
              </button>
            )}

            {/* Sync Countdown */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={syncing}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-subtle bg-elevated text-xs font-medium text-ink-2 hover:text-ink hover:border-default ui-tactile disabled:opacity-60"
              title={lang === 'tr' ? 'Verileri şimdi yenile' : 'Refresh data now'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-accent' : 'text-ink-3'}`} />
              <span className="font-tech text-[11px]">{countdown}s</span>
            </button>

            {/* Desktop Chat Dock Toggle (when on Race tab) */}
            {activeTab === 'race' && (
              <button
                type="button"
                onClick={onToggleChatDock}
                className={`hidden lg:inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap ui-tactile ${
                  chatDockOpen
                    ? 'border-accent-soft bg-accent-soft text-accent'
                    : 'border-subtle bg-elevated text-ink-2 hover:text-ink hover:border-default'
                }`}
                title={
                  chatDockOpen
                    ? lang === 'tr'
                      ? 'Sohbet panelini gizle'
                      : 'Hide live chat panel'
                    : lang === 'tr'
                      ? 'Sağ sohbet panelini aç'
                      : 'Show live chat panel'
                }
              >
                {chatDockOpen ? (
                  <PanelRightClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelRightOpen className="w-3.5 h-3.5" />
                )}
                <span className="hidden xl:inline">{lang === 'tr' ? 'Sohbet' : 'Chat'}</span>
                <span className="font-tech text-[11px] opacity-90">
                  {Math.max(chatActiveCount, chatDockOpen ? 1 : 0)}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Tablet Secondary Nav Row (sm to lg) */}
        <div className="hidden sm:flex lg:hidden items-center gap-1 pb-2 -mt-0.5 overflow-x-auto no-scrollbar">
          {navItems.map((tab) => {
            const IconComp = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ui-tactile ${
                  active ? 'bg-active-pill font-semibold' : 'text-ink-2 hover:text-ink hover-surface'
                }`}
              >
                <IconComp strokeWidth={1.75} className="w-3.5 h-3.5" />
                <span>{lang === 'tr' ? tab.tr : tab.en}</span>
                {tab.id === 'chat' && (
                  <span className="font-tech text-[10px] opacity-80">
                    {Math.max(chatActiveCount, active ? 1 : 0)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Compact Utility Strip */}
        <div className="flex sm:hidden items-center justify-between gap-1.5 pb-2.5 pt-0.5">
          <div className="inline-flex items-center rounded-md border border-subtle bg-elevated p-0.5">
            <button
              type="button"
              onClick={() => onSelectLang('tr')}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold ${
                lang === 'tr' ? 'bg-active-pill' : 'text-ink-2'
              }`}
            >
              <FlagTR className="w-3.5 h-2.5 rounded-[1px]" />
              <span>TR</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectLang('en')}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold ${
                lang === 'en' ? 'bg-active-pill' : 'text-ink-2'
              }`}
            >
              <FlagUS className="w-3.5 h-2.5 rounded-[1px]" />
              <span>EN</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative" data-dropdown-root="true">
              <button
                type="button"
                onClick={() => {
                  setOnlineMenuOpen(false);
                  setThemeMenuOpen((v) => !v);
                }}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-subtle bg-elevated text-[11px] font-medium text-ink-2"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: theme.dot }}
                />
                <span>{lang === 'tr' ? 'Tema' : 'Theme'}</span>
                <ChevronDown className="w-3 h-3 text-ink-3" />
              </button>
              {renderThemePopover()}
            </div>

            {!isStandalone && (
              <button
                type="button"
                onClick={onInstallPwa}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-subtle bg-elevated text-[11px] font-medium text-ink-2"
              >
                <Smartphone className="w-3 h-3 text-ink-3" />
                <span>{lang === 'tr' ? 'Yükle' : 'App'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={syncing}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-subtle bg-elevated text-[11px] font-tech text-ink-2"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-accent' : 'text-ink-3'}`} />
              <span>{countdown}s</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav({
  lang,
  activeTab,
  onSelectTab,
  unreadWhileClosed,
  chatActiveCount,
  hidden,
}) {
  if (hidden) return null;

  const items = [
    { id: 'race', icon: Trophy, tr: 'Yarış', en: 'Race' },
    { id: 'chat', icon: MessageSquare, tr: 'Sohbet', en: 'Chat' },
    { id: 'system', icon: Cpu, tr: 'Sistem', en: 'System' },
    { id: 'news', icon: Newspaper, tr: 'Haber', en: 'News' },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-subtle bg-header-glass pb-[env(safe-area-inset-bottom)]"
      aria-label={lang === 'tr' ? 'Mobil Menü' : 'Mobile Navigation'}
    >
      <div className="grid grid-cols-4">
        {items.map((tab) => {
          const IconComp = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 py-2.5 min-h-[54px] text-[10px] font-medium ui-tactile ${
                active ? 'text-ink font-semibold' : 'text-ink-3'
              }`}
            >
              {active && (
                <span
                  className="absolute top-0 inset-x-4 h-[2px] rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
              <div className="relative">
                <IconComp
                  strokeWidth={1.8}
                  className={`w-[18px] h-[18px] ${active ? 'text-accent' : ''}`}
                />
                {tab.id === 'chat' && !active && unreadWhileClosed > 0 && (
                  <span className="absolute -top-1.5 -right-3 font-tech px-1 rounded text-[9px] font-bold bg-accent">
                    +{unreadWhileClosed}
                  </span>
                )}
                {tab.id === 'chat' && !active && unreadWhileClosed === 0 && chatActiveCount > 0 && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </div>
              <span>{lang === 'tr' ? tab.tr : tab.en}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
