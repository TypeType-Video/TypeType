type Props = {
  className?: string;
};

export function PixelTable({ className }: Props) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={className}
      src="/pixel/table.svg"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
