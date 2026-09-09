import { useCallback, useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type ConfirmVariant = "default" | "destructive";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
};

type ConfirmState = ConfirmOptions & { visible: boolean };

const DEFAULT_STATE: ConfirmState = {
  visible: false,
  title: "Confirmer",
  description: undefined,
  confirmText: "Continuer",
  cancelText: "Annuler",
  variant: "default",
};

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(DEFAULT_STATE);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({ ...DEFAULT_STATE, ...options, visible: true });
    });
  }, []);

  const handle = useCallback((result: boolean) => {
    setState((prev) => ({ ...prev, visible: false }));
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  const ConfirmDialog = useCallback(
    () => (
      <Modal
        visible={state.visible}
        transparent
        animationType="fade"
        onRequestClose={() => handle(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center px-6"
          onPress={() => handle(false)}
        >
          <Pressable className="bg-white rounded-xl p-4">
            <Text className="text-base font-semibold text-black mb-2">
              {state.title}
            </Text>
            {state.description && (
              <Text className="text-sm text-gray-600 mb-4">
                {state.description}
              </Text>
            )}
            <View className="flex-row justify-end gap-3 mt-2">
              <Pressable
                onPress={() => handle(false)}
                className="h-10 px-4 rounded-lg items-center justify-center"
              >
                <Text className="text-sm font-medium text-gray-600">
                  {state.cancelText}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handle(true)}
                className={`h-10 px-4 rounded-lg items-center justify-center ${
                  state.variant === "destructive" ? "bg-red-500" : "bg-black"
                }`}
              >
                <Text className="text-sm font-medium text-white">
                  {state.confirmText}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    ),
    [state, handle],
  );

  return { confirm, ConfirmDialog };
}
