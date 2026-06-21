import { PixelFlipbook } from "./pixel-flipbook";

type Props = {
  className?: string;
};

export function PixelTv({ className }: Props) {
  return (
    <PixelFlipbook
      prefix="tv"
      count={5}
      frameClass="pixel-zap-frame"
      cycle={7}
      className={className}
    />
  );
}
