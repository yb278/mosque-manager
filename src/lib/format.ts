export function pct(n: number): number {
  return Math.round(n * 100);
}

export function pctColor(v: number): string {
  const p = Math.min(v, 100);
  const hue = p <= 70 ? (p / 70) * 60 : 60 + ((p - 70) / 30) * 60;
  return `hsl(${hue}, 75%, 40%)`;
}
