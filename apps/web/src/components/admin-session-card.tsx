import { toApiUrl } from "../lib/env";
import { getOpenMojiUrl, pickOpenMojiCode } from "../lib/openmoji";
import type { AdminSession } from "../types/admin";
import type { AuthUser } from "../types/auth";

type Props = {
  session: AdminSession;
  user?: AuthUser;
};

function formatDuration(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "0:00";
  const totalSeconds = Math.floor(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function initials(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function avatarUrl(user: AuthUser | undefined, session: AdminSession): string | null {
  if (user?.avatarType === "emoji" && user.avatarCode) return getOpenMojiUrl(user.avatarCode);
  if (user?.avatarUrl) return toApiUrl(user.avatarUrl);
  if (user) return getOpenMojiUrl(pickOpenMojiCode(`${user.id}:${user.email}`));
  if (session.userId) return getOpenMojiUrl(pickOpenMojiCode(session.userId));
  return null;
}

export function AdminSessionCard({ session, user }: Props) {
  const name =
    user?.publicUsername ?? user?.name ?? session.username ?? session.userId ?? "Unknown user";
  const device = [session.deviceName, session.deviceType].filter(Boolean).join(" - ") || "Browser";
  const nowPlaying = session.nowPlaying;
  const stateLabel = nowPlaying ? (nowPlaying.paused ? "Paused" : "Playing") : "Online";
  const imageUrl = avatarUrl(user, session);
  const progress = nowPlaying?.durationMs
    ? Math.min(100, Math.max(0, (nowPlaying.positionMs / nowPlaying.durationMs) * 100))
    : 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-[#10151f] shadow-sm transition-colors hover:border-border-strong">
      <div className="relative aspect-video overflow-hidden bg-surface-soft">
        {nowPlaying?.thumbnail ? (
          <img
            src={nowPlaying.thumbnail}
            alt=""
            className="h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="relative h-full w-full overflow-hidden bg-[#0b1220]">
            <div className="absolute -left-12 top-4 h-40 w-40 rounded-full bg-[#00a4dc]/25 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_32%)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10151f] via-[#10151f]/45 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur sm:left-4 sm:top-4">
          <span
            className={`h-2 w-2 rounded-full ${nowPlaying && !nowPlaying.paused ? "bg-emerald-400" : "bg-fg-soft"}`}
          />
          {stateLabel}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <div className="flex items-end gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 font-mono text-sm font-semibold text-white shadow-lg backdrop-blur sm:h-12 sm:w-12">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                initials(name) || "U"
              )}
            </div>
            <div className="min-w-0 pb-0.5">
              <h2 className="truncate text-base font-semibold text-white">{name}</h2>
              <p className="truncate text-xs text-white/70">{device}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-3 sm:p-4">
        {nowPlaying ? (
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{nowPlaying.title}</p>
                <p className="mt-1 truncate text-xs text-white/55">
                  {nowPlaying.channelName ?? "Video"}
                </p>
              </div>
              <span className="self-start rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-white/70">
                {formatDuration(nowPlaying.positionMs)}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#00a4dc]" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-white/50">
              <span>{formatDuration(nowPlaying.positionMs)}</span>
              <span>{formatDuration(nowPlaying.durationMs)}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#0c1524] p-4">
            <p className="text-sm font-medium text-white/85">No active playback</p>
            <p className="mt-1 text-xs text-sky-200/55">The client is connected and ready.</p>
          </div>
        )}
      </div>
    </article>
  );
}
