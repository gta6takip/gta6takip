'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';

export function BrandLogoMark() {
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-elevated border border-default shrink-0 select-none transition-colors group-hover:border-strong"
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="w-5 h-5">
        <path
          d="M4.5 7.5H9.1L13.5 19.6L17.9 7.5H22.4L15.6 24.5H11.3L4.5 7.5Z"
          fill="currentColor"
          className="text-ink"
        />
        <rect x="23.6" y="7.5" width="3.9" height="17" rx="0.5" fill="var(--accent)" />
      </svg>
    </span>
  );
}

export function RankBadge({ rank, isLight = false, size = 'md' }) {
  const num = Number(rank);
  const dim = size === 'sm' ? 'w-5 h-5' : 'w-[22px] h-[22px]';

  if (num === 1) {
    const stroke = isLight ? '#A16207' : '#E5AE44';
    const fill = isLight ? 'rgba(161, 98, 7, 0.10)' : 'rgba(229, 174, 68, 0.13)';
    return (
      <span
        className={`inline-flex items-center justify-center ${dim} shrink-0 select-none`}
        title="1."
        aria-label="1."
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
          <path
            d="M4 6.5L7.5 9L12 4.5L16.5 9L20 6.5V16.8L12 20.5L4 16.8V6.5Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <text
            x="12"
            y="16.2"
            textAnchor="middle"
            fill={stroke}
            fontSize="8.5"
            fontWeight="700"
            fontFamily="var(--font-mono), ui-monospace, monospace"
          >
            1
          </text>
        </svg>
      </span>
    );
  }

  if (num === 2) {
    const stroke = isLight ? '#4E5D70' : '#B2BFCE';
    const fill = isLight ? 'rgba(78, 93, 112, 0.09)' : 'rgba(178, 191, 206, 0.12)';
    return (
      <span
        className={`inline-flex items-center justify-center ${dim} shrink-0 select-none`}
        title="2."
        aria-label="2."
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
          <polygon
            points="12,3.5 19.5,7.8 19.5,16.2 12,20.5 4.5,16.2 4.5,7.8"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <text
            x="12"
            y="15.2"
            textAnchor="middle"
            fill={stroke}
            fontSize="9"
            fontWeight="700"
            fontFamily="var(--font-mono), ui-monospace, monospace"
          >
            2
          </text>
        </svg>
      </span>
    );
  }

  if (num === 3) {
    const stroke = isLight ? '#9A5B32' : '#CF8E60';
    const fill = isLight ? 'rgba(154, 91, 50, 0.09)' : 'rgba(207, 142, 96, 0.12)';
    return (
      <span
        className={`inline-flex items-center justify-center ${dim} shrink-0 select-none`}
        title="3."
        aria-label="3."
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
          <polygon
            points="12,3.5 19.5,7.8 19.5,16.2 12,20.5 4.5,16.2 4.5,7.8"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <text
            x="12"
            y="15.2"
            textAnchor="middle"
            fill={stroke}
            fontSize="9"
            fontWeight="700"
            fontFamily="var(--font-mono), ui-monospace, monospace"
          >
            3
          </text>
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${dim} font-tech text-[11px] font-semibold text-ink-3 shrink-0 select-none`}
    >
      {num}
    </span>
  );
}

export function IconAmd({ className = 'w-3 h-3 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.324 9.137L24 14.813V0H9.187l5.676 5.676h3.461v3.461zM14.813 18.324H5.676V9.187L0 14.863V24h9.137l5.676-5.676z" />
    </svg>
  );
}

export function IconNvidia({ className = 'w-3.5 h-3.5 shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.398 0-.787-.062-1.167-.185v-4.34a3.01 3.01 0 0 1 2.752 1.724l2.044-1.724s-1.494-1.959-4.012-1.959c-.269 0-.531.02-.784.051v.656zm0-4.366v1.894c.14-.011.281-.017.424-.022 5.475-.176 9.048 4.492 9.048 4.492s-4.093 4.976-8.353 4.976c-.379 0-.751-.035-1.119-.098v1.186c.309.04.626.063.95.063 3.963 0 6.83-2.022 9.603-4.416.459.369 2.341 1.265 2.725 1.658-2.633 2.203-8.765 3.979-12.244 3.979-.338 0-.67-.016-.994-.047v1.727H24V4.432H8.948zm0 9.95v1.298c-3.779-.673-4.827-4.597-4.827-4.597s1.815-2.011 4.827-2.326v1.282c-.008 0-.016-.001-.024-.001-1.579-.191-2.815 1.285-2.815 1.285s.692 2.482 2.839 3.059zM2.393 10.94s2.241-3.307 6.555-3.635V6.05C3.97 6.451 0 10.654 0 10.654s2.348 6.798 8.948 7.428v-1.307c-4.832-.608-6.555-5.835-6.555-5.835z" />
    </svg>
  );
}

export function GpuBadgeIcons({ gpu, isLight }) {
  const lower = String(gpu || '').toLowerCase();
  const hasAmd = lower.includes('amd');
  const hasNvidia = lower.includes('nvidia');
  if (!hasAmd && !hasNvidia) return null;
  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      {hasAmd && (
        <IconAmd className={`w-3 h-3 ${isLight ? 'text-[#C81E2B]' : 'text-[#F05A60]'}`} />
      )}
      {hasNvidia && (
        <IconNvidia className={`w-3.5 h-3.5 ${isLight ? 'text-[#4F7D00]' : 'text-[#84CC16]'}`} />
      )}
    </span>
  );
}

export function FlagTR({ className = 'w-4 h-3 rounded-[2px] shrink-0' }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" fill="#D91E2A" />
      <circle cx="9.5" cy="8" r="4.2" fill="#FFFFFF" />
      <circle cx="10.6" cy="8" r="3.4" fill="#D91E2A" />
      <polygon points="15.2,8 13.7,8.5 14.3,7 13.3,5.8 14.8,5.9" fill="#FFFFFF" />
    </svg>
  );
}

export function FlagUS({ className = 'w-4 h-3 rounded-[2px] shrink-0' }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" fill="#B22234" />
      <rect y="2" width="24" height="2" fill="#FFFFFF" />
      <rect y="6" width="24" height="2" fill="#FFFFFF" />
      <rect y="10" width="24" height="2" fill="#FFFFFF" />
      <rect y="14" width="24" height="2" fill="#FFFFFF" />
      <rect width="10" height="9" fill="#3C3B6E" />
    </svg>
  );
}

export function CountryFlag({ code }) {
  const [imgFailed, setImgFailed] = useState(false);
  const cc = String(code || '').trim().toLowerCase();

  if (cc === 'tr') return <FlagTR className="w-4 h-3 rounded-[2px] shrink-0" />;
  if (cc === 'us') return <FlagUS className="w-4 h-3 rounded-[2px] shrink-0" />;

  if (!/^[a-z]{2}$/.test(cc) || imgFailed) {
    return <Globe className="w-3.5 h-3.5 text-ink-3 shrink-0" aria-hidden="true" />;
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      alt={cc.toUpperCase()}
      width={16}
      height={12}
      loading="lazy"
      onError={() => setImgFailed(true)}
      className="w-4 h-3 rounded-[2px] object-cover shrink-0"
    />
  );
}

export function IconX({ className = 'w-3.5 h-3.5 fill-current shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function IconWhatsApp({ className = 'w-3.5 h-3.5 fill-current shrink-0' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.172.109-1.891-.125-.438-.141-1-.328-1.719-.641-3.016-1.297-4.984-4.328-5.141-4.531-.156-.203-1.234-1.641-1.234-3.125s.781-2.219 1.063-2.516c.281-.297.609-.375.813-.375.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.156.328-.297.5-.141.172-.313.391-.438.516-.156.141-.313.297-.141.594.172.297.781 1.281 1.672 2.078 1.156 1.031 2.125 1.344 2.422 1.5.297.156.469.125.641-.078.172-.203.734-.859.938-1.156.203-.297.406-.25.672-.156.266.094 1.703.813 2 .953.297.156.484.219.563.344.078.125.078.719-.172 1.422z" />
    </svg>
  );
}
