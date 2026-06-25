type Props = {
  direction: "previous" | "next";
  onClick?: () => void;
};

export function PlayerTrackButton({ direction, onClick }: Props) {
  if (!onClick) return null;
  const label = direction === "previous" ? "Previous video" : "Next video";

  return (
    <button
      type="button"
      className="vds-button typetype-track-button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <svg viewBox="0 0 32 32" className="vds-icon" fill="currentColor" aria-hidden="true">
        {direction === "previous" ? (
          <path d="M7 7h3v18H7V7Zm5 9 13 9V7l-13 9Z" />
        ) : (
          <path d="M22 7h3v18h-3V7ZM7 25l13-9L7 7v18Z" />
        )}
      </svg>
    </button>
  );
}
