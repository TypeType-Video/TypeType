export function getWatchLayoutClasses(cinemaMode: boolean) {
  const anim = "[animation:page-fade-in_0.2s_ease-out]";
  return {
    containerClass: `flex flex-col gap-6 ${cinemaMode ? "" : "lg:flex-row lg:items-start"} ${anim}`,
    playerWrapClass: cinemaMode
      ? "overflow-hidden bg-black"
      : "min-w-0 flex-[2] max-w-[133.333vh] flex flex-col gap-4",
    playerBoxClass: cinemaMode
      ? "mx-auto aspect-video w-[min(100%,calc((100svh-4.5rem)*16/9))]"
      : "overflow-hidden rounded-lg",
    playerClassName: cinemaMode ? "w-full h-full dark [--video-aspect-ratio:16/9]" : undefined,
    mediaClassName: cinemaMode ? "object-cover" : undefined,
  };
}
