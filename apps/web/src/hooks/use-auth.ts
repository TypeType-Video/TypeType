import { useMemo } from "react";
import { useAuthStore } from "../stores/auth-store";

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const me = useAuthStore((s) => s.me);
  const status = useAuthStore((s) => s.status);
  const signOut = useAuthStore((s) => s.setSignedOut);

  const role = me?.role ?? null;
  const isAuthed = status === "authenticated" || status === "guest";
  const authReady = status !== "loading";
  const isGuest = status === "guest";
  const publicUsername = me?.publicUsername ?? null;
  const bio = me?.bio ?? null;
  const avatarUrl = me?.avatarUrl ?? null;
  const avatarType = me?.avatarType ?? null;
  const avatarCode = me?.avatarCode ?? null;
  const isAdmin = role === "admin";
  const isModerator = role === "moderator";
  const canGlobalBlock = useMemo(() => isAdmin || isModerator, [isAdmin, isModerator]);

  return {
    token,
    me,
    role,
    authReady,
    publicUsername,
    bio,
    avatarUrl,
    avatarType,
    avatarCode,
    status,
    isAuthed,
    isGuest,
    isAdmin,
    isModerator,
    canGlobalBlock,
    signOut,
  };
}
