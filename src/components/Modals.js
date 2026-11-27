'use client';

import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Monitor,
  Star,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  MessageSquarePlus,
  Send,
  Smartphone,
} from 'lucide-react';
import { CHANGELOG, localizeDynamicText } from '../lib/constants';
import { GpuBadgeIcons, RankBadge } from './Icons';

function useEscapeClose(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
}

export function TeamDetailModal({ team, lang, isLight, onClose }) {
  useEscapeClose(Boolean(team), onClose);
  if (!team) return null;

  const displayHighlights =
    lang === 'tr' && Array.isArray(team.highlightsTr) && team.highlightsTr.length > 0
      ? team.highlightsTr
      : Array.isArray(team.highlights)
        ? team.highlights
        : [];

  const displayBlockers =
    lang === 'tr' && Array.isArray(team.blockersTr) && team.blockersTr.length > 0
      ? team.blockersTr
      : Array.isArray(team.blockers)
        ? team.blockers
        : [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="gta-scroll w-full sm:max-w-lg rounded-t-2xl sm:rounded-lg border border-default bg-surface p-5 space-y-4 max-h-[85dvh] overflow-y-auto shadow-popover"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {team.globalRank && (
                <RankBadge rank={team.globalRank} isLight={isLight} />
              )}
              <h3 className="text-lg font-bold tracking-tight text-ink truncate">{team.name}</h3>
              <span className="font-display text-2xl font-bold text-accent leading-none">
                {lang === 'tr' ? `%${team.progress}` : `${team.progress}%`}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap text-xs text-ink-2">
              <span className="inline-flex items-center gap-1 font-tech font-medium text-ink">
                <Monitor className="w-3.5 h-3.5 text-ink-3" />
                {localizeDynamicText(team.fps, lang)}
              </span>
              {team.gpu && (
                <span className="inline-flex items-center gap-1">
                  <GpuBadgeIcons gpu={team.gpu} isLight={isLight} />
                  <span>{localizeDynamicText(team.gpu, lang)}</span>
                </span>
              )}
              {team.stars > 0 && (
                <span className="inline-flex items-center gap-1 font-tech">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {team.stars.toLocaleString('tr-TR')}
                </span>
              )}
              {team.commits7d > 0 && (
                <span className="inline-flex items-center gap-1 font-tech text-ink-3">
                  <GitCommit className="w-3 h-3" />
                  {team.commits7d} (7g)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md border border-subtle bg-elevated text-ink-2 hover:text-ink shrink-0 ui-tactile"
            aria-label={lang === 'tr' ? 'Kapat' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-track overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, Math.max(2, team.progress))}%`,
              backgroundColor: 'var(--accent)',
            }}
          />
        </div>

        {/* Summary fallback if no highlights/blockers */}
        {displayHighlights.length === 0 &&
          displayBlockers.length === 0 &&
          (team.summaryTr || team.summaryEn) && (
            <p className="text-xs leading-relaxed text-ink-2 rounded-md border border-subtle bg-panel-tint p-3.5">
              {lang === 'tr' ? team.summaryTr : team.summaryEn}
            </p>
          )}

        {displayHighlights.length > 0 && (
          <div className="rounded-md border border-subtle bg-panel-tint p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'tr' ? 'Neler Çalışıyor?' : 'What Works'}</span>
            </div>
            <ul className="space-y-1.5 text-xs leading-relaxed text-ink-2">
              {displayHighlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {displayBlockers.length > 0 && (
          <div className="rounded-md border border-subtle bg-panel-tint p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'tr' ? 'Eksik / Sorunlu Alanlar' : 'Current Blockers'}</span>
            </div>
            <ul className="space-y-1.5 text-xs leading-relaxed text-ink-2">
              {displayBlockers.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <a
            href={team.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-md text-xs font-semibold bg-accent inline-flex items-center justify-center gap-1.5 ui-tactile"
          >
            <span>{lang === 'tr' ? 'GitHub / Kaynağa Git' : 'Open GitHub / Source'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-md border border-default bg-elevated text-xs font-semibold text-ink-2 hover:text-ink ui-tactile"
          >
            {lang === 'tr' ? 'Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChangelogModal({ open, lang, onClose }) {
  useEscapeClose(open, onClose);
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="gta-scroll w-full max-w-lg rounded-lg border border-default bg-surface p-5 space-y-4 max-h-[82dvh] overflow-y-auto shadow-popover"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-ink">
            {lang === 'tr' ? 'Sürüm Notları' : 'Release Notes'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md border border-subtle bg-elevated text-ink-2 hover:text-ink"
            aria-label={lang === 'tr' ? 'Kapat' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {CHANGELOG.map((rel) => (
            <div
              key={rel.version}
              className="rounded-md border border-subtle bg-panel-tint p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-tech font-bold text-sm text-accent">{rel.version}</span>
                <span className="text-[11px] text-ink-3">
                  {lang === 'tr' ? rel.dateTr : rel.dateEn}
                </span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed text-ink-2">
                {(lang === 'tr' ? rel.itemsTr : rel.itemsEn).map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedbackModal({
  open,
  lang,
  onClose,
  feedbackName,
  setFeedbackName,
  feedbackEmail,
  setFeedbackEmail,
  feedbackMsg,
  setFeedbackMsg,
  feedbackStatus,
  onSubmit,
}) {
  useEscapeClose(open, onClose);
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-default bg-surface p-5 space-y-4 shadow-popover"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-accent" />
            <h3 className="text-base font-bold text-ink">
              {lang === 'tr' ? 'Tavsiye / Fikir Gönder' : 'Send Feedback'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md border border-subtle bg-elevated text-ink-2 hover:text-ink"
            aria-label={lang === 'tr' ? 'Kapat' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedbackStatus === 'sent' ? (
          <div className="rounded-md border border-subtle bg-panel-tint p-4 text-center space-y-3">
            <p className="text-sm font-semibold text-emerald-500">
              {lang === 'tr' ? 'Mesajın iletildi, teşekkürler.' : 'Feedback sent, thank you.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-md text-xs font-semibold bg-active-pill"
            >
              {lang === 'tr' ? 'Kapat' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-ink-2 mb-1">
                {lang === 'tr' ? 'Adın / Rumuzun (opsiyonel)' : 'Name / Nickname (optional)'}
              </label>
              <input
                type="text"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                placeholder={lang === 'tr' ? 'Örn: Ahmet' : 'e.g. Alex'}
                className="w-full rounded-md border border-default bg-elevated px-3 py-2 text-ink placeholder:text-ink-3 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-ink-2 mb-1">
                {lang === 'tr' ? 'E-posta (opsiyonel)' : 'Email (optional)'}
              </label>
              <input
                type="email"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full rounded-md border border-default bg-elevated px-3 py-2 text-ink placeholder:text-ink-3 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-ink-2 mb-1">
                {lang === 'tr' ? 'Tavsiye / Fikrin *' : 'Your Message *'}
              </label>
              <textarea
                required
                rows={4}
                value={feedbackMsg}
                onChange={(e) => setFeedbackMsg(e.target.value)}
                placeholder={
                  lang === 'tr'
                    ? 'Site hakkında önerini veya gördüğün bir hatayı yazabilirsin...'
                    : 'Share feature ideas or bug reports...'
                }
                className="w-full rounded-md border border-default bg-elevated px-3 py-2 text-ink placeholder:text-ink-3 outline-none resize-none"
              />
            </div>

            {feedbackStatus === 'error' && (
              <p className="text-red-500 font-medium">
                {lang === 'tr'
                  ? 'Gönderilirken bir hata oluştu, lütfen tekrar dene.'
                  : 'Failed to send, please try again.'}
              </p>
            )}

            <button
              type="submit"
              disabled={feedbackStatus === 'sending'}
              className="w-full py-2.5 rounded-md font-semibold bg-accent flex items-center justify-center gap-1.5 ui-tactile disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {feedbackStatus === 'sending'
                  ? lang === 'tr'
                    ? 'Gönderiliyor...'
                    : 'Sending...'
                  : lang === 'tr'
                    ? 'Gönder'
                    : 'Send'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function PwaInstallModal({ open, lang, isIosDevice, onClose }) {
  useEscapeClose(open, onClose);
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-default bg-surface p-5 space-y-4 shadow-popover"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-accent" />
            <h3 className="text-base font-bold text-ink">
              {lang === 'tr' ? 'Uygulama Olarak Ekle' : 'Install as App'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md border border-subtle bg-elevated text-ink-2 hover:text-ink"
            aria-label={lang === 'tr' ? 'Kapat' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-md border border-subtle bg-panel-tint p-3.5 space-y-2 text-xs leading-relaxed">
          {isIosDevice ? (
            <>
              <p className="font-semibold text-ink">iPhone / iPad (Safari)</p>
              <ol className="list-decimal pl-4 space-y-1 text-ink-2">
                <li>{lang === 'tr' ? 'Alttaki Paylaş simgesine dokun.' : 'Tap the Share icon at the bottom.'}</li>
                <li>{lang === 'tr' ? 'Açılan menüden "Ana Ekrana Ekle" seçeneğine bas.' : 'Select "Add to Home Screen".'}</li>
                <li>{lang === 'tr' ? 'Sağ üstten "Ekle" diyerek GTA6takip kısayolunu oluştur.' : 'Tap "Add" to install GTA6takip.'}</li>
              </ol>
            </>
          ) : (
            <>
              <p className="font-semibold text-ink">
                {lang === 'tr' ? 'Android Chrome / Masaüstü' : 'Android Chrome / Desktop'}
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-ink-2">
                <li>{lang === 'tr' ? 'Tarayıcının sağ üstündeki menü (⋮) simgesine dokun.' : 'Open the browser menu (⋮).'}</li>
                <li>{lang === 'tr' ? '"Ana ekrana ekle" veya "Uygulamayı yükle" seçeneğine bas.' : 'Tap "Add to Home screen" or "Install app".'}</li>
              </ol>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 rounded-md text-xs font-semibold bg-active-pill ui-tactile"
        >
          {lang === 'tr' ? 'Anladım' : 'Got it'}
        </button>
      </div>
    </div>
  );
}
