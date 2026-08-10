export function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = 100 / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = 30 - ((p - min) / (max - min || 1)) * 26 - 2;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-9 w-full">
      <polygon points={`0,30 ${coords.join(" ")} 100,30`} className="fill-primary/15" />
      <polyline
        points={coords.join(" ")}
        className="fill-none stroke-primary"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
