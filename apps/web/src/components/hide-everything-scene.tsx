import { PixelBird } from "./pixel-bird";
import { PixelCloud } from "./pixel-cloud";
import { PixelCouchSeat } from "./pixel-couch-seat";
import { PixelGround } from "./pixel-ground";
import { PixelMountain } from "./pixel-mountain";
import { PixelTvStand } from "./pixel-tv-stand";
import { PixelWaterfall } from "./pixel-waterfall";

const FAR_PALETTE = {
  snow: "#f5fbff",
  light: "#6faec0",
  mid: "#3f8798",
  dark: "#22535d",
  accent: "#aab3ae",
};

const MAIN_PALETTE = {
  snow: "#ffffff",
  light: "#3f8da0",
  mid: "#2c7180",
  dark: "#1d4648",
  accent: "#a8b1ac",
};

const FRONT_PALETTE = {
  snow: "#ffffff",
  light: "#2f7788",
  mid: "#1f5c68",
  dark: "#153e42",
  accent: "#0f3334",
};

function CloudBand() {
  return (
    <div className="absolute inset-x-0 top-[23%] h-[25%] bg-[#61c7e7]">
      <div className="absolute left-[5%] top-[-18%] h-[20%] w-[4%] bg-[#61c7e7]" />
      <div className="absolute left-[16%] top-[-20%] h-[18%] w-[8%] bg-[#61c7e7]" />
      <div className="absolute left-[31%] top-[-17%] h-[20%] w-[10%] bg-[#61c7e7]" />
      <div className="absolute left-[53%] top-[-14%] h-[18%] w-[9%] bg-[#61c7e7]" />
      <div className="absolute left-[67%] top-[-18%] h-[22%] w-[11%] bg-[#61c7e7]" />
      <div className="absolute left-[82%] top-[-16%] h-[20%] w-[7%] bg-[#61c7e7]" />
      <div className="absolute bottom-[-22%] left-[12%] h-[22%] w-[12%] bg-[#32b8dc]" />
      <div className="absolute bottom-[-18%] left-[38%] h-[18%] w-[10%] bg-[#32b8dc]" />
      <div className="absolute bottom-[-20%] left-[74%] h-[20%] w-[13%] bg-[#32b8dc]" />
    </div>
  );
}

export function HideEverythingScene() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020403]">
      <div className="pixel-sky-drop absolute inset-0 bg-[#32b8dc]" />
      <div className="pixel-sky-glow absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_-12%,#b7fff344,transparent_38%)]" />
      <div className="pixel-sky-drop absolute inset-0">
        <CloudBand />
      </div>
      <PixelMountain
        className="pixel-mountain-rise pixel-mountain-rise-back absolute bottom-[22%] left-[-17%] h-[50%] w-[46%]"
        height={72}
        palette={FAR_PALETTE}
        ridge={[
          { x: 0, y: 48 },
          { x: 21, y: 29 },
          { x: 32, y: 22 },
          { x: 46, y: 38 },
          { x: 66, y: 58 },
          { x: 95, y: 62 },
        ]}
        snowDepth={6}
        snowLine={33}
        width={96}
      />
      <PixelMountain
        className="pixel-mountain-rise pixel-mountain-rise-main absolute bottom-[22%] left-[20%] h-[72%] w-[64%]"
        height={96}
        palette={MAIN_PALETTE}
        ridge={[
          { x: 0, y: 79 },
          { x: 18, y: 58 },
          { x: 33, y: 31 },
          { x: 49, y: 8 },
          { x: 64, y: 34 },
          { x: 82, y: 56 },
          { x: 119, y: 83 },
        ]}
        snowDepth={8}
        snowLine={42}
        width={120}
      />
      <PixelMountain
        className="pixel-mountain-rise pixel-mountain-rise-front absolute bottom-[22%] right-[-14%] h-[50%] w-[48%]"
        height={72}
        palette={FRONT_PALETTE}
        ridge={[
          { x: 0, y: 58 },
          { x: 22, y: 42 },
          { x: 43, y: 23 },
          { x: 58, y: 38 },
          { x: 76, y: 54 },
          { x: 95, y: 64 },
        ]}
        snowDepth={6}
        snowLine={34}
        width={96}
      />
      <PixelCloud
        src="/pixel/cloud-0.png"
        className="pixel-sky-fall absolute top-[9%] left-[16%] w-[15%] [animation-delay:3.6s]"
      />
      <PixelCloud
        src="/pixel/cloud-1.png"
        className="pixel-sky-fall absolute top-[5%] left-[57%] w-[14%] [animation-delay:3.75s]"
      />
      <PixelCloud
        src="/pixel/cloud-3.png"
        className="pixel-sky-fall absolute top-[15%] left-[84%] w-[8%] [animation-delay:3.9s]"
      />
      <PixelBird className="pixel-bird-fly absolute top-[15%] left-0 w-[5%] [animation-delay:4.5s]" />
      <PixelBird className="pixel-bird-fly-far absolute top-[8%] left-0 w-[3.5%] [animation-delay:5.8s]" />
      <PixelWaterfall className="pixel-waterfall-drop absolute top-0 left-0 aspect-[707/1481] w-[33vw] sm:h-[78%] sm:w-auto" />
      <PixelGround />
      <PixelTvStand />
      <PixelCouchSeat className="pixel-couch-drop absolute bottom-[17%] left-[39%] block w-[36vw] -translate-x-1/2 sm:left-[60%] sm:w-[min(11rem,19vw)]" />
    </main>
  );
}
