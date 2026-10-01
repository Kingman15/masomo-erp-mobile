import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { useSchoolPeriods } from "@/hooks/queries/items/school-period";
import { useSchoolYearTerms } from "@/hooks/queries/items/school-year-term";
import { SchoolYearTerm } from "@/utils/types/SchoolYearTerm";
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
  subdivision: SchoolYearTerm,
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

  const { schoolPeriods, schoolPeriodsIsLoading } =
    useSchoolPeriods();

  const {
    schoolYearTerms,
    schoolYearTermsIsLoading,
  } = useSchoolYearTerms({
    filters: { schoolYearId },
    enabled: Boolean(schoolYearId),
  });

  const schoolPeriodId = watch("schoolPeriodId");
  const schoolYearTermId = watch("schoolYearTermId");

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
        name="schoolPeriodId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Période scolaire"
            placeholder="Toutes les périodes"
            options={(schoolPeriods ?? []).map((period) => ({
              id: period.id,
              label: period.name,
            }))}
            value={fieldValue}
            onChange={(id) => {
              onChange(id);
              if (id) setValue("schoolYearTermId", null);
            }}
            loading={schoolPeriodsIsLoading}
            disabled={Boolean(schoolYearTermId)}
          />
        )}
      />

      <Controller
        control={control}
        name="schoolYearTermId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Subdivision"
            placeholder="Toutes les subdivisions"
            options={(schoolYearTerms ?? []).map(
              (subdivision) => ({
                id: subdivision.id,
                label: getSubdivisionLabel(subdivision),
              }),
            )}
            value={fieldValue}
            onChange={(id) => {
              onChange(id);
              if (id) setValue("schoolPeriodId", null);
            }}
            loading={schoolYearTermsIsLoading}
            disabled={Boolean(schoolPeriodId)}
          />
        )}
      />
    </FilterPanel>
  );
}
