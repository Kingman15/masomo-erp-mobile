import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { useEvaluationPeriods } from "@/hooks/queries/items/evaluation-period";
import { useSchoolYearSchoolYearSubdivisions } from "@/hooks/queries/items/school-year-school-year-subdivision";
import { SchoolYearSchoolYearSubdivision } from "@/utils/types/SchoolYearSchoolYearSubdivision";
import { Controller, useForm } from "react-hook-form";
import {
  emptyCourseAverageFilters,
  type CourseAverageFiltersForm,
} from "./course-average-filters";

type CourseAverageFilterPanelProps = {
  schoolYearId: string;
  value: CourseAverageFiltersForm;
  onApply: (filters: CourseAverageFiltersForm) => void;
  onClose: () => void;
};

function getSubdivisionLabel(
  subdivision: SchoolYearSchoolYearSubdivision,
): string {
  const subdivisionName =
    subdivision.schoolYearSubdivision?.displayName ??
    `Subdivision ${subdivision.subdivisionNo}`;
  return `${subdivisionName} ${subdivision.subdivisionNo}`;
}

export function CourseAverageFilterPanel({
  schoolYearId,
  value,
  onApply,
  onClose,
}: CourseAverageFilterPanelProps) {
  const { control, handleSubmit, reset, watch, setValue } =
    useForm<CourseAverageFiltersForm>({ defaultValues: value });

  const { evaluationPeriods, evaluationPeriodsIsLoading } =
    useEvaluationPeriods();

  const {
    schoolYearSchoolYearSubdivisions,
    schoolYearSchoolYearSubdivisionsIsLoading,
  } = useSchoolYearSchoolYearSubdivisions({
    filters: { schoolYearId },
    enabled: Boolean(schoolYearId),
  });

  const evaluationPeriodId = watch("evaluationPeriodId");
  const sysyId = watch("sysyId");

  const handleApply = (data: CourseAverageFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyCourseAverageFilters);
    onApply(emptyCourseAverageFilters);
    onClose();
  };

  // ---

  return (
    <FilterPanel
      title="Filtrer les moyennes"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <Controller
        control={control}
        name="evaluationPeriodId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Période d'évaluation"
            placeholder="Toutes les périodes"
            options={(evaluationPeriods ?? []).map((period) => ({
              id: period.id,
              label: period.name,
            }))}
            value={fieldValue}
            onChange={(id) => {
              onChange(id);
              if (id) setValue("sysyId", null);
            }}
            loading={evaluationPeriodsIsLoading}
            disabled={Boolean(sysyId)}
          />
        )}
      />

      <Controller
        control={control}
        name="sysyId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Subdivision"
            placeholder="Toutes les subdivisions"
            options={(schoolYearSchoolYearSubdivisions ?? []).map(
              (subdivision) => ({
                id: subdivision.id,
                label: getSubdivisionLabel(subdivision),
              }),
            )}
            value={fieldValue}
            onChange={(id) => {
              onChange(id);
              if (id) setValue("evaluationPeriodId", null);
            }}
            loading={schoolYearSchoolYearSubdivisionsIsLoading}
            disabled={Boolean(evaluationPeriodId)}
          />
        )}
      />
    </FilterPanel>
  );
}
