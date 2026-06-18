import { CinemaModeControl } from "./cinema-mode-control";
import { PictureInPictureControl } from "./picture-in-picture-control";

export function VideoPlayerLayoutControls() {
  return (
    <>
      <CinemaModeControl />
      <PictureInPictureControl />
    </>
  );
}
