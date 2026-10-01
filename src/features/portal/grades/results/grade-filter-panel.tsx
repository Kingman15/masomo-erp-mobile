import { ChipSelect } from "@/components/list/chip-select";
import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { useFollowedCourses } from "@/hooks/queries/items/course";
import { useSchoolPeriods } from "@/hooks/queries/items/school-period";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { emptyGradeFilters, type GradeFiltersForm } from "./grade-filters";

type GradeFilterPanelProps = {
  schoolYearId: string;
  schoolClassId: string;
  evaluationTypeOptions: string[];
  value: GradeFiltersForm;
  onApply: (filters: GradeFiltersForm) => void;
  onClose: () => void;
};

export function GradeFilterPanel({
  schoolYearId,
  schoolClassId,
  evaluationTypeOptions,
  value,
  onApply,
  onClose,
}: GradeFilterPanelProps) {
  const { control, handleSubmit, reset, setValue } = useForm<GradeFiltersForm>({
    defaultValues: value,
  });

  const { courses, coursesIsLoading } = useFollowedCourses({
    schoolYearId,
    schoolClassId,
  });

  const { schoolPeriods, schoolPeriodsIsLoading } =
    useSchoolPeriods();

  const handleApply = (data: GradeFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyGradeFilters);
    onApply(emptyGradeFilters);
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
      title="Filtrer les résultats"
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
            onChange={onChange}
            loading={schoolPeriodsIsLoading}
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
