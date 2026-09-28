// Couleurs du thème pour les props qui n'acceptent pas de className (icônes, placeholderTextColor, SVG, navigation).
// Garder synchronisé avec les variables de src/global.css.
export const ThemeColors = {
  light: {
    background: "#FFFFFF",
    card: "#FFFFFF",
    foreground: "#000000",
    foregroundSecondary: "#374151",
    mutedForeground: "#6B7280",
    faint: "#9CA3AF",
    muted: "#F3F4F6",
    subtle: "#F9FAFB",
    divider: "#F3F4F6",
    border: "#E5E7EB",
    input: "#D1D5DB",
    // Icônes de statut posées à côté des textes amber-700 / amber-800 / green-700.
    warning: "#B45309",
    warningStrong: "#92400E",
    success: "#15803D",
  },
  dark: {
    background: "#09090B",
    card: "#18181B",
    foreground: "#FAFAFA",
    foregroundSecondary: "#D4D4D8",
    mutedForeground: "#A1A1AA",
    faint: "#71717A",
    muted: "#27272A",
    subtle: "#09090B",
    divider: "#27272A",
    border: "#27272A",
    input: "#3F3F46",
    warning: "#FCD34D",
    warningStrong: "#FDE68A",
    success: "#86EFAC",
  },
} as const;

export type ThemeColorName = keyof typeof ThemeColors.light;
