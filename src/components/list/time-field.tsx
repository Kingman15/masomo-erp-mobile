import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

type TimeFieldProps = {
  label: string;
  placeholder?: string;
  value?: string | null; // "HH:mm"
  onChange: (value: string | null) => void;
};

function toTimeString(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function toDate(value?: string | null) {
  if (!value) return new Date();
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function TimeField({
  label,
  placeholder = "Sélectionner",
  value,
  onChange,
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  const timeValue = toDate(value);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
      if (event.type === "set" && selectedDate) {
        onChange(toTimeString(selectedDate));
      }
      return;
    }
    if (selectedDate) onChange(toTimeString(selectedDate));
  };

  return (
    <View className="flex-1">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between h-11 border border-gray-300 rounded-lg px-3 bg-white"
      >
        <Text
          className={`text-base ${value ? "text-black" : "text-gray-400"}`}
          numberOfLines={1}
        >
          {value ? value : placeholder}
        </Text>
        <Ionicons name="time-outline" size={18} color="#9CA3AF" />
      </Pressable>

      {open && Platform.OS === "android" && (
        <DateTimePicker
          value={timeValue}
          mode="time"
          display="default"
          onChange={handleChange}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}
        >
          <Pressable
            className="flex-1 bg-black/40 justify-end"
            onPress={() => setOpen(false)}
          >
            <Pressable className="bg-white rounded-t-xl pb-6">
              <View className="flex-row justify-end px-4 py-3">
                <Pressable onPress={() => setOpen(false)}>
                  <Text className="text-base font-semibold text-black">
                    Terminé
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={timeValue}
                mode="time"
                display="spinner"
                onChange={handleChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
