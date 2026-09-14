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
  // Seed l'état courant : sans ça, le focus dépend uniquement du prochain
  // événement "change", qui peut ne jamais survenir si l'app reste au
  // premier plan sans interruption pendant toute la session.
  handleFocus(AppState.currentState !== "background");

  const sub = AppState.addEventListener("change", (state) => {
    // "background" seul signifie vraiment hors focus ; "inactive" (iOS,
    // transitoire lors d'un app switch/contrôle système) ne doit pas
    // bloquer indéfiniment le polling si aucun événement "active" ne suit.
    handleFocus(state !== "background");
  });
  return () => sub.remove();
});

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});
