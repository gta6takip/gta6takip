'use client';

import React from 'react';
import {
  Send,
  Reply,
  Volume2,
  VolumeX,
  KeyRound,
  Pin,
  Maximize2,
  Minimize2,
  X,
  ShieldCheck,
  Shield,
  Clock,
  ArrowDown,
  RefreshCw,
  Trash2,
  Ban,
  SmilePlus,
  User,
  Check,
} from 'lucide-react';
import {
  CHAT_COOLDOWN_SEC,
  CHAT_REACTION_EMOJIS,
  formatChatTime,
  getNickTone,
} from '../lib/constants';
import { FlagTR, FlagUS } from './Icons';

function renderMessageText(text, currentNick) {
  const str = String(text || '');
  const parts = str.split(/(@[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ.-]{2,20})/g);
  const myLower = String(currentNick || '').trim().toLowerCase();

  return parts.map((part, idx) => {
    if (part.startsWith('@') && part.length >= 3) {
      const target = part.slice(1).toLowerCase();
      const isMe = myLower.length >= 2 && target === myLower;
      return (
        <span
          key={idx}
          className="px-1 py-[1px] rounded font-semibold"
          style={{
            backgroundColor: isMe ? 'var(--msg-mention-bg)' : 'var(--bg-hover)',
            color: isMe ? 'var(--msg-mention-ink)' : 'var(--ink-primary)',
          }}
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function LiveChat({
  mode = 'page', // 'dock' | 'page'
  lang,
  isLight,
  chatRoom,
  onSwitchRoom,
  chatMessages,
  chatLoading,
  chatLoadFailed,
  onRetryFetch,
  chatActiveCount,
  chatFullscreen,
  setChatFullscreen,
  onExpandFromDock,
  onCloseDock,
  chatSoundOn,
  onToggleSound,
  staffPinOpen,
  setStaffPinOpen,
  staffPin,
  setStaffPin,
  staffModeActive,
  isTypingAdminNick,
  pinnedNotice,
  pinExpanded,
  setPinExpanded,
  pinEditorOpen,
  setPinEditorOpen,
  pinDraft,
  setPinDraft,
  pinSaving,
  onSavePin,
  chatNick,
  onNickChange,
  nickEditing,
  setNickEditing,
  chatInput,
  setChatInput,
  chatSending,
  chatCooldown,
  chatNotice,
  chatError,
  replyTo,
  setReplyTo,
  onStartReply,
  onMentionUser,
  myReactions,
  onToggleReaction,
  activeMsgActionId,
  setActiveMsgActionId,
  clearingId,
  banningId,
  onClearMessage,
  onBanMessage,
  onSendChat,
  chatListRef,
  chatEndRef,
  chatInputRef,
  onListScroll,
  unreadWhileScrolled,
  onScrollBottom,
  setChatInputFocused,
}) {
  const isEnRoom = chatRoom === 'en';
  const isDock = mode === 'dock' && !chatFullscreen;
  const hasValidNick = chatNick.trim().length >= 2;
  const inCooldown = !isTypingAdminNick && !staffModeActive && chatCooldown > 0;
  const canSend = !chatSending && !inCooldown && chatInput.trim().length > 0;

  const containerClass = chatFullscreen
    ? 'fixed inset-0 z-[100] h-[100dvh] flex flex-col bg-canvas overflow-hidden'
    : isDock
      ? 'h-[calc(100dvh-88px)] rounded-lg border border-subtle bg-surface flex flex-col overflow-hidden'
      : 'h-[calc(100dvh-186px)] sm:h-[calc(100dvh-116px)] min-h-[480px] rounded-lg border border-subtle bg-surface flex flex-col overflow-hidden';

  return (
    <section
      id={isDock ? 'canli-sohbet-panel' : 'canli-sohbet'}
      className={containerClass}
      aria-label={lang === 'tr' ? 'Canlı Sohbet' : 'Live Chat'}
    >
      {/* SINGLE COMPACT HEADER STRIP */}
      <div className="px-3 py-2.5 border-b border-subtle bg-panel-tint flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Room Switcher */}
          <div className="inline-flex items-center rounded-md border border-subtle bg-surface p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onSwitchRoom('tr')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold ui-tactile ${
                chatRoom === 'tr' ? 'bg-active-pill' : 'text-ink-2 hover:text-ink'
              }`}
              title="Türkçe Sohbet Odası"
            >
              <FlagTR className="w-3.5 h-2.5 rounded-[1px]" />
              <span>TR</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchRoom('en')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold ui-tactile ${
                chatRoom === 'en' ? 'bg-active-pill' : 'text-ink-2 hover:text-ink'
              }`}
              title="Global English Chat Room"
            >
              <FlagUS className="w-3.5 h-2.5 rounded-[1px]" />
              <span>EN</span>
            </button>
          </div>

          {/* Live Room Count */}
          <div className="inline-flex items-center gap-1.5 text-[11px] text-ink-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-tech font-semibold text-ink">
              {Math.max(chatActiveCount, 1)}
            </span>
            <span className="truncate hidden sm:inline">
              {isEnRoom ? 'in chat' : 'sohbette'}
            </span>
          </div>
        </div>

        {/* Quiet Utility Icon Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {staffModeActive && (
            <button
              type="button"
              onClick={() => {
                setPinDraft(pinnedNotice?.message || '');
                setPinEditorOpen((v) => !v);
              }}
              className={`p-1.5 rounded-md border ui-tactile ${
                pinEditorOpen
                  ? 'border-sky-500/40 bg-sky-500/15 text-sky-400'
                  : 'border-transparent text-ink-2 hover:text-ink hover:bg-elevated'
              }`}
              title={isEnRoom ? 'Pin announcement' : 'Duyuru sabitle / kaldır'}
              aria-label={isEnRoom ? 'Pin announcement' : 'Duyuru sabitle'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setStaffPinOpen((v) => !v)}
            className={`p-1.5 rounded-md border ui-tactile ${
              staffModeActive
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                : staffPinOpen
                  ? 'border-default bg-surface text-ink'
                  : 'border-transparent text-ink-3 hover:text-ink hover:bg-elevated'
            }`}
            title={
              staffModeActive
                ? isEnRoom
                  ? 'Staff mode active'
                  : 'Yetkili modu açık'
                : isEnRoom
                  ? 'Staff / Moderator PIN'
                  : 'Yetkili / Moderatör girişi'
            }
            aria-label={isEnRoom ? 'Staff login' : 'Yetkili girişi'}
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className={`p-1.5 rounded-md ui-tactile ${
              chatSoundOn
                ? 'text-ink-2 hover:text-ink hover:bg-elevated'
                : 'text-ink-3 opacity-60 hover:opacity-100 hover:bg-elevated'
            }`}
            title={
              chatSoundOn
                ? isEnRoom
                  ? 'Mute notifications'
                  : 'Bildirim sesini kapat'
                : isEnRoom
                  ? 'Unmute notifications'
                  : 'Bildirim sesini aç'
            }
            aria-label={chatSoundOn ? 'Mute' : 'Unmute'}
          >
            {chatSoundOn ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          {isDock ? (
            <>
              <button
                type="button"
                onClick={onExpandFromDock}
                className="p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-elevated ui-tactile"
                title={lang === 'tr' ? 'Geniş sohbet görünümünü aç' : 'Open full chat view'}
                aria-label={lang === 'tr' ? 'Genişlet' : 'Expand'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onCloseDock}
                className="p-1.5 rounded-md text-ink-3 hover:text-ink hover:bg-elevated ui-tactile"
                title={lang === 'tr' ? 'Paneli gizle' : 'Hide panel'}
                aria-label={lang === 'tr' ? 'Kapat' : 'Close'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setChatFullscreen((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-subtle bg-surface text-[11px] font-medium text-ink-2 hover:text-ink hover:border-default ui-tactile"
              title={
                chatFullscreen
                  ? lang === 'tr'
                    ? 'Tam ekrandan çık'
                    : 'Exit fullscreen'
                  : lang === 'tr'
                    ? 'Tam ekran sohbet'
                    : 'Fullscreen chat'
              }
            >
              {chatFullscreen ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>{lang === 'tr' ? 'Küçült' : 'Exit'}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden sm:inline">{lang === 'tr' ? 'Tam Ekran' : 'Focus'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* INLINE STAFF PIN BAR (ONLY WHEN OPENED OR ADMIN NICK WITHOUT PIN YET) */}
      {(staffPinOpen || (isTypingAdminNick && !staffModeActive)) && (
        <div className="px-3 py-2 border-b border-subtle bg-elevated flex items-center gap-2 text-xs shrink-0">
          <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <input
            type="password"
            value={staffPin}
            onChange={(e) => setStaffPin(e.target.value)}
            placeholder={
              isTypingAdminNick
                ? 'Admin PIN girin...'
                : isEnRoom
                  ? 'Enter Staff / Mod PIN...'
                  : 'Moderatör veya Admin PIN girin...'
            }
            className="flex-1 bg-transparent outline-none text-xs font-medium text-ink placeholder:text-ink-3 min-w-0"
          />
          {staffPin && (
            <button
              type="button"
              onClick={() => setStaffPin('')}
              className="text-[11px] font-medium text-ink-3 hover:text-ink shrink-0"
            >
              {isEnRoom ? 'Clear' : 'Temizle'}
            </button>
          )}
          {!isTypingAdminNick && (
            <button
              type="button"
              onClick={() => setStaffPinOpen(false)}
              className="p-0.5 text-ink-3 hover:text-ink shrink-0"
              aria-label="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* INLINE PIN EDITOR (STAFF ONLY) */}
      {staffModeActive && pinEditorOpen && (
        <form
          onSubmit={onSavePin}
          className="px-3 py-2 border-b border-subtle bg-elevated flex items-center gap-2 text-xs shrink-0"
        >
          <Pin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <input
            type="text"
            maxLength={180}
            value={pinDraft}
            onChange={(e) => setPinDraft(e.target.value)}
            placeholder="Sabitlenecek duyuru (boş bırakıp kaydet = kaldır)..."
            className="flex-1 bg-transparent outline-none text-xs text-ink placeholder:text-ink-3 min-w-0"
          />
          <button
            type="submit"
            disabled={pinSaving}
            className="px-2.5 py-1 rounded text-[11px] font-semibold bg-active-pill shrink-0 disabled:opacity-50"
          >
            {pinSaving ? '...' : 'Kaydet'}
          </button>
        </form>
      )}

      {/* SLIM PINNED ANNOUNCEMENT BAR */}
      {pinnedNotice?.message && (
        <button
          type="button"
          onClick={() => setPinExpanded((v) => !v)}
          className="w-full text-left px-3 py-2 border-b border-subtle flex items-start gap-2 text-[11px] shrink-0 transition-colors"
          style={{ backgroundColor: 'var(--msg-admin-bg)' }}
        >
          <Pin className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'var(--msg-admin-bar)' }} />
          <div className={`min-w-0 flex-1 leading-snug ${pinExpanded ? '' : 'truncate'}`}>
            <span
              className="font-tech font-bold uppercase tracking-wider mr-1.5"
              style={{ color: 'var(--msg-admin-bar)' }}
            >
              {isEnRoom ? 'PIN:' : 'DUYURU:'}
            </span>
            <span className="text-ink-2 font-medium break-words">{pinnedNotice.message}</span>
          </div>
        </button>
      )}

      {/* MESSAGE FEED */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          ref={chatListRef}
          onScroll={onListScroll}
          className="gta-scroll flex-1 min-h-0 overflow-y-auto px-2 sm:px-3 py-3 space-y-0.5"
        >
          {/* Timeout banner with cached messages */}
          {chatLoadFailed && chatMessages.length > 0 && (
            <div className="mb-2 flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-subtle bg-elevated text-[11px]">
              <span className="text-ink-2">
                {isEnRoom
                  ? 'Live refresh timed out — showing cached messages.'
                  : 'Bağlantı gecikti — önbellekteki mesajlar gösteriliyor.'}
              </span>
              <button
                type="button"
                onClick={onRetryFetch}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-active-pill shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isEnRoom ? 'Retry' : 'Yenile'}</span>
              </button>
            </div>
          )}

          {chatLoading && chatMessages.length === 0 ? (
            <div className="py-10 space-y-3 px-2">
              {[0, 1, 2, 3].map((sk) => (
                <div key={sk} className="flex items-start gap-2.5 animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-elevated shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-24 rounded bg-elevated" />
                    <div className="h-3 w-4/5 rounded bg-elevated" />
                  </div>
                </div>
              ))}
            </div>
          ) : chatLoadFailed && chatMessages.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-xs text-ink-3">
                {isEnRoom
                  ? 'Could not load messages right now.'
                  : 'Bağlantı gecikti, mesajlar şu an alınamadı.'}
              </p>
              <button
                type="button"
                onClick={onRetryFetch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-default bg-elevated text-xs font-semibold text-ink hover:border-strong hover-surface ui-tactile"
              >
                <RefreshCw className="w-3.5 h-3.5 text-ink-2" />
                <span>{isEnRoom ? 'Try Again' : 'Tekrar Dene'}</span>
              </button>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="py-12 text-center space-y-1">
              <p className="text-xs font-medium text-ink-2">
                {isEnRoom ? 'No messages yet.' : 'Henüz mesaj yok.'}
              </p>
              <p className="text-[11px] text-ink-3">
                {isEnRoom ? 'Start the conversation below.' : 'İlk mesajı aşağıdan sen yaz.'}
              </p>
            </div>
          ) : (
            chatMessages.map((m, msgIdx) => {
              const prevMsg = msgIdx > 0 ? chatMessages[msgIdx - 1] : null;
              const prevTime = prevMsg?.created_at ? new Date(prevMsg.created_at).getTime() : 0;
              const currTime = m.created_at ? new Date(m.created_at).getTime() : 0;
              const isGrouped =
                Boolean(prevMsg) &&
                !m.reply_to_nick &&
                !m.reply_to_text &&
                String(prevMsg.nickname || '').trim().toLowerCase() ===
                  String(m.nickname || '').trim().toLowerCase() &&
                Math.abs(currTime - prevTime) < 5 * 60 * 1000;

              const isAdminMsg =
                String(m.nickname || '').trim().toLowerCase() === 'batmancodex' || m.role === 'admin';
              const isModMsg = !isAdminMsg && m.role === 'mod';
              const isSelf =
                hasValidNick &&
                String(m.nickname || '').trim().toLowerCase() === chatNick.trim().toLowerCase();

              const tone = getNickTone(m.nickname, isLight);
              const initial = String(m.nickname || '?').trim().charAt(0).toUpperCase() || '?';
              const reactionsObj =
                m.reactions && typeof m.reactions === 'object' ? m.reactions : {};
              const activeReactions = CHAT_REACTION_EMOJIS.filter(
                (em) => (Number(reactionsObj[em]) || 0) > 0
              );
              const mobileActionsOpen = activeMsgActionId === m.id;

              const highlightBg = isSelf
                ? 'var(--msg-self-bg)'
                : isAdminMsg
                  ? 'var(--msg-admin-bg)'
                  : isModMsg
                    ? 'var(--msg-mod-bg)'
                    : undefined;

              const accentBarColor = isSelf
                ? 'var(--msg-self-bar)'
                : isAdminMsg
                  ? 'var(--msg-admin-bar)'
                  : isModMsg
                    ? 'var(--msg-mod-bar)'
                    : undefined;

              return (
                <div
                  key={m.id}
                  style={highlightBg ? { backgroundColor: highlightBg } : undefined}
                  className={`group relative rounded-md pl-2.5 pr-2 transition-colors ${
                    isGrouped ? 'py-0.5' : 'pt-2 pb-1.5 mt-1'
                  } ${!highlightBg ? 'hover-surface' : ''}`}
                >
                  {/* Straight Flat 2px Accent Strip (ZERO curved border-l bug) */}
                  {accentBarColor && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full"
                      style={{ backgroundColor: accentBarColor }}
                    />
                  )}

                  {/* FLOATING DESKTOP HOVER ACTION BAR (ZERO LAYOUT SHIFT) */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:group-hover:flex items-center gap-0.5 absolute right-2 -top-3 z-20 px-1 py-0.5 rounded-md border border-default bg-surface shadow-popover"
                  >
                    {CHAT_REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => onToggleReaction(m, emoji)}
                        className="px-1.5 py-0.5 rounded text-xs hover-surface ui-tactile"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                    <span className="w-px h-3.5 bg-[var(--border-subtle)] mx-0.5" />
                    <button
                      type="button"
                      onClick={() => onStartReply(m)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-ink-2 hover:text-ink hover-surface ui-tactile"
                      title={isEnRoom ? 'Reply' : 'Yanıtla'}
                    >
                      <Reply className="w-3 h-3" />
                    </button>
                    {staffModeActive && !isAdminMsg && (
                      <>
                        <span className="w-px h-3.5 bg-[var(--border-subtle)] mx-0.5" />
                        <button
                          type="button"
                          disabled={clearingId === m.id || banningId === m.id}
                          onClick={() => onClearMessage(m)}
                          className="p-1 rounded text-amber-500 hover:bg-amber-500/15 ui-tactile disabled:opacity-40"
                          title={isEnRoom ? 'Delete message' : 'Mesajı sil'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={banningId === m.id || clearingId === m.id}
                          onClick={() => onBanMessage(m)}
                          className="p-1 rounded text-red-500 hover:bg-red-500/15 ui-tactile disabled:opacity-40"
                          title={isEnRoom ? 'Ban user & delete' : 'Kullanıcıyı banla ve sil'}
                        >
                          <Ban className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* REPLY CONTEXT LINE */}
                  {(m.reply_to_nick || m.reply_to_text) && (
                    <div className="mb-1 pl-7 flex items-center gap-1.5 text-[11px] text-ink-3 min-w-0">
                      <Reply className="w-3 h-3 shrink-0 text-accent" />
                      <span className="font-semibold text-ink-2 shrink-0">
                        @{m.reply_to_nick || (isEnRoom ? 'User' : 'Kullanıcı')}
                      </span>
                      <span className="truncate opacity-80">{m.reply_to_text}</span>
                    </div>
                  )}

                  {/* MESSAGE CONTENT */}
                  {!isGrouped ? (
                    <div className="flex items-start gap-2">
                      {/* Avatar */}
                      {isAdminMsg ? (
                        <span
                          className="w-5 h-5 mt-0.5 rounded-full border inline-flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: 'var(--msg-admin-bg)',
                            borderColor: 'var(--msg-admin-bar)',
                            color: 'var(--msg-admin-bar)',
                          }}
                        >
                          <ShieldCheck className="w-3 h-3" />
                        </span>
                      ) : isModMsg ? (
                        <span
                          className="w-5 h-5 mt-0.5 rounded-full border inline-flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: 'var(--msg-mod-bg)',
                            borderColor: 'var(--msg-mod-bar)',
                            color: 'var(--msg-mod-bar)',
                          }}
                        >
                          <Shield className="w-3 h-3" />
                        </span>
                      ) : (
                        <span
                          className={`w-5 h-5 mt-0.5 rounded-full border text-[10px] font-bold inline-flex items-center justify-center shrink-0 ${tone.bg} ${tone.text} ${tone.ring}`}
                        >
                          {initial}
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <button
                              type="button"
                              onClick={(e) => onMentionUser(e, m.nickname)}
                              style={
                                isAdminMsg
                                  ? { color: 'var(--msg-admin-ink)' }
                                  : isModMsg
                                    ? { color: 'var(--msg-mod-ink)' }
                                    : undefined
                              }
                              className={`text-[12px] hover:underline underline-offset-2 truncate cursor-pointer ${
                                isAdminMsg || isModMsg ? 'font-bold' : 'font-semibold text-ink'
                              }`}
                              title={isEnRoom ? 'Click to @mention' : '@etiketlemek için tıkla'}
                            >
                              {m.nickname}
                            </button>

                            {isAdminMsg && (
                              <span
                                className="font-tech px-1 py-[0.5px] rounded text-[9px] font-bold border"
                                style={{
                                  backgroundColor: 'var(--msg-admin-bg)',
                                  borderColor: 'var(--msg-admin-bar)',
                                  color: 'var(--msg-admin-bar)',
                                }}
                              >
                                ADMIN
                              </span>
                            )}
                            {isModMsg && (
                              <span
                                className="font-tech px-1 py-[0.5px] rounded text-[9px] font-bold border"
                                style={{
                                  backgroundColor: 'var(--msg-mod-bg)',
                                  borderColor: 'var(--msg-mod-bar)',
                                  color: 'var(--msg-mod-bar)',
                                }}
                              >
                                MOD
                              </span>
                            )}

                            <span className="font-tech text-[10px] text-ink-3">
                              {formatChatTime(m.created_at)}
                            </span>
                          </div>

                          {/* Mobile Tap Trigger */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMsgActionId((prev) => (prev === m.id ? null : m.id));
                            }}
                            className="sm:hidden p-1 -mr-1 rounded text-ink-3 hover:text-ink"
                            aria-label={isEnRoom ? 'Message actions' : 'Mesaj işlemleri'}
                          >
                            <SmilePlus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[13px] leading-[1.45] text-ink break-words mt-0.5">
                          {renderMessageText(m.message, chatNick)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Grouped follow-up line */
                    <div className="flex items-start gap-2">
                      <span className="w-5 shrink-0 font-tech text-[9px] text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity pt-1 select-none text-right">
                        {formatChatTime(m.created_at)}
                      </span>
                      <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                        <p className="text-[13px] leading-[1.45] text-ink break-words flex-1 min-w-0">
                          {renderMessageText(m.message, chatNick)}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMsgActionId((prev) => (prev === m.id ? null : m.id));
                          }}
                          className="sm:hidden p-1 -mr-1 rounded text-ink-3 shrink-0"
                          aria-label={isEnRoom ? 'Message actions' : 'Mesaj işlemleri'}
                        >
                          <SmilePlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE REACTIONS */}
                  {activeReactions.length > 0 && (
                    <div className="mt-1.5 pl-7 flex items-center gap-1 flex-wrap">
                      {activeReactions.map((emoji) => {
                        const cnt = Number(reactionsObj[emoji]) || 0;
                        const reacted = Boolean(myReactions[`${m.id}:${emoji}`]);
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleReaction(m, emoji);
                            }}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border ui-tactile ${
                              reacted
                                ? 'border-accent-soft bg-accent-soft text-accent'
                                : 'border-subtle bg-elevated text-ink-2 hover:border-default'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="font-tech text-[10px]">{cnt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* MOBILE INLINE ACTION TRAY (ONLY WHEN TAPPED) */}
                  {mobileActionsOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="sm:hidden mt-2 pl-7 flex items-center gap-1.5 flex-wrap"
                    >
                      {CHAT_REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            onToggleReaction(m, emoji);
                            setActiveMsgActionId(null);
                          }}
                          className="px-2 py-1 rounded-md border border-subtle bg-elevated text-xs"
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          onStartReply(m);
                          setActiveMsgActionId(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-subtle bg-elevated text-[11px] font-medium text-ink"
                      >
                        <Reply className="w-3 h-3" />
                        <span>{isEnRoom ? 'Reply' : 'Yanıtla'}</span>
                      </button>
                      {staffModeActive && !isAdminMsg && (
                        <>
                          <button
                            type="button"
                            disabled={clearingId === m.id || banningId === m.id}
                            onClick={() => onClearMessage(m)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-amber-500/35 bg-amber-500/15 text-amber-400 text-[11px] font-medium"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{isEnRoom ? 'Clear' : 'Sil'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={banningId === m.id || clearingId === m.id}
                            onClick={() => onBanMessage(m)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-500/35 bg-red-500/15 text-red-400 text-[11px] font-medium"
                          >
                            <Ban className="w-3 h-3" />
                            <span>{isEnRoom ? 'Ban' : 'Banla'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* FLOATING JUMP TO NEWEST PILL */}
        {unreadWhileScrolled > 0 && (
          <button
            type="button"
            onClick={onScrollBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-active-pill shadow-popover ui-tactile"
          >
            <ArrowDown className="w-3 h-3" />
            <span>
              {unreadWhileScrolled} {isEnRoom ? 'new' : 'yeni mesaj'}
            </span>
          </button>
        )}
      </div>

      {/* SMART COMPOSER AREA */}
      <div className="border-t border-subtle bg-panel-tint shrink-0 relative">
        {/* Thin 2px Cooldown Progress Line */}
        {inCooldown && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-track overflow-hidden">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(chatCooldown / CHAT_COOLDOWN_SEC) * 100}%`,
                backgroundColor: 'var(--accent)',
              }}
            />
          </div>
        )}

        {/* Attached Reply Context */}
        {replyTo && (
          <div className="px-3 py-2 border-b border-subtle bg-surface flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <Reply className="w-3 h-3 shrink-0 text-accent" />
              <span className="font-semibold text-ink shrink-0">@{replyTo.nickname}</span>
              <span className="truncate text-ink-3">{replyTo.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="p-0.5 rounded text-ink-3 hover:text-ink shrink-0"
              aria-label={isEnRoom ? 'Cancel reply' : 'Yanıtı iptal et'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={onSendChat} className="p-2.5 sm:p-3 space-y-2">
          {/* Nickname Bar: Collapses to sleek identity chip once set! */}
          {!hasValidNick || nickEditing ? (
            <div className="flex items-center gap-2 rounded-md border border-default bg-surface px-2.5 py-1.5 focus-within:border-strong">
              {isTypingAdminNick ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 text-ink-3 shrink-0" />
              )}
              <input
                type="text"
                maxLength={20}
                value={chatNick}
                onFocus={() => setChatInputFocused(true)}
                onBlur={() => setChatInputFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatNick.trim().length >= 2) {
                    e.preventDefault();
                    setNickEditing(false);
                    chatInputRef.current?.focus();
                  }
                }}
                onChange={(e) => onNickChange(e.target.value)}
                placeholder={isEnRoom ? 'Choose a nickname (2–20 chars)...' : 'Rumuzunu yaz (2–20 karakter)...'}
                className="flex-1 bg-transparent outline-none font-semibold text-[16px] sm:text-xs text-ink placeholder:font-normal placeholder:text-ink-3 min-w-0"
              />
              {hasValidNick && (
                <button
                  type="button"
                  onClick={() => {
                    setNickEditing(false);
                    chatInputRef.current?.focus();
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-active-pill shrink-0"
                >
                  <Check className="w-3 h-3" />
                  <span>{isEnRoom ? 'Done' : 'Tamam'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 px-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setNickEditing(true)}
                className="inline-flex items-center gap-1.5 text-ink-2 hover:text-ink transition-colors min-w-0"
                title={isEnRoom ? 'Change nickname' : 'Rumuzu değiştir'}
              >
                {isTypingAdminNick ? (
                  <ShieldCheck className="w-3 h-3 text-amber-500 shrink-0" />
                ) : (
                  <User className="w-3 h-3 text-ink-3 shrink-0" />
                )}
                <span className="font-semibold text-ink truncate">{chatNick}</span>
                <span className="text-[10px] text-ink-3 underline underline-offset-2 shrink-0">
                  {isEnRoom ? 'edit' : 'değiştir'}
                </span>
              </button>

              <span className="font-tech text-[10px] text-ink-3 shrink-0">
                {inCooldown
                  ? isEnRoom
                    ? `Wait ${chatCooldown}s`
                    : `${chatCooldown} sn bekle`
                  : isEnRoom
                    ? '20s slowmode · no links'
                    : '20 sn koruma · link yasak'}
              </span>
            </div>
          )}

          {/* Full-Width Message Input Row */}
          <div className="flex items-center gap-1.5 rounded-md border border-default bg-surface p-1 pl-3 focus-within:border-strong transition-colors">
            <input
              ref={chatInputRef}
              type="text"
              maxLength={280}
              disabled={inCooldown || chatSending}
              value={chatInput}
              onFocus={() => setChatInputFocused(true)}
              onBlur={() => setChatInputFocused(false)}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                inCooldown
                  ? isEnRoom
                    ? `Wait ${chatCooldown}s...`
                    : `Yeni mesaj için ${chatCooldown} saniye bekle...`
                  : isEnRoom
                    ? 'Write a message...'
                    : 'Mesajını yaz...'
              }
              className="flex-1 bg-transparent outline-none text-[16px] sm:text-[13px] text-ink placeholder:text-ink-3 min-w-0 disabled:opacity-55"
            />

            {chatInput.length > 180 && !inCooldown && (
              <span className="font-tech text-[10px] text-ink-3 pr-1 shrink-0">
                {chatInput.length}/280
              </span>
            )}

            <button
              type="submit"
              disabled={!canSend}
              className={`h-8 px-3 rounded text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 ui-tactile ${
                inCooldown
                  ? 'bg-elevated text-ink-3 cursor-not-allowed'
                  : canSend
                    ? 'bg-accent'
                    : 'bg-elevated text-ink-3 cursor-not-allowed'
              }`}
              aria-label={isEnRoom ? 'Send message' : 'Mesaj gönder'}
            >
              {inCooldown ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-tech">{chatCooldown}s</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span className={isDock ? 'hidden xl:inline' : 'inline'}>
                    {chatSending
                      ? '...'
                      : isEnRoom
                        ? 'Send'
                        : 'Gönder'}
                  </span>
                </>
              )}
            </button>
          </div>

          {chatNotice && (
            <p className="text-[11px] font-medium text-emerald-500 px-0.5">{chatNotice}</p>
          )}
          {chatError && (
            <p className="text-[11px] font-medium text-red-500 px-0.5">{chatError}</p>
          )}
        </form>
      </div>
    </section>
  );
}
