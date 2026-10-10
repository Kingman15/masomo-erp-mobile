import { useThemeColors } from "@/hooks/use-theme-colors";
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
        active ? "bg-foreground border-foreground" : "bg-card border-input"
      } ${disabled ? "opacity-40" : ""}`}
    >
      <Text
        className={`text-xs font-medium ${active ? "text-background" : "text-gray-600 dark:text-zinc-400"}`}
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
  const colors = useThemeColors();
  const [noteOpen, setNoteOpen] = useState(Boolean(record.justificationNote));
  const enrollmentId = record.enrollment.id;
  const disabled = !record.isChecked;

  return (
    <View
      className={`px-4 py-3 border-b border-divider ${
        disabled ? "bg-subtle" : "bg-card"
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
            color={record.isChecked ? colors.foreground : colors.faint}
          />
        </Pressable>

        <Text
          className={`flex-1 text-sm font-medium ${
            disabled ? "text-faint" : "text-foreground"
          }`}
          numberOfLines={1}
        >
          {getEnrollmentLabel(record.enrollment)}
        </Text>

        <View
          className={`flex-row rounded-lg border border-border overflow-hidden ${
            disabled ? "opacity-40" : ""
          }`}
        >
          <Pressable
            disabled={disabled}
            onPress={() => onChange(enrollmentId, { isPresent: true })}
            className={`px-3 py-1.5 ${record.isPresent ? "bg-green-600" : "bg-card"}`}
          >
            <Text
              className={`text-xs font-semibold ${
                record.isPresent ? "text-white" : "text-muted-foreground"
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
            className={`px-3 py-1.5 ${!record.isPresent ? "bg-red-600" : "bg-card"}`}
          >
            <Text
              className={`text-xs font-semibold ${
                !record.isPresent ? "text-white" : "text-muted-foreground"
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
          placeholderTextColor={colors.faint}
          maxLength={255}
          textAlignVertical="center"
          className="h-11 border border-input rounded-lg px-3 py-0 mt-2 ml-9 bg-card text-sm text-foreground"
        />
      )}
    </View>
  );
}

export const AttendanceBulkStudentRow = memo(AttendanceBulkStudentRowComponent);
