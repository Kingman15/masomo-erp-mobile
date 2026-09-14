import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { Controller, useForm } from "react-hook-form";
import {
  emptySubscriptionFeesFilters,
  type SubscriptionFeesFiltersForm,
} from "./subscription-fees-filters";
import { TRANSPORT_SUBSCRIPTION_FEE_PAYMENT_STATUS_FILTER_OPTIONS } from "./transport-subscription-fee-status";

type SubscriptionFeesFilterPanelProps = {
  value: SubscriptionFeesFiltersForm;
  onApply: (filters: SubscriptionFeesFiltersForm) => void;
  onClose: () => void;
};

export function SubscriptionFeesFilterPanel({
  value,
  onApply,
  onClose,
}: SubscriptionFeesFilterPanelProps) {
  const { control, handleSubmit, reset } = useForm<SubscriptionFeesFiltersForm>({
    defaultValues: value,
  });

  const handleApply = (data: SubscriptionFeesFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptySubscriptionFeesFilters);
    onApply(emptySubscriptionFeesFilters);
    onClose();
  };

  return (
    <FilterPanel
      title="Filtrer les frais d'abonnement"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <Controller
        control={control}
        name="paymentStatus"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Statut de paiement"
            placeholder="Tous"
            options={TRANSPORT_SUBSCRIPTION_FEE_PAYMENT_STATUS_FILTER_OPTIONS.map((option) => ({
              id: option.value,
              label: option.label,
            }))}
            value={fieldValue}
            onChange={(id) => onChange((id as SubscriptionFeesFiltersForm["paymentStatus"]) ?? null)}
          />
        )}
      />
    </FilterPanel>
  );
}
