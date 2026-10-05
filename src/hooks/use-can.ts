import { useAuthStore, type User } from "@/stores/auth";

function moduleOf(permission: string): string {
  return permission.split(".")[0];
}

// Même règle que useCan côté web : permission accordée ET module activé pour l'école.
export function userCan(user: User | null, permission: string): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;

  return (
    user.permissions.includes(permission) &&
    user.enabledModules.includes(moduleOf(permission))
  );
}

// Lit l'utilisateur gardé localement, relu via /me au démarrage et au retour au premier plan (le serveur reste l'arbitre).
export function useCan(permission: string): boolean {
  const user = useAuthStore((s) => s.user);
  return userCan(user, permission);
}
