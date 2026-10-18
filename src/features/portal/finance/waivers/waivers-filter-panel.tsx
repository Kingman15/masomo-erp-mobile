import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { Controller, useForm } from "react-hook-form";
import { FEE_PAYMENT_DEROGATION_STATUS_OPTIONS } from "./fee-payment-derogation-status";
import { defaultWaiversFilters, type WaiversFiltersForm } from "./waivers-filters";

const IN_PROGRESS_OPTIONS = [
  { id: "withPending", label: "En cours & en attente" },
  { id: "true", label: "Oui" },
  { id: "false", label: "Non" },
];

type WaiversFilterPanelProps = {
  value: WaiversFiltersForm;
  onApply: (filters: WaiversFiltersForm) => void;
  onClose: () => void;
};

export function WaiversFilterPanel({ value, onApply, onClose }: WaiversFilterPanelProps) {
  const { control, handleSubmit, reset, setValue, watch } = useForm<WaiversFiltersForm>({
    defaultValues: value,
  });

  const includePending = watch("includePending");

  const handleApply = (data: WaiversFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(defaultWaiversFilters);
    onApply(defaultWaiversFilters);
    onClose();
  };

  return (
    <FilterPanel
      title="Filtrer les dérogations"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <Controller
        control={control}
        name="inProgress"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="En cours"
            placeholder="Tous"
            options={IN_PROGRESS_OPTIONS}
            value={
              fieldValue == null
                ? null
                : fieldValue
                  ? includePending
                    ? "withPending"
                    : "true"
                  : "false"
            }
            onChange={(id) => {
              onChange(id == null ? null : id === "true" || id === "withPending");
              setValue("includePending", id === "withPending");
            }}
          />
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Statut"
            placeholder="Tous les statuts"
            options={FEE_PAYMENT_DEROGATION_STATUS_OPTIONS.map((option) => ({
              id: option.value,
              label: option.label,
            }))}
            value={fieldValue}
            onChange={(id) => onChange((id as WaiversFiltersForm["status"]) ?? null)}
          />
        )}
      />
    </FilterPanel>
  );
}
