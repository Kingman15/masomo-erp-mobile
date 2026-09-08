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
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);
  const isDisabled = disabled || (!loading && options.length === 0);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>

      <Pressable
        onPress={() => !isDisabled && setOpen(true)}
        className={`flex-row items-center justify-between h-11 border rounded-lg px-3 ${
          isDisabled ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text
            className={`flex-1 text-base ${selected ? "text-black" : "text-gray-400"}`}
            numberOfLines={1}
          >
            {selected ? selected.label : isDisabled ? emptyLabel : placeholder}
          </Text>
        )}
        <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
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
          <Pressable className="bg-white rounded-xl max-h-96 overflow-hidden">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
              <Text className="text-base font-semibold">{label}</Text>
              <View className="flex-row items-center gap-4">
                {value && (
                  <Pressable
                    onPress={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <Text className="text-sm text-gray-500">Effacer</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color="#374151" />
                </Pressable>
              </View>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View className="h-px bg-gray-100" />}
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
                        isSelected ? "font-semibold text-black" : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color="#000000" />
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
