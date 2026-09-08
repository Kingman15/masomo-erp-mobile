import { ChipSelect } from "@/components/list/chip-select";
import { FilterBottomSheet } from "@/components/list/filter-bottom-sheet";
import { useCourses } from "@/hooks/queries/items/course";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useSchoolYears } from "@/hooks/queries/items/school-year";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput, View } from "react-native";
import { emptyLessonFilters, type LessonFiltersForm } from "./lesson-filters";

type LessonFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  value: LessonFiltersForm;
  onApply: (filters: LessonFiltersForm) => void;
};

export function LessonFilterSheet({
  visible,
  onClose,
  value,
  onApply,
}: LessonFilterSheetProps) {
  const { control, handleSubmit, watch, reset, setValue } =
    useForm<LessonFiltersForm>({ defaultValues: value });

  useEffect(() => {
    if (visible) reset(value);
  }, [visible, value, reset]);

  const schoolYearId = watch("schoolYearId");
  const schoolClassId = watch("schoolClassId");

  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();
  const { schoolClasses, schoolClassesIsLoading } = useSchoolClasses({
    filters: { schoolYearId },
    enabled: visible,
  });
  const { courses, coursesIsLoading } = useCourses({
    filters: { schoolYearId, schoolClassId },
    enabled: visible,
  });

  useEffect(() => {
    setValue("schoolClassId", null);
    setValue("courseId", null);
  }, [schoolYearId, setValue]);

  useEffect(() => {
    setValue("courseId", null);
  }, [schoolClassId, setValue]);

  const handleApply = (data: LessonFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyLessonFilters);
    onApply(emptyLessonFilters);
    onClose();
  };

  return (
    <FilterBottomSheet
      visible={visible}
      onClose={onClose}
      title="Filtrer les leçons"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
    >
      <Controller
        control={control}
        name="schoolYearId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ChipSelect
            label="Année scolaire"
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
        name="schoolClassId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ChipSelect
            label="Classe"
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
        name="courseId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ChipSelect
            label="Cours"
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

      <Text className="text-sm font-medium text-gray-700 mb-2">Période</Text>
      <View className="flex-row gap-3 mb-4">
        <Controller
          control={control}
          name="startDate"
          render={({ field: { value: fieldValue, onChange } }) => (
            <TextInput
              value={fieldValue ?? ""}
              onChangeText={(text) => onChange(text || null)}
              placeholder="Début (AAAA-MM-JJ)"
              placeholderTextColor="#9CA3AF"
              className="flex-1 h-11 border border-gray-300 rounded-lg px-3"
            />
          )}
        />
        <Controller
          control={control}
          name="endDate"
          render={({ field: { value: fieldValue, onChange } }) => (
            <TextInput
              value={fieldValue ?? ""}
              onChangeText={(text) => onChange(text || null)}
              placeholder="Fin (AAAA-MM-JJ)"
              placeholderTextColor="#9CA3AF"
              className="flex-1 h-11 border border-gray-300 rounded-lg px-3"
            />
          )}
        />
      </View>
    </FilterBottomSheet>
  );
}
