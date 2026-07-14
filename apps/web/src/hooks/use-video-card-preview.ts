import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoStream } from "../types/stream";
import { isMemberOnlyApiError, streamQueryOptions } from "./use-stream";

const PREVIEW_DELAY_MS = 5000;

export function useVideoCardPreview(stream: VideoStream) {
  const queryClient = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewStream, setPreviewStream] = useState<VideoStream>();
  const [showPreview, setShowPreview] = useState(false);
  const [memberOnly, setMemberOnly] = useState(false);

  const fetchStreamData = useCallback(async () => {
    const options = streamQueryOptions(stream.id);
    const cached = queryClient.getQueryData<VideoStream>(options.queryKey);
    if (cached?.videoOnlyStreams?.length) {
      setMemberOnly(false);
      setPreviewStream(cached);
      return;
    }
    try {
      const data = await queryClient.fetchQuery(options);
      setMemberOnly(Boolean(data.requiresMembership));
      if (data.videoOnlyStreams?.length) setPreviewStream(data);
    } catch (error) {
      if (isMemberOnlyApiError(error)) setMemberOnly(true);
    }
  }, [queryClient, stream.id]);

  const onMouseEnter = useCallback(() => {
    timer.current = setTimeout(() => {
      void fetchStreamData().then(() => setShowPreview(true));
    }, PREVIEW_DELAY_MS);
  }, [fetchStreamData]);

  const onMouseLeave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setShowPreview(false);
  }, []);

  useEffect(() => onMouseLeave, [onMouseLeave]);

  return {
    memberOnly: memberOnly || stream.requiresMembership === true,
    onMouseEnter,
    onMouseLeave,
    previewStream,
    showPreview,
  };
}
