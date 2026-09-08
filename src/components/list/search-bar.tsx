import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

type SearchBarProps = {
  placeholder?: string;
  onChangeText: (value: string) => void;
  debounceMs?: number;
};

export function SearchBar({
  placeholder = "Rechercher",
  onChangeText,
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (text: string) => {
    setValue(text);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(
      () => onChangeText(text.trim()),
      debounceMs,
    );
  };

  const handleClear = () => {
    setValue("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onChangeText("");
  };

  return (
    <View className="flex-row items-center h-11 bg-gray-100 rounded-lg px-3 gap-2">
      <Ionicons name="search" size={18} color="#6B7280" />
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-base text-black"
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
        </Pressable>
      )}
    </View>
  );
}
