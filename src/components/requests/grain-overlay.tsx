const GRAIN_DATA_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E";

interface GrainOverlayProps {
  opacity?: number;
}

export function GrainOverlay({ opacity = 0.04 }: GrainOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: `url("${GRAIN_DATA_URI}")`,
        opacity,
      }}
    />
  );
}
