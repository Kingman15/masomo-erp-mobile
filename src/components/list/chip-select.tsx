import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

type ChipOption = { id: string; label: string };

type ChipSelectProps = {
  label: string;
  options: ChipOption[];
  value?: string | null;
  onChange: (id: string | null) => void;
  loading?: boolean;
  emptyLabel?: string;
};

export function ChipSelect({
  label,
  options,
  value,
  onChange,
  loading,
  emptyLabel = "Aucune option disponible",
}: ChipSelectProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-foreground-secondary mb-2">{label}</Text>
      {loading ? (
        <ActivityIndicator />
      ) : options.length === 0 ? (
        <Text className="text-sm text-faint">{emptyLabel}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {options.map((option) => {
              const selected = value === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => onChange(selected ? null : option.id)}
                  className={`px-4 h-9 rounded-full items-center justify-center border ${
                    selected ? "bg-foreground border-foreground" : "bg-card border-input"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selected ? "text-background font-medium" : "text-foreground-secondary"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
