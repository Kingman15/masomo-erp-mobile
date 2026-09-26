import type { StudentAttendanceRecordDTO } from "@/utils/types/objects/StudentAttendanceRecordDTO";
import Ionicons from "@expo/vector-icons/Ionicons";
import { memo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { getEnrollmentLabel } from "./attendance-labels";

type AttendanceBulkStudentRowProps = {
  record: StudentAttendanceRecordDTO;
  onChange: (
    enrollmentId: string,
    patch: Partial<StudentAttendanceRecordDTO>,
  ) => void;
};

type ToggleChipProps = {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
};

function ToggleChip({ label, active, disabled, onPress }: ToggleChipProps) {
  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      className={`px-2.5 py-1 rounded-full border ${
        active ? "bg-black border-black" : "bg-white border-gray-300"
      } ${disabled ? "opacity-40" : ""}`}
    >
      <Text
        className={`text-xs font-medium ${active ? "text-white" : "text-gray-600"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function AttendanceBulkStudentRowComponent({
  record,
  onChange,
}: AttendanceBulkStudentRowProps) {
  const [noteOpen, setNoteOpen] = useState(Boolean(record.justificationNote));
  const enrollmentId = record.enrollment.id;
  const disabled = !record.isChecked;

  return (
    <View
      className={`px-4 py-3 border-b border-gray-100 ${
        disabled ? "bg-gray-50" : "bg-white"
      }`}
    >
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => onChange(enrollmentId, { isChecked: !record.isChecked })}
          hitSlop={8}
        >
          <Ionicons
            name={record.isChecked ? "checkbox" : "square-outline"}
            size={22}
            color={record.isChecked ? "#000000" : "#9CA3AF"}
          />
        </Pressable>

        <Text
          className={`flex-1 text-sm font-medium ${
            disabled ? "text-gray-400" : "text-black"
          }`}
          numberOfLines={1}
        >
          {getEnrollmentLabel(record.enrollment)}
        </Text>

        <View
          className={`flex-row rounded-lg border border-gray-200 overflow-hidden ${
            disabled ? "opacity-40" : ""
          }`}
        >
          <Pressable
            disabled={disabled}
            onPress={() => onChange(enrollmentId, { isPresent: true })}
            className={`px-3 py-1.5 ${record.isPresent ? "bg-green-600" : "bg-white"}`}
          >
            <Text
              className={`text-xs font-semibold ${
                record.isPresent ? "text-white" : "text-gray-500"
              }`}
            >
              Présent
            </Text>
          </Pressable>
          <Pressable
            disabled={disabled}
            onPress={() =>
              onChange(enrollmentId, {
                isPresent: false,
                isLate: false,
                isPartial: false,
              })
            }
            className={`px-3 py-1.5 ${!record.isPresent ? "bg-red-600" : "bg-white"}`}
          >
            <Text
              className={`text-xs font-semibold ${
                !record.isPresent ? "text-white" : "text-gray-500"
              }`}
            >
              Absent
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mt-2 ml-9">
        <ToggleChip
          label="En retard"
          active={record.isLate}
          disabled={disabled || !record.isPresent}
          onPress={() => onChange(enrollmentId, { isLate: !record.isLate })}
        />
        <ToggleChip
          label="Partiel"
          active={record.isPartial}
          disabled={disabled || !record.isPresent}
          onPress={() => onChange(enrollmentId, { isPartial: !record.isPartial })}
        />
        <ToggleChip
          label="Note"
          active={noteOpen || Boolean(record.justificationNote)}
          disabled={disabled}
          onPress={() => setNoteOpen((open) => !open)}
        />
      </View>

      {noteOpen && !disabled && (
        <TextInput
          value={record.justificationNote ?? ""}
          onChangeText={(text) =>
            onChange(enrollmentId, { justificationNote: text || null })
          }
          placeholder="Note de justification"
          placeholderTextColor="#9CA3AF"
          maxLength={255}
          className="h-10 border border-gray-300 rounded-lg px-3 mt-2 ml-9 bg-white text-sm"
        />
      )}
    </View>
  );
}

export const AttendanceBulkStudentRow = memo(AttendanceBulkStudentRowComponent);
