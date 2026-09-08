import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, Text, View } from "react-native";

type FilterBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onApply: () => void;
  onReset: () => void;
  applyLabel?: string;
  resetLabel?: string;
};

export function FilterBottomSheet({
  visible,
  onClose,
  title,
  children,
  onApply,
  onReset,
  applyLabel = "Appliquer",
  resetLabel = "Réinitialiser",
}: FilterBottomSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%", "92%"], []);

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={{ backgroundColor: "#D1D5DB" }}
    >
      <View className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-100">
        <Text className="text-lg font-semibold">{title}</Text>
        <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={8}>
          <Ionicons name="close" size={22} color="#374151" />
        </Pressable>
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </BottomSheetScrollView>

      <View className="flex-row gap-3 px-4 pt-3 pb-6 border-t border-gray-100">
        <Pressable
          onPress={onReset}
          className="flex-1 h-11 rounded-lg border border-gray-300 items-center justify-center"
        >
          <Text className="font-medium text-gray-700">{resetLabel}</Text>
        </Pressable>
        <Pressable
          onPress={onApply}
          className="flex-1 h-11 rounded-lg bg-black items-center justify-center"
        >
          <Text className="font-medium text-white">{applyLabel}</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}
