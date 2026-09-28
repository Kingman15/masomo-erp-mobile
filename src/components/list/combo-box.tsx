import { useThemeColors } from "@/hooks/use-theme-colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

type ComboBoxOption = { id: string; label: string };

type ComboBoxProps = {
  label: string;
  placeholder?: string;
  options: ComboBoxOption[];
  value?: string | null;
  onChange: (id: string | null) => void;
  loading?: boolean;
  disabled?: boolean;
  emptyLabel?: string;
};

export function ComboBox({
  label,
  placeholder = "Sélectionner",
  options,
  value,
  onChange,
  loading,
  disabled,
  emptyLabel = "Aucune option disponible",
}: ComboBoxProps) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);
  const isDisabled = disabled || (!loading && options.length === 0);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground-secondary mb-2">{label}</Text>

      <Pressable
        onPress={() => !isDisabled && setOpen(true)}
        className={`flex-row items-center justify-between h-11 border rounded-lg px-3 ${
          isDisabled ? "bg-subtle border-border" : "bg-card border-input"
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text
            className={`flex-1 text-base ${selected ? "text-foreground" : "text-faint"}`}
            numberOfLines={1}
          >
            {selected ? selected.label : isDisabled ? emptyLabel : placeholder}
          </Text>
        )}
        <Ionicons name="chevron-down" size={18} color={colors.faint} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center px-6"
          onPress={() => setOpen(false)}
        >
          <Pressable className="bg-card rounded-xl max-h-96 overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-divider">
              <Text className="text-base font-semibold text-foreground">{label}</Text>
              <View className="flex-row items-center gap-4">
                {value && (
                  <Pressable
                    onPress={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <Text className="text-sm text-muted-foreground">Effacer</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color={colors.foregroundSecondary} />
                </Pressable>
              </View>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View className="h-px bg-divider" />}
              renderItem={({ item }) => {
                const isSelected = item.id === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(isSelected ? null : item.id);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between px-4 py-3"
                  >
                    <Text
                      className={`text-base ${
                        isSelected ? "font-semibold text-foreground" : "text-foreground-secondary"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={colors.foreground} />
                    )}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
