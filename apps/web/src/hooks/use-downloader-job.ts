import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  canUseIosShareFlow,
  createDownloaderJob,
  downloadDownloaderArtifact,
  fetchDownloaderJob,
} from "../lib/api-downloader";
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
  });
  const jobId = create.data?.id;

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
    if (!eventJob) return query.data;
    if (!query.data || query.data.id !== eventJob.id) return eventJob;
    if (query.data.status === "done" || query.data.status === "failed") {
      return {
        ...eventJob,
        ...query.data,
        resolved: query.data.resolved ?? eventJob.resolved,
        error: query.data.error ?? eventJob.error,
        errorCode: query.data.errorCode ?? eventJob.errorCode,
        tokenFetchMs: query.data.tokenFetchMs ?? eventJob.tokenFetchMs,
        ytdlpMs: query.data.ytdlpMs ?? eventJob.ytdlpMs,
        uploadMs: query.data.uploadMs ?? eventJob.uploadMs,
        totalMs: query.data.totalMs ?? eventJob.totalMs,
      };
    }
    return {
      ...query.data,
      ...eventJob,
      resolved: eventJob.resolved ?? query.data.resolved,
      error: eventJob.error ?? query.data.error,
      errorCode: eventJob.errorCode ?? query.data.errorCode,
    };
  }, [eventJob, query.data]);

  const status: DownloaderJobStatus | null = create.isPending ? "queued" : (job?.status ?? null);
  const isQueued = status === "queued";
  const isRunning = status === "running";
  const isDone = status === "done";
  const isFailed = status === "failed";
  const stage: DownloaderJobStage | null = job?.stage ?? null;
  const progressPercent = typeof job?.progressPercent === "number" ? job.progressPercent : null;
  const resolved = job?.resolved ?? null;
  const errorCode = job?.errorCode ?? null;
  const tokenFetchMs = typeof job?.tokenFetchMs === "number" ? job.tokenFetchMs : null;
  const ytdlpMs = typeof job?.ytdlpMs === "number" ? job.ytdlpMs : null;
  const uploadMs = typeof job?.uploadMs === "number" ? job.uploadMs : null;
  const totalMs = typeof job?.totalMs === "number" ? job.totalMs : null;
  const errorText =
    create.error instanceof Error
      ? create.error.message
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

  function reset() {
    setEventJob(null);
    setSseUnavailable(false);
    create.reset();
  }

  return {
    start,
    openArtifact,
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
    isQueued,
    isRunning,
    isDone,
    isFailed,
    errorText,
  };
}
