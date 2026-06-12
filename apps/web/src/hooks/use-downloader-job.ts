import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  cancelDownloaderJob,
  canUseIosShareFlow,
  createDownloaderJob,
  downloadDownloaderArtifact,
  fetchDownloaderJob,
} from "../lib/api-downloader";
import { downloaderErrorCode } from "../lib/downloader-errors";
import { subscribeDownloaderEvents } from "../lib/downloader-events";
import type {
  DownloaderCreateJobRequest,
  DownloaderJobResponse,
  DownloaderJobStage,
  DownloaderJobStatus,
} from "../types/downloader";

const POLL_MS = 1_500;

export function useDownloaderJob() {
  const [eventJob, setEventJob] = useState<DownloaderJobResponse | null>(null);
  const [sseUnavailable, setSseUnavailable] = useState(false);

  const create = useMutation({
    mutationFn: (payload: DownloaderCreateJobRequest) => createDownloaderJob(payload),
    retry: false,
  });
  const jobId = create.data?.id;
  const cancel = useMutation({
    mutationFn: (id: string) => cancelDownloaderJob(id),
    onSuccess: (next) =>
      setEventJob((current) => (current?.id === next.id ? { ...current, ...next } : next)),
  });

  useEffect(() => {
    if (!jobId) return;
    setSseUnavailable(false);
    return subscribeDownloaderEvents(jobId, {
      onMessage: (next) =>
        setEventJob((current) => (current?.id === next.id ? { ...current, ...next } : next)),
      onError: () => setSseUnavailable(true),
    });
  }, [jobId]);

  const query = useQuery({
    queryKey: ["downloader-job", jobId],
    enabled: typeof jobId === "string" && jobId.length > 0,
    queryFn: () => fetchDownloaderJob(jobId ?? ""),
    refetchInterval: (query) => {
      if (
        !sseUnavailable &&
        eventJob &&
        (eventJob.status === "queued" || eventJob.status === "running")
      ) {
        return false;
      }
      const current = query.state.data?.status;
      return current === "queued" || current === "running" ? POLL_MS : false;
    },
  });
  const job = useMemo(() => {
    const queryJob = query.data ?? create.data;
    if (!eventJob) return queryJob;
    if (!queryJob || queryJob.id !== eventJob.id) return eventJob;
    if (queryJob.status === "done" || queryJob.status === "failed") {
      return {
        ...eventJob,
        ...queryJob,
        resolved: queryJob.resolved ?? eventJob.resolved,
        error: queryJob.error ?? eventJob.error,
        errorCode: queryJob.errorCode ?? eventJob.errorCode,
        tokenFetchMs: queryJob.tokenFetchMs ?? eventJob.tokenFetchMs,
        ytdlpMs: queryJob.ytdlpMs ?? eventJob.ytdlpMs,
        uploadMs: queryJob.uploadMs ?? eventJob.uploadMs,
        totalMs: queryJob.totalMs ?? eventJob.totalMs,
      };
    }
    return {
      ...queryJob,
      ...eventJob,
      resolved: eventJob.resolved ?? queryJob.resolved,
      error: eventJob.error ?? queryJob.error,
      errorCode: eventJob.errorCode ?? queryJob.errorCode,
    };
  }, [create.data, eventJob, query.data]);

  const createError = create.error instanceof Error ? create.error : null;
  const status: DownloaderJobStatus | null = create.isPending
    ? "queued"
    : createError
      ? "failed"
      : (job?.status ?? null);
  const isQueued = status === "queued";
  const isRunning = status === "running";
  const isDone = status === "done";
  const isFailed = status === "failed";
  const stage: DownloaderJobStage | null = createError ? "failed" : (job?.stage ?? null);
  const progressPercent = typeof job?.progressPercent === "number" ? job.progressPercent : null;
  const resolved = job?.resolved ?? null;
  const errorCode = downloaderErrorCode(createError) ?? job?.errorCode ?? null;
  const tokenFetchMs = typeof job?.tokenFetchMs === "number" ? job.tokenFetchMs : null;
  const ytdlpMs = typeof job?.ytdlpMs === "number" ? job.ytdlpMs : null;
  const uploadMs = typeof job?.uploadMs === "number" ? job.uploadMs : null;
  const totalMs = typeof job?.totalMs === "number" ? job.totalMs : null;
  const errorText = createError
    ? createError.message
    : cancel.error instanceof Error
      ? cancel.error.message
      : job?.error || (query.error instanceof Error ? query.error.message : null);

  function start(payload: DownloaderCreateJobRequest) {
    setEventJob(null);
    setSseUnavailable(false);
    create.reset();
    create.mutate(payload);
  }

  function openArtifact(options?: { preferShare?: boolean }) {
    if (!jobId) return;
    return downloadDownloaderArtifact(jobId, options);
  }

  function cancelJob() {
    if (!jobId || (status !== "queued" && status !== "running")) return;
    cancel.mutate(jobId);
  }

  function reset() {
    setEventJob(null);
    setSseUnavailable(false);
    cancel.reset();
    create.reset();
  }

  return {
    start,
    openArtifact,
    cancelJob,
    reset,
    jobId,
    status,
    stage,
    progressPercent,
    resolved,
    tokenFetchMs,
    ytdlpMs,
    uploadMs,
    totalMs,
    errorCode,
    canUseIosShareFlow: canUseIosShareFlow(),
    isCancelling: cancel.isPending,
    isQueued,
    isRunning,
    isDone,
    isFailed,
    errorText,
  };
}
