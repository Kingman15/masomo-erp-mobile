import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { AppState } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnReconnect: true,
      refetchOnMount: "always",
    },
    mutations: {
      retry: 0, // jamais de retry auto sur une mutation (create/update/delete)
    },
  },
});

focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (state) => {
    handleFocus(state === "active");
  });
  return () => sub.remove();
});

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
