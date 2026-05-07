import type { SVGProps } from "react";

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="logo-bot-face" x1="16" y1="18" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="0.56" stopColor="#A7F3D0" />
          <stop offset="1" stopColor="#C4B5FD" />
        </linearGradient>
        <linearGradient id="logo-bot-screen" x1="20" y1="26" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1B2A" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#020617" />
      <rect x="1" y="1" width="62" height="62" rx="13" stroke="#67E8F9" strokeOpacity="0.26" strokeWidth="2" />
      <path d="M32 15V10" stroke="#67E8F9" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="32" cy="8" r="3" fill="#A7F3D0" />
      <path d="M15 33H11" stroke="#67E8F9" strokeWidth="4" strokeLinecap="round" />
      <path d="M53 33H49" stroke="#C4B5FD" strokeWidth="4" strokeLinecap="round" />
      <rect x="15" y="16" width="34" height="34" rx="12" fill="url(#logo-bot-face)" />
      <rect x="18.5" y="19.5" width="27" height="27" rx="9" fill="url(#logo-bot-screen)" stroke="#E0FAFF" strokeOpacity="0.22" />
      <circle cx="27" cy="31" r="3.5" fill="#67E8F9" />
      <circle cx="38" cy="31" r="3.5" fill="#A7F3D0" />
      <path d="M24 39H29L32 36L35.5 41L40 35" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 52H42" stroke="#67E8F9" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
