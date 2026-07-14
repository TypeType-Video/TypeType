function SvgIcon({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

export function ShareIcon() {
  return (
    <SvgIcon label="Share">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </SvgIcon>
  );
}

export function ListPlusIcon() {
  return (
    <SvgIcon label="Save to playlist">
      <path d="M11 12H3" />
      <path d="M16 6H3" />
      <path d="M16 18H3" />
      <path d="M18 9v6" />
      <path d="M21 12h-6" />
    </SvgIcon>
  );
}

export function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <SvgIcon label="Favorite">
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={filled ? "currentColor" : "none"}
      />
    </SvgIcon>
  );
}

export function DanmakuIcon() {
  return (
    <SvgIcon label="Bullet comments">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="14" y2="12" />
      <line x1="3" y1="17" x2="17" y2="17" />
    </SvgIcon>
  );
}

export function MoreIcon() {
  return (
    <SvgIcon label="More actions">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </SvgIcon>
  );
}

export function DownloadIcon() {
  return (
    <SvgIcon label="Download">
      <path d="M12 3v12" />
      <polyline points="7 10 12 15 17 10" />
      <path d="M5 21h14" />
    </SvgIcon>
  );
}

export function HeadphonesIcon() {
  return (
    <SvgIcon label="Audio only">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5Z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" />
    </SvgIcon>
  );
}

export function VerifiedBadgeIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="w-3 h-3 text-fg-muted flex-shrink-0"
      fill="currentColor"
      aria-label="Verified"
    >
      <path d="M8 1L9.8 3.2L12.5 2.5L12.5 5.3L15 6.5L13.5 9L15 11.5L12.5 12.7L12.5 15.5L9.8 14.8L8 17L6.2 14.8L3.5 15.5L3.5 12.7L1 11.5L2.5 9L1 6.5L3.5 5.3L3.5 2.5L6.2 3.2Z" />
      <polyline
        points="5,9 7,11 11,7"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BugIcon() {
  return (
    <SvgIcon label="Report bug">
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </SvgIcon>
  );
}

export function ThumbsUpIcon() {
  return (
    <SvgIcon label="Likes">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </SvgIcon>
  );
}

export function ThumbsDownIcon() {
  return (
    <SvgIcon label="Dislikes">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </SvgIcon>
  );
}
