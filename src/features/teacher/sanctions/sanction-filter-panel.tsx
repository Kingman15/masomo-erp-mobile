import { ChipSelect } from "@/components/list/chip-select";
import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { FilterPanel } from "@/components/list/filter-panel";
import { useIncidentTypes } from "@/hooks/queries/items/incident-type";
import { useSanctionTypes } from "@/hooks/queries/items/sanction-type";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import { STUDENT_INCIDENT_SANCTION_STATUSES } from "@/utils/types/StudentIncidentSanction";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import {
  emptySanctionFilters,
  type SanctionFiltersForm,
} from "./sanction-filters";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  active: "Actif",
  completed: "Terminé",
  cancelled: "Annulé",
  appealed: "Fait appel",
};

type SanctionFilterPanelProps = {
  value: SanctionFiltersForm;
  onApply: (filters: SanctionFiltersForm) => void;
  onClose: () => void;
};

export function SanctionFilterPanel({
  value,
  onApply,
  onClose,
}: SanctionFilterPanelProps) {
  const { control, handleSubmit, watch, reset, setValue } =
    useForm<SanctionFiltersForm>({ defaultValues: value });

  const schoolYearId = watch("schoolYearId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();
  const { currentSchoolYear } = useCurrentSchoolYear();

  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { schoolYearId },
  });
  const { sanctionTypes, sanctionTypesIsLoading } = useSanctionTypes();
  const { incidentTypes, incidentTypesIsLoading } = useIncidentTypes();

  const handleApply = (data: SanctionFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptySanctionFilters);
    onApply(emptySanctionFilters);
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
      title="Filtrer les sanctions"
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
            onChange={(id) => {
              onChange(id);
              setValue("schoolClassId", null);
            }}
            loading={schoolYearsIsLoading}
          />
        )}
      />

      <Controller
        control={control}
        name="schoolClassId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Classe"
            placeholder="Toutes les classes"
            options={(schoolClasses ?? []).map((schoolClass) => ({
              id: schoolClass.id,
              label: schoolClass.title ?? schoolClass.abbreviation ?? "Classe",
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={schoolClassesIsLoading}
            emptyLabel="Sélectionnez une année scolaire"
          />
        )}
      />

      <Controller
        control={control}
        name="sanctionTypeId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Type de sanction"
            placeholder="Tous les types"
            options={(sanctionTypes ?? []).map((type) => ({
              id: type.id,
              label: type.name,
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={sanctionTypesIsLoading}
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
            options={STUDENT_INCIDENT_SANCTION_STATUSES.map((status) => ({
              id: status,
              label: STATUS_LABELS[status],
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
