import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { useStudentAttendanceJustificationStatuses } from "@/hooks/queries/items/student-attendance-justification-status";
import { useStudentAttendancePointingChannels } from "@/hooks/queries/items/student-attendance-pointing-channel";
import { useStudentAttendancePointingTypes } from "@/hooks/queries/items/student-attendance-pointing-type";
import { Controller, useForm } from "react-hook-form";
import {
  emptyAttendanceFilters,
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
  const { control, handleSubmit, reset } = useForm<AttendanceFiltersForm>({
    defaultValues: value,
  });

  const { pointingTypes, pointingTypesIsLoading } =
    useStudentAttendancePointingTypes();
  const { pointingChannels, pointingChannelsIsLoading } =
    useStudentAttendancePointingChannels();
  const { statuses, statusesIsLoading } =
    useStudentAttendanceJustificationStatuses();

  const handleApply = (data: AttendanceFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyAttendanceFilters);
    onApply(emptyAttendanceFilters);
    onClose();
  };

  return (
    <FilterPanel
      title="Filtrer les pointages"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <Controller
        control={control}
        name="pointingTypeId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Type de pointage"
            placeholder="Tous les types"
            options={(pointingTypes ?? []).map((type) => ({
              id: type.id,
              label: type.label ?? type.code ?? "Type",
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={pointingTypesIsLoading}
          />
        )}
      />

      <Controller
        control={control}
        name="pointingChannelId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Canal de pointage"
            placeholder="Tous les canaux"
            options={(pointingChannels ?? []).map((channel) => ({
              id: channel.id,
              label: channel.label ?? channel.code ?? "Canal",
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={pointingChannelsIsLoading}
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
              label: status.label ?? status.code ?? "Statut",
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
