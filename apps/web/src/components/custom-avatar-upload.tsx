import { ImageUp } from "lucide-react";
import { useRef } from "react";
import { useAvatar } from "../hooks/use-avatar";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

type Props = {
  onMessage: (message: string) => void;
};

export function CustomAvatarUpload({ onMessage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { custom } = useAvatar();

  function upload(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) {
      onMessage("Use a PNG, JPEG, WebP, or GIF image");
      return;
    }
    if (file.size > MAX_BYTES) {
      onMessage("Avatar must be 10 MB or smaller");
      return;
    }
    custom.mutate(file, {
      onSuccess: () => onMessage("Avatar updated"),
      onError: () => onMessage("Unable to upload avatar"),
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-4">
      <div>
        <p className="text-sm text-fg">Custom image</p>
        <p className="text-xs text-fg-soft">PNG, JPEG, WebP, or animated GIF up to 10 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          upload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={custom.isPending}
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-xs text-fg disabled:opacity-50"
      >
        <ImageUp className="h-4 w-4" />
        Upload
      </button>
    </div>
  );
}
