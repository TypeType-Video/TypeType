import { useMutation } from "@tanstack/react-query";
import { fetchMe } from "../lib/api-auth";
import { clearAvatar, setEmojiAvatar, uploadCustomAvatar } from "../lib/api-profile-avatar";
import { useAuthStore } from "../stores/auth-store";

async function refreshMeAfterAvatarChange(): Promise<void> {
  const { token, me, setSession } = useAuthStore.getState();
  if (!token || !me) return;
  const updated = await fetchMe(token);
  setSession(token, updated);
}

export function useAvatar() {
  const emoji = useMutation({
    mutationFn: (code: string) => setEmojiAvatar({ code }),
    onSuccess: refreshMeAfterAvatarChange,
  });

  const clear = useMutation({
    mutationFn: () => clearAvatar(),
    onSuccess: refreshMeAfterAvatarChange,
  });

  const custom = useMutation({
    mutationFn: (file: File) => uploadCustomAvatar(file),
    onSuccess: refreshMeAfterAvatarChange,
  });

  return { emoji, custom, clear };
}
