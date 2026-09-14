import { CheckboxRow } from "@/components/list/checkbox-row";
import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import { Controller, useForm } from "react-hook-form";
import { NOTIFICATION_TYPE_OPTIONS } from "./notification-type";
import {
  defaultNotificationsFilters,
  type NotificationsFiltersForm,
} from "./notifications-filters";

type NotificationsFilterPanelProps = {
  value: NotificationsFiltersForm;
  onApply: (filters: NotificationsFiltersForm) => void;
  onClose: () => void;
};

export function NotificationsFilterPanel({
  value,
  onApply,
  onClose,
}: NotificationsFilterPanelProps) {
  const { control, handleSubmit, reset } = useForm<NotificationsFiltersForm>({
    defaultValues: value,
  });

  const handleApply = (data: NotificationsFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(defaultNotificationsFilters);
    onApply(defaultNotificationsFilters);
    onClose();
  };

  return (
    <FilterPanel
      title="Filtrer les notifications"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <Controller
        control={control}
        name="type"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Type"
            placeholder="Tous les types"
            options={NOTIFICATION_TYPE_OPTIONS}
            value={fieldValue}
            onChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="unreadOnly"
        render={({ field: { value: fieldValue, onChange } }) => (
          <CheckboxRow
            label="Non lues uniquement"
            value={fieldValue}
            onChange={onChange}
          />
        )}
      />
    </FilterPanel>
  );
}
