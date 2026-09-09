import { ComboBox } from "@/components/list/combo-box";
import { DateField } from "@/components/list/date-field";
import { FilterPanel } from "@/components/list/filter-panel";
import { useCourses } from "@/hooks/queries/items/course";
import { useEvaluationPeriods } from "@/hooks/queries/items/evaluation-period";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import { useTeachingCourseEvaluationTypes } from "@/hooks/queries/items/teaching-course-evaluation-type";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import {
  emptyEvaluationFilters,
  type EvaluationFiltersForm,
} from "./evaluation-filters";

type EvaluationFilterPanelProps = {
  value: EvaluationFiltersForm;
  onApply: (filters: EvaluationFiltersForm) => void;
  onClose: () => void;
};

export function EvaluationFilterPanel({
  value,
  onApply,
  onClose,
}: EvaluationFilterPanelProps) {
  const { control, handleSubmit, watch, reset, setValue } =
    useForm<EvaluationFiltersForm>({ defaultValues: value });

  const schoolYearId = watch("schoolYearId");
  const schoolClassId = watch("schoolClassId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();
  const { currentSchoolYear } = useCurrentSchoolYear();

  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { schoolYearId },
  });
  const { courses, coursesIsLoading } = useCourses({
    filters: { schoolYearId, schoolClassId },
  });

  const { evaluationPeriods, evaluationPeriodsIsLoading } =
    useEvaluationPeriods();
  const {
    teachingCourseEvaluationTypes,
    teachingCourseEvaluationTypesIsLoading,
  } = useTeachingCourseEvaluationTypes();

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
      title="Filtrer les évaluations"
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
        name="teachingCourseEvaluationTypeId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Type d'évaluation"
            placeholder="Tous les types"
            options={(teachingCourseEvaluationTypes ?? []).map((type) => ({
              id: type.id,
              label: type.name,
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={teachingCourseEvaluationTypesIsLoading}
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
