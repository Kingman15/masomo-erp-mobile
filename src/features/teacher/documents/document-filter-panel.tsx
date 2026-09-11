import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { useGeneralClasses } from "@/hooks/queries/items/general-class";
import { useOptions } from "@/hooks/queries/items/option";
import { useSchoolClasses } from "@/hooks/queries/items/school-class";
import {
  useCurrentSchoolYear,
  useSchoolYears,
} from "@/hooks/queries/items/school-year";
import { useSections } from "@/hooks/queries/items/section";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import type { DocumentAudienceType } from "./audience-type-options";
import { AUDIENCE_TYPE_OPTIONS } from "./audience-type-options";
import {
  emptyDocumentFilters,
  type DocumentFiltersForm,
} from "./document-filters";

type DocumentFilterPanelProps = {
  value: DocumentFiltersForm;
  onApply: (filters: DocumentFiltersForm) => void;
  onClose: () => void;
};

export function DocumentFilterPanel({
  value,
  onApply,
  onClose,
}: DocumentFilterPanelProps) {
  const { control, handleSubmit, watch, reset, setValue } =
    useForm<DocumentFiltersForm>({ defaultValues: value });

  const schoolYearId = watch("schoolYearId");
  const audienceType = watch("audienceType");
  const sectionId = watch("sectionId");
  const optionId = watch("optionId");
  const generalClassId = watch("generalClassId");

  const { currentSchoolYear } = useCurrentSchoolYear();
  const { schoolYears, schoolYearsIsLoading } = useSchoolYears();

  const { sections, sectionsIsLoading } = useSections();
  const { options, optionsIsLoading } = useOptions({
    filters: { sectionId },
    enabled:
      audienceType === "option" ||
      audienceType === "generalClass" ||
      audienceType === "schoolClass",
  });
  const { generalClasses, generalClassesIsLoading } = useGeneralClasses({
    filters: { sectionId, optionId },
    enabled: audienceType === "generalClass" || audienceType === "schoolClass",
  });
  const { schoolClasses = [], schoolClassesIsLoading } = useSchoolClasses({
    filters: { sectionId, optionId, generalClassId },
    enabled: audienceType === "schoolClass",
  });

  const handleApply = (data: DocumentFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyDocumentFilters);
    onApply(emptyDocumentFilters);
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
      title="Filtrer les documents"
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
        name="audienceType"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Audience cible"
            placeholder="Toutes les audiences"
            options={AUDIENCE_TYPE_OPTIONS.map((option) => ({
              id: option.id,
              label: option.label,
            }))}
            value={fieldValue}
            onChange={(id) => {
              onChange((id as DocumentAudienceType) ?? null);
              setValue("sectionId", null);
              setValue("optionId", null);
              setValue("generalClassId", null);
              setValue("schoolClassId", null);
            }}
          />
        )}
      />

      {(audienceType === "section" ||
        audienceType === "option" ||
        audienceType === "generalClass" ||
        audienceType === "schoolClass") && (
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
              }}
              loading={sectionsIsLoading}
            />
          )}
        />
      )}

      {(audienceType === "option" ||
        audienceType === "generalClass" ||
        audienceType === "schoolClass") && (
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
              }}
              loading={optionsIsLoading}
            />
          )}
        />
      )}

      {(audienceType === "generalClass" || audienceType === "schoolClass") && (
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
              }}
              loading={generalClassesIsLoading}
            />
          )}
        />
      )}

      {audienceType === "schoolClass" && (
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
              onChange={onChange}
              loading={schoolClassesIsLoading}
            />
          )}
        />
      )}
    </FilterPanel>
  );
}
