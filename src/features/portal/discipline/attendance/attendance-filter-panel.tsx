import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { FilterPanel } from "@/components/list/filter-panel";
import { useStudentAttendanceJustificationStatuses } from "@/hooks/queries/items/student-attendance-justification-status";
import { useStudentAttendancePointingTypes } from "@/hooks/queries/items/student-attendance-pointing-type";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import {
  getDefaultAttendanceFilters,
  type AttendanceFiltersForm,
} from "./attendance-filters";

type AttendanceFilterPanelProps = {
  value: AttendanceFiltersForm;
  onApply: (filters: AttendanceFiltersForm) => void;
  onClose: () => void;
};

export function AttendanceFilterPanel({
  value,
  onApply,
  onClose,
}: AttendanceFilterPanelProps) {
  const { control, handleSubmit, reset, watch } =
    useForm<AttendanceFiltersForm>({ defaultValues: value });

  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const { pointingTypes, pointingTypesIsLoading } =
    useStudentAttendancePointingTypes();

  const { statuses, statusesIsLoading } =
    useStudentAttendanceJustificationStatuses();

  const handleApply = (data: AttendanceFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    const defaults = getDefaultAttendanceFilters();
    reset(defaults);
    onApply(defaults);
    onClose();
  };

  // ---

  return (
    <FilterPanel
      title="Filtrer les présences"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <View className="flex-row gap-3 mb-4">
        <Controller
          control={control}
          name="startDate"
          render={({ field: { value: fieldValue, onChange } }) => (
            <DateField
              label="Date début"
              value={fieldValue}
              onChange={onChange}
              maximumDate={endDate ? new Date(endDate) : undefined}
            />
          )}
        />
        <Controller
          control={control}
          name="endDate"
          render={({ field: { value: fieldValue, onChange } }) => (
            <DateField
              label="Date fin"
              value={fieldValue}
              onChange={onChange}
              minimumDate={startDate ? new Date(startDate) : undefined}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="pointingTypeId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Type de pointage"
            placeholder="Tous les types"
            options={(pointingTypes ?? []).map((type) => ({
              id: type.id,
              label: type.label ?? "",
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={pointingTypesIsLoading}
          />
        )}
      />

      <Controller
        control={control}
        name="justificationStatusId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Statut de justification"
            placeholder="Tous les statuts"
            options={(statuses ?? []).map((status) => ({
              id: status.id,
              label: status.label ?? "",
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={statusesIsLoading}
          />
        )}
      />
    </FilterPanel>
  );
}
