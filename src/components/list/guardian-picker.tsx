import { Toast } from "@/components/toast";
import { useGuardians } from "@/hooks/queries/items/guardian";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { Guardian } from "@/utils/types/Guardian";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { SearchBar } from "./search-bar";

export type PickedGuardian = Pick<Guardian, "id" | "fullDesignation">;

type GuardianPickerProps = {
  label: string;
  placeholder?: string;
  value: PickedGuardian | null;
  onChange: (guardian: Guardian | null) => void;
  schoolYearId?: string | null;
  disabled?: boolean;
};

export function GuardianPicker({
  label,
  placeholder = "Sélectionner un parent",
  value,
  onChange,
  schoolYearId,
  disabled,
}: GuardianPickerProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isDisabled = disabled || !schoolYearId;

  const { guardians, guardiansError, guardiansIsLoading, loadGuardians } =
    useGuardians({
      filters: { schoolYearId, searchTerm },
      enabled: open && Boolean(schoolYearId),
    });

  const handleClose = () => {
    setOpen(false);
    setSearchTerm("");
  };

  const handleSelect = (guardian: Guardian) => {
    onChange(guardian);
    handleClose();
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground-secondary mb-2">{label}</Text>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => !isDisabled && setOpen(true)}
          className={`flex-1 flex-row items-center justify-between h-11 border rounded-lg px-3 ${
            isDisabled ? "bg-subtle border-border" : "bg-card border-input"
          }`}
        >
          <Text
            className={`flex-1 text-base ${value ? "text-foreground" : "text-faint"}`}
            numberOfLines={1}
          >
            {value
              ? value.fullDesignation
              : isDisabled
                ? "Sélectionnez une année scolaire"
                : placeholder}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.faint} />
        </Pressable>

        {value && (
          <Pressable onPress={() => onChange(null)} hitSlop={8} className="p-1">
            <Ionicons name="close-circle" size={20} color={colors.faint} />
          </Pressable>
        )}
      </View>

      <Modal visible={open} animationType="slide" onRequestClose={handleClose}>
        <View className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-4 pt-14 pb-3 border-b border-divider">
            <Text className="text-base font-semibold text-foreground">{label}</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.foregroundSecondary} />
            </Pressable>
          </View>

          <View className="px-4 pt-3 pb-2">
            <SearchBar
              placeholder="Rechercher un parent"
              onChangeText={setSearchTerm}
            />
          </View>

          {guardiansIsLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : guardiansError ? (
            <View className="flex-1 items-center justify-center px-6 gap-3">
              <Text className="text-sm text-muted-foreground text-center">
                Impossible de charger les parents.
              </Text>
              <Pressable
                onPress={() => loadGuardians()}
                className="h-10 px-4 rounded-lg bg-foreground items-center justify-center"
              >
                <Text className="text-background font-medium">Réessayer</Text>
              </Pressable>
            </View>
          ) : (
            <FlashList
              data={guardians}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item)}
                  className="flex-row items-center justify-between px-4 py-3 border-b border-divider"
                >
                  <View className="flex-1">
                    <Text className="text-base text-foreground" numberOfLines={1}>
                      {item.fullDesignation}
                    </Text>
                    {item.registrationNo && (
                      <Text className="text-xs text-faint mt-0.5">
                        {item.registrationNo}
                      </Text>
                    )}
                  </View>
                  {value?.id === item.id && (
                    <Ionicons name="checkmark" size={18} color={colors.foreground} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <View className="items-center justify-center px-6 py-16">
                  <Text className="text-sm text-faint text-center">
                    Aucun parent trouvé.
                  </Text>
                </View>
              }
            />
          )}
        </View>
        <Toast />
      </Modal>
    </View>
  );
}
