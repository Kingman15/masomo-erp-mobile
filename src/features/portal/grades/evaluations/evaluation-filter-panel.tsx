import { ChipSelect } from "@/components/list/chip-select";
import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { useFollowedCourses } from "@/hooks/queries/items/course";
import { useEvaluationPeriods } from "@/hooks/queries/items/evaluation-period";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  emptyEvaluationFilters,
  type EvaluationFiltersForm,
} from "./evaluation-filters";

type EvaluationFilterPanelProps = {
  schoolYearId: string;
  schoolClassId: string;
  evaluationTypeOptions: string[];
  value: EvaluationFiltersForm;
  onApply: (filters: EvaluationFiltersForm) => void;
  onClose: () => void;
};

export function EvaluationFilterPanel({
  schoolYearId,
  schoolClassId,
  evaluationTypeOptions,
  value,
  onApply,
  onClose,
}: EvaluationFilterPanelProps) {
  const { control, handleSubmit, reset, setValue } =
    useForm<EvaluationFiltersForm>({ defaultValues: value });

  const { courses, coursesIsLoading } = useFollowedCourses({
    schoolYearId,
    schoolClassId,
  });

  const { evaluationPeriods, evaluationPeriodsIsLoading } =
    useEvaluationPeriods();

  const handleApply = (data: EvaluationFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyEvaluationFilters);
    onApply(emptyEvaluationFilters);
    onClose();
  };

  // ---

  useEffect(() => {
    if (courses && courses.length === 1) {
      setValue("courseId", courses[0].id);
    }
  }, [courses, setValue]);

  // ---

  return (
    <FilterPanel
      title="Filtrer les évaluations"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <Controller
        control={control}
        name="courseId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Cours"
            placeholder="Tous les cours"
            options={(courses ?? []).map((course) => ({
              id: course.id,
              label: course.shortName ?? course.name,
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={coursesIsLoading}
            emptyLabel="Sélectionnez une classe"
          />
        )}
      />

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
            onChange={onChange}
            loading={evaluationPeriodsIsLoading}
          />
        )}
      />

      <Controller
        control={control}
        name="evaluationType"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ChipSelect
            label="Type d'évaluation"
            options={evaluationTypeOptions.map((type) => ({
              id: type,
              label: type,
            }))}
            value={fieldValue}
            onChange={onChange}
            emptyLabel="Aucun type disponible"
          />
        )}
      />
    </FilterPanel>
  );
}
