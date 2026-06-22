export type WatchLayoutClasses = ReturnType<typeof getWatchLayoutClasses>;

export function getWatchLayoutClasses(cinemaMode: boolean, hasSecondaryContent: boolean) {
  const anim = "[animation:page-fade-in_0.2s_ease-out]";
  const standardLayout = hasSecondaryContent
    ? "pt-2 sm:pt-3 lg:flex-row lg:items-start"
    : "pt-2 sm:pt-3 lg:items-center";
  return {
    containerClass: `flex flex-col gap-6 ${cinemaMode ? "" : standardLayout} ${anim}`,
    playerWrapClass: cinemaMode
      ? "overflow-hidden bg-black"
      : `min-w-0 flex flex-col gap-4 ${
          hasSecondaryContent ? "flex-[2] max-w-[133.333vh]" : "mx-auto w-full max-w-[1600px]"
        }`,
    playerBoxClass: cinemaMode
      ? "relative mx-auto aspect-video w-[min(100%,calc((100svh-4.5rem)*16/9))]"
      : "relative overflow-hidden rounded-lg",
    playerClassName: cinemaMode ? "w-full h-full dark [--video-aspect-ratio:16/9]" : undefined,
    mediaClassName: cinemaMode ? "object-cover" : undefined,
  };
}
