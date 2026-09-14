import { ComboBox } from "@/components/list/combo-box";
import { FilterPanel } from "@/components/list/filter-panel";
import type { FeeScheduleStatus } from "@/utils/types/objects/FeeScheduleDTO";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { emptyFeesFilters, type FeesFiltersForm } from "./fees-filters";
import { FEE_SCHEDULE_SORT_OPTIONS, FEE_SCHEDULE_STATUS_OPTIONS } from "./fee-schedule-status";

type FeesFilterPanelProps = {
  value: FeesFiltersForm;
  onApply: (filters: FeesFiltersForm) => void;
  onClose: () => void;
};

export function FeesFilterPanel({ value, onApply, onClose }: FeesFilterPanelProps) {
  const { control, handleSubmit, watch, setValue, reset } = useForm<FeesFiltersForm>({
    defaultValues: value,
  });

  const status = watch("status");

  const toggleStatus = (option: FeeScheduleStatus) => {
    setValue(
      "status",
      status.includes(option) ? status.filter((item) => item !== option) : [...status, option],
    );
  };

  const handleApply = (data: FeesFiltersForm) => {
    onApply(data);
    onClose();
  };

  const handleReset = () => {
    reset(emptyFeesFilters);
    onApply(emptyFeesFilters);
    onClose();
  };

  return (
    <FilterPanel
      title="Filtrer les frais"
      onApply={handleSubmit(handleApply)}
      onReset={handleReset}
      onClose={onClose}
    >
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Statut</Text>
        <View className="flex-row flex-wrap gap-2">
          {FEE_SCHEDULE_STATUS_OPTIONS.map((option) => {
            const selected = status.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => toggleStatus(option.value)}
                className={`px-4 h-9 rounded-full items-center justify-center border ${
                  selected ? "bg-black border-black" : "bg-white border-gray-300"
                }`}
              >
                <Text className={`text-sm ${selected ? "text-white font-medium" : "text-gray-700"}`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Controller
        control={control}
        name="sortBy"
        render={({ field: { value: fieldValue, onChange } }) => (
          <ComboBox
            label="Trier par"
            placeholder="Par défaut"
            options={FEE_SCHEDULE_SORT_OPTIONS.map((option) => ({
              id: option.value,
              label: option.label,
            }))}
            value={fieldValue}
            onChange={(id) => onChange((id as FeesFiltersForm["sortBy"]) ?? null)}
          />
        )}
      />
    </FilterPanel>
  );
}
