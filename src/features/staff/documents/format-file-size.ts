export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";

  const units = ["o", "Ko", "Mo", "Go"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
