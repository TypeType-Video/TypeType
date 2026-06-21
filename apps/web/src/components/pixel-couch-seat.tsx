import { PixelFlipbook } from "./pixel-flipbook";

type Props = {
  className?: string;
};

export function PixelCouchSeat({ className }: Props) {
  return (
    <PixelFlipbook
      prefix="cat"
      count={5}
      frameClass="pixel-zap-frame"
      cycle={7}
      className={className}
    />
  );
}
