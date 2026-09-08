import { useToastStore, type ToastVariant } from "@/stores/toast";

export function toastNotify(message: string, variant: ToastVariant = "info") {
  useToastStore.getState().show(message, variant);
}
