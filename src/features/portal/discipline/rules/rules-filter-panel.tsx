import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { TARGET_TYPE_OPTIONS } from "@/features/teacher/internal-regulations/target-type-options";
import { useGeneralClasses } from "@/hooks/queries/items/general-class";
import { useOptions } from "@/hooks/queries/items/option";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import { useSections } from "@/hooks/queries/items/section";
import { useStudentInternalRegulations } from "@/hooks/queries/items/student-internal-regulation";
import type { StudentInternalRegulationTargetType } from "@/utils/types/StudentInternalRegulation";
import { Controller, useForm } from "react-hook-form";
import {
  emptyRulesFilters,
  targetIdFromFilters,
  type RulesFiltersForm,
} from "./rules-filters";

type RulesFilterPanelProps = {
  schoolYearId: string | null | undefined;
  value: RulesFiltersForm;
  onApply: (filters: RulesFiltersForm) => void;
  onClose: () => void;
};

export function RulesFilterPanel({
  schoolYearId,
  value,
  onApply,
  onClose,
}: RulesFilterPanelProps) {
  const { control, handleSubmit, watch, reset, setValue } =
    useForm<RulesFiltersForm>({ defaultValues: value });

  const targetType = watch("targetType");
  const sectionId = watch("sectionId");
  const optionId = watch("optionId");
  const generalClassId = watch("generalClassId");

  const { sections, sectionsIsLoading } = useSections();
  const { options, optionsIsLoading } = useOptions({
    filters: { sectionId },
    enabled:
      targetType === "option" ||
      targetType === "generalClass" ||
      targetType === "schoolClass",
  });
  const { generalClasses, generalClassesIsLoading } = useGeneralClasses({
    filters: { sectionId, optionId },
    enabled: targetType === "generalClass" || targetType === "schoolClass",
  });
  const { schoolClasses = [], schoolClassesIsLoading } = useSchoolClasses({
    filters: { sectionId, optionId, generalClassId },
    enabled: targetType === "schoolClass",
  });

  const targetId = targetIdFromFilters(watch());

  const { studentInternalRegulations, studentInternalRegulationsIsLoading } =
    useStudentInternalRegulations({
      filters: { schoolYearId, targetType, targetId },
    });

  const handleApply = (data: RulesFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyRulesFilters);
    onApply(emptyRulesFilters);
    onClose();
  };

  // ---

  return (
    <FilterPanel
      title="Filtrer le règlement"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <Controller
        control={control}
        name="targetType"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Cible"
            options={TARGET_TYPE_OPTIONS.map((option) => ({
              id: option.id,
              label: option.label,
            }))}
            value={fieldValue}
            onChange={(id) => {
              onChange((id as StudentInternalRegulationTargetType) ?? "global");
              setValue("studentInternalRegulationId", null);
            }}
          />
        )}
      />

      {(targetType === "section" ||
        targetType === "option" ||
        targetType === "generalClass" ||
        targetType === "schoolClass") && (
        <Controller
          control={control}
          name="sectionId"
          render={({ field: { value: fieldValue, onChange } }) => (
            <ComboBox
              label="Section"
              options={sections.map((section) => ({
                id: section.id,
                label:
                  section.title ?? section.abbreviation ?? section.code ?? "N/A",
              }))}
              value={fieldValue}
              onChange={(id) => {
                onChange(id);
                setValue("optionId", null);
                setValue("generalClassId", null);
                setValue("schoolClassId", null);
                setValue("studentInternalRegulationId", null);
              }}
              loading={sectionsIsLoading}
            />
          )}
        />
      )}

      {(targetType === "option" ||
        targetType === "generalClass" ||
        targetType === "schoolClass") && (
        <Controller
          control={control}
          name="optionId"
          render={({ field: { value: fieldValue, onChange } }) => (
            <ComboBox
              label="Option"
              options={options.map((option) => ({
                id: option.id,
                label:
                  option.title ?? option.abbreviation ?? option.code ?? "N/A",
              }))}
              value={fieldValue}
              onChange={(id) => {
                onChange(id);
                setValue("generalClassId", null);
                setValue("schoolClassId", null);
                setValue("studentInternalRegulationId", null);
              }}
              loading={optionsIsLoading}
            />
          )}
        />
      )}

      {(targetType === "generalClass" || targetType === "schoolClass") && (
        <Controller
          control={control}
          name="generalClassId"
          render={({ field: { value: fieldValue, onChange } }) => (
            <ComboBox
              label="Classe générale"
              options={generalClasses.map((generalClass) => ({
                id: generalClass.id,
                label:
                  generalClass.title ??
                  generalClass.abbreviation ??
                  generalClass.code ??
                  "N/A",
              }))}
              value={fieldValue}
              onChange={(id) => {
                onChange(id);
                setValue("schoolClassId", null);
                setValue("studentInternalRegulationId", null);
              }}
              loading={generalClassesIsLoading}
            />
          )}
        />
      )}

      {targetType === "schoolClass" && (
        <Controller
          control={control}
          name="schoolClassId"
          render={({ field: { value: fieldValue, onChange } }) => (
            <ComboBox
              label="Classe scolaire"
              options={schoolClasses.map((schoolClass) => ({
                id: schoolClass.id,
                label:
                  schoolClass.title ??
                  schoolClass.abbreviation ??
                  schoolClass.code ??
                  "N/A",
              }))}
              value={fieldValue}
              onChange={(id) => {
                onChange(id);
                setValue("studentInternalRegulationId", null);
              }}
              loading={schoolClassesIsLoading}
            />
          )}
        />
      )}

      <Controller
        control={control}
        name="studentInternalRegulationId"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Règlement"
            options={studentInternalRegulations.map((item) => ({
              id: item.id,
              label: `${item.code ?? "N/A"} - ${item.title ?? "N/A"}`,
            }))}
            value={fieldValue}
            onChange={onChange}
            loading={studentInternalRegulationsIsLoading}
            emptyLabel="Aucun règlement disponible"
          />
        )}
      />
    </FilterPanel>
  );
}
