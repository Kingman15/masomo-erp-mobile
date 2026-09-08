import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";

type DateFieldProps = {
  label: string;
  placeholder?: string;
  value?: string | null; // "AAAA-MM-JJ"
  onChange: (value: string | null) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplay(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function DateField({
  label,
  placeholder = "Sélectionner",
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const dateValue = value ? new Date(value) : new Date();

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
      if (event.type === "set" && selectedDate) {
        onChange(toDateString(selectedDate));
      }
      return;
    }
    if (selectedDate) onChange(toDateString(selectedDate));
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
          {value ? formatDisplay(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
      </Pressable>

      {open && Platform.OS === "android" && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
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
                value={dateValue}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={handleChange}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
