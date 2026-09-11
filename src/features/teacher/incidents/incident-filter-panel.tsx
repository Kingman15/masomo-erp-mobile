import { ChipSelect } from "@/components/list/chip-select";
import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { FilterPanel } from "@/components/list/filter-panel";
import { useIncidentTypes } from "@/hooks/queries/items/incident-type";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import { STUDENT_INCIDENT_STATUSES } from "@/utils/types/StudentIncident";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import {
  emptyIncidentFilters,
  type IncidentFiltersForm,
} from "./incident-filters";
import { INCIDENT_STATUS_LABELS } from "./incident-status-pill";

type IncidentFilterPanelProps = {
  value: IncidentFiltersForm;
  onApply: (filters: IncidentFiltersForm) => void;
  onClose: () => void;
};

export function IncidentFilterPanel({
  value,
  onApply,
  onClose,
}: IncidentFilterPanelProps) {
  const { control, handleSubmit, watch, reset, setValue } =
    useForm<IncidentFiltersForm>({ defaultValues: value });

  const schoolYearId = watch("schoolYearId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();
  const { currentSchoolYear } = useCurrentSchoolYear();
  const { incidentTypes, incidentTypesIsLoading } = useIncidentTypes();

  const handleApply = (data: IncidentFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyIncidentFilters);
    onApply(emptyIncidentFilters);
    onClose();
  };

  // ---

  useEffect(() => {
    if (!schoolYearId && currentSchoolYear?.id) {
      setValue("schoolYearId", currentSchoolYear.id);
    }
  }, [currentSchoolYear]);

  // ---

  return (
    <FilterPanel
      title="Filtrer les incidents"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <Controller
        control={control}
        name="schoolYearId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Année scolaire"
            placeholder="Toutes les années"
            options={(schoolYears ?? []).map((year) => ({
              id: year.id,
              label: year.title,
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={schoolYearsIsLoading}
          />
        )}
      />

      <Controller
        control={control}
        name="incidentTypeId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Type d'incident"
            placeholder="Tous les types"
            options={(incidentTypes ?? []).map((type) => ({
              id: type.id,
              label: type.name,
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={incidentTypesIsLoading}
          />
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ChipSelect
            label="Statut"
            options={STUDENT_INCIDENT_STATUSES.map((status) => ({
              id: status,
              label: INCIDENT_STATUS_LABELS[status],
            }))}
            value={fieldValue}
            onChange={onChange}
          />
        )}
      />

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
    </FilterPanel>
  );
}
