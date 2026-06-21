import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { HideEverythingIntro } from "../components/hide-everything-intro";
import { HideEverythingScene } from "../components/hide-everything-scene";
import { PixelDogChase } from "../components/pixel-dog-chase";
import { ZenSoundToggle } from "../components/zen-sound-toggle";
import { useZenAmbient } from "../hooks/use-zen-ambient";
import { canEnterHideEverything } from "../lib/hide-everything";

function HideEverythingPage() {
  const [showScene, setShowScene] = useState(false);
  const { playing, start, toggle } = useZenAmbient();
  return (
    <>
      {showScene ? (
        <>
          <HideEverythingScene />
          <PixelDogChase />
        </>
      ) : (
        <HideEverythingIntro onRelax={start} onDone={() => setShowScene(true)} />
      )}
      <ZenSoundToggle playing={playing} onToggle={toggle} />
    </>
  );
}

export const Route = createFileRoute("/hide-everything")({
  beforeLoad: () => {
    if (!canEnterHideEverything()) {
      throw redirect({ to: "/" });
    }
  },
  component: HideEverythingPage,
});
