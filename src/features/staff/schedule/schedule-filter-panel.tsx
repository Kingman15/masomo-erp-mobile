import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { useCourses } from "@/hooks/queries/items/course";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  emptyScheduleFilters,
  type ScheduleFiltersForm,
} from "./schedule-filters";

type ScheduleFilterPanelProps = {
  value: ScheduleFiltersForm;
  onApply: (filters: ScheduleFiltersForm) => void;
  onClose: () => void;
};

export function ScheduleFilterPanel({
  value,
  onApply,
  onClose,
}: ScheduleFilterPanelProps) {
  const { control, handleSubmit, watch, reset, setValue } =
    useForm<ScheduleFiltersForm>({ defaultValues: value });

  const schoolYearId = watch("schoolYearId");
  const schoolClassId = watch("schoolClassId");

  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();
  const { currentSchoolYear } = useCurrentSchoolYear();

  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { schoolYearId },
  });
  const { courses, coursesIsLoading } = useCourses({
    filters: { schoolYearId, schoolClassId },
  });

  const handleApply = (data: ScheduleFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyScheduleFilters);
    onApply(emptyScheduleFilters);
    onClose();
  };

  // ---

  useEffect(() => {
    if (!schoolYearId && currentSchoolYear?.id) {
      setValue("schoolYearId", currentSchoolYear.id);
    }
  }, [currentSchoolYear]);

  useEffect(() => {
    if (schoolClasses && schoolClasses.length === 1) {
      setValue("schoolClassId", schoolClasses[0].id);
    }
  }, [schoolClasses]);

  useEffect(() => {
    if (courses && courses.length === 1) {
      setValue("courseId", courses[0].id);
    }
  }, [courses]);

  // ---

  return (
    <FilterPanel
      title="Filtrer l'horaire"
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
              setValue("courseId", null);
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
            onChange={(id) => {
              onChange(id);
              setValue("courseId", null);
            }}
            loading={schoolClassesIsLoading}
            emptyLabel="Sélectionnez une année scolaire"
          />
        )}
      />

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
    </FilterPanel>
  );
}
