import Ionicons from "@expo/vector-icons/Ionicons";
import {
  RequiredFiltersNotice,
  type RequiredFilter,
} from "@/components/list/required-filters-notice";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

// États communs des rapports enseignant (palmarès, moyennes) : sélection incomplète, chargement, erreur, vide.
type ReportStateViewProps = {
  isSelectionComplete: boolean;
  selectionHint: string;
  /** Sélections obligatoires : selectionHint sert alors de titre court (« Aucune moyenne ») et la phrase cite ce qui manque. */
  requirements?: RequiredFilter[];
  isLoading: boolean;
  error: unknown;
  errorLabel: string;
  onReload: () => void;
  isEmpty: boolean;
  emptyLabel: string;
  children: ReactNode;
};

export function ReportStateView({
  isSelectionComplete,
  selectionHint,
  requirements,
  isLoading,
  error,
  errorLabel,
  onReload,
  isEmpty,
  emptyLabel,
  children,
}: ReportStateViewProps) {
  const colors = useThemeColors();

  if (!isSelectionComplete) {
    if (requirements) {
      return (
        <RequiredFiltersNotice
          title={selectionHint}
          requirements={requirements}
          icon="school-outline"
        />
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-6 gap-3">
        <Ionicons name="school-outline" size={32} color={colors.faint} />
        <Text className="text-sm text-faint text-center">{selectionHint}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6 gap-3">
        <Text className="text-sm text-muted-foreground text-center">
          {errorLabel}
        </Text>
        <Pressable
          onPress={onReload}
          className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
        >
          <Text className="text-background font-medium">Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-16">
        <Text className="text-sm text-faint text-center">{emptyLabel}</Text>
      </View>
    );
  }

  return <>{children}</>;
}
