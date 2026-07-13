import { Heart } from "lucide-react";

const PROFILE_URL = "https://github.com/Priveetee";
const SPONSOR_URL = "https://github.com/sponsors/Priveetee";

export function AppFooter() {
  return (
    <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-border py-5 text-xs text-fg-soft">
      <span>
        Built by{" "}
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-fg-muted hover:text-fg"
        >
          Priveetee
        </a>
        .
      </span>
      <a
        href={SPONSOR_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-accent hover:text-accent-strong"
      >
        <Heart size={13} />
        Want to throw money at me?
      </a>
    </footer>
  );
}
