import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { useSchoolPeriods } from "@/hooks/queries/items/school-period";
import { useSchoolYearTerms } from "@/hooks/queries/items/school-year-term";
import {
  countSchoolYearTermSiblings,
  formatSchoolYearTermLabel,
} from "@/lib/school-year-term-label";
import { Controller, useForm } from "react-hook-form";
import {
  emptyStudentRankingFilters,
  type StudentRankingFiltersForm,
} from "./student-ranking-filters";

type StudentRankingFilterPanelProps = {
  schoolYearId: string;
  value: StudentRankingFiltersForm;
  onApply: (filters: StudentRankingFiltersForm) => void;
  onClose: () => void;
};

export function StudentRankingFilterPanel({
  schoolYearId,
  value,
  onApply,
  onClose,
}: StudentRankingFilterPanelProps) {
  const { control, handleSubmit, reset, watch, setValue } =
    useForm<StudentRankingFiltersForm>({ defaultValues: value });

  const { schoolPeriods, schoolPeriodsIsLoading } =
    useSchoolPeriods();

  const {
    schoolYearTerms,
    schoolYearTermsIsLoading,
  } = useSchoolYearTerms({
    filters: { schoolYearId },
    enabled: Boolean(schoolYearId),
  });

  const termSiblingCounts = countSchoolYearTermSiblings(schoolYearTerms ?? []);

  const schoolPeriodId = watch("schoolPeriodId");
  const schoolYearTermId = watch("schoolYearTermId");

  const handleApply = (data: StudentRankingFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyStudentRankingFilters);
    onApply(emptyStudentRankingFilters);
    onClose();
  };

  // ---

  return (
    <FilterPanel
      title="Filtrer le palmarès"
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
                label: formatSchoolYearTermLabel(subdivision, termSiblingCounts),
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
