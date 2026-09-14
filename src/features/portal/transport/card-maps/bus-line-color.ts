import { BusLine } from "@/utils/types/BusLine";

function fallbackColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 70%, 45%)`;
}

export function lineColor(line: BusLine | null | undefined): string {
  if (!line) return "#64748b";
  return line.color ?? fallbackColor(line.id);
}
