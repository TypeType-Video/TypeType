import { Link } from "@tanstack/react-router";

function LogoBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute left-1/2 top-1/2 h-[180vh] w-[180vw] -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-70"
        style={{
          backgroundImage: "url('/logo.svg')",
          backgroundPosition: "0 0",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      />
      <div className="absolute inset-0 bg-black/28" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.42)_72%,rgba(0,0,0,0.72)_100%)]" />
    </div>
  );
}

export function GuestDisabledScreen() {
  return (
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] flex-col items-center justify-center gap-5 overflow-hidden bg-app px-5 py-8 text-fg sm:gap-6">
      <LogoBackdrop />
      <img
        src="/guest-disabled-bird.gif"
        width="498"
        height="311"
        alt=""
        className="relative z-10 w-full max-w-[min(30rem,calc(100vw-2.5rem))] rounded-2xl shadow-2xl"
      />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-2 text-center drop-shadow-[0_1px_18px_rgba(0,0,0,0.75)]">
        <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Guest mode disabled
        </p>
        <p className="text-fg-muted text-xs leading-5 sm:text-sm">
          The admin has disabled guest access.
        </p>
        <p className="text-fg-muted text-xs leading-5 sm:text-sm">
          To use this TypeType instance, create an account or sign in with an existing one.
        </p>
      </div>
      <div className="relative z-10 flex w-full max-w-xs flex-col justify-center gap-2.5 sm:max-w-none sm:flex-row">
        <Link
          to="/register"
          search={{ redirect: undefined }}
          className="cursor-pointer rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-center font-medium text-fg text-sm backdrop-blur transition-colors hover:bg-white/15"
        >
          Create account
        </Link>
        <Link
          to="/login"
          search={{ redirect: undefined }}
          className="cursor-pointer rounded-full border border-border-strong bg-surface/70 px-5 py-2.5 text-center font-medium text-fg-muted text-sm backdrop-blur transition-colors hover:bg-surface-strong hover:text-fg"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
