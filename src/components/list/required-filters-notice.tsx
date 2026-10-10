import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

export type RequiredFilter = {
  /** Avec son article, pour former la phrase : « une année scolaire », « une classe ». */
  label: string;
  done: boolean;
};

type RequiredFiltersNoticeProps = {
  /** Ex. « Aucune moyenne », « Aucun palmarès ». */
  title: string;
  requirements: RequiredFilter[];
  icon?: keyof typeof Ionicons.glyphMap;
  /** Dans un contenu qui défile : hauteur du contenu au lieu d'occuper l'espace restant. */
  inline?: boolean;
};

/** « a », « a et b », « a, b et c ». */
function joinFr(items: string[]): string {
  return items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

/** État vide tant que des sélections obligatoires manquent : la phrase ne cite que celles qui restent à faire (même rendu que le web). */
export function RequiredFiltersNotice({
  title,
  requirements,
  icon = "search-outline",
  inline = false,
}: RequiredFiltersNoticeProps) {
  const colors = useThemeColors();
  const missing = requirements
    .filter((requirement) => !requirement.done)
    .map((requirement) => requirement.label);

  return (
    <View
      className={`items-center justify-center px-6 gap-3 ${inline ? "py-10" : "flex-1"}`}
    >
      <Ionicons name={icon} size={32} color={colors.faint} />
      <View className="gap-1">
        <Text className="text-sm font-medium text-foreground-secondary text-center">
          {title}
        </Text>
        <Text className="text-sm text-faint text-center">
          {`Sélectionnez ${joinFr(missing)}.`}
        </Text>
      </View>
    </View>
  );
}
