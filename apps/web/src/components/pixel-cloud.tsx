type Props = {
  src: string;
  className?: string;
};

export function PixelCloud({ src, className }: Props) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={className}
      src={src}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
