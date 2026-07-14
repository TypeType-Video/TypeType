import type { ReactNode } from "react";
import { ThemeToggleButton } from "./theme-toggle-button";

type Props = {
  children: ReactNode;
  fixed?: boolean;
  contentClassName: string;
};

export function AuthBackdrop({ children, fixed = false, contentClassName }: Props) {
  const shellClass = fixed
    ? "fixed inset-0 z-50 overflow-hidden bg-app text-fg"
    : "relative min-h-screen overflow-hidden bg-app text-fg";

  return (
    <div className={shellClass}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-slate-50 dark:bg-black">
        <div
          className="absolute left-1/2 top-1/2 h-[180vh] w-[180vw] -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-[0.34] dark:opacity-70"
          style={{
            backgroundImage: "url('/logo.svg')",
            backgroundPosition: "0 0",
            backgroundRepeat: "repeat",
            backgroundSize: "150px 150px",
          }}
        />
        <div className="absolute inset-0 bg-white/34 dark:bg-black/28" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(226,232,240,0.42)_72%,rgba(100,116,139,0.58)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.42)_72%,rgba(0,0,0,0.72)_100%)]" />
        <div className="absolute -top-24 right-[12%] h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
        <div className="absolute bottom-0 left-[8%] h-80 w-80 rounded-full bg-cyan-300/24 blur-3xl dark:bg-cyan-500/10" />
      </div>
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggleButton className="border-white/40 bg-white/65 shadow-lg backdrop-blur dark:border-white/15 dark:bg-white/10" />
      </div>
      <main className={`relative z-10 ${contentClassName}`}>{children}</main>
    </div>
  );
}
