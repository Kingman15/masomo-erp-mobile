import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  token: number;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  variant: "info",
  token: 0,
  show: (message, variant = "info") =>
    set((state) => ({ message, variant, token: state.token + 1 })),
  hide: () => set({ message: null }),
}));
