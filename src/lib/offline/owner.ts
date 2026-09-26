/**
 * Propriétaire de la file en cours (école + utilisateur connectés). Chaque
 * envoi mis en file retient son propriétaire ; au moment d'un essai, s'il ne
 * correspond plus (déconnexion puis connexion d'un autre compte pendant un
 * délai de nouvel essai), l'envoi est abandonné au lieu de partir avec le
 * token du nouveau compte. Sa copie reste dans le stockage de son propriétaire.
 */
let currentOwner: string | null = null;

export function toOfflineOwner(schoolCode: string, userId: string) {
  return `${schoolCode}:${userId}`;
}

export function setOfflineOwner(owner: string | null) {
  currentOwner = owner;
}

export function getOfflineOwner(): string | null {
  return currentOwner;
}
