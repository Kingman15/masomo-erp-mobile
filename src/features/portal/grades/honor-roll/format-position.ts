export function formatPosition(position: number): string {
  if (position === 1) return "1er";
  return `${position}e`;
}
