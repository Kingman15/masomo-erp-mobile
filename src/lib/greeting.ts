type GreetingPeriod = "morning" | "afternoon" | "evening";

// Salutation liée au moment de la journée
const SALUTATIONS: Record<GreetingPeriod, string[]> = {
  morning: ["Bonjour", "Bonne matinée"],
  afternoon: ["Bonjour", "Bon après-midi"],
  evening: ["Bonsoir", "Bonne soirée"],
};

// Variantes neutres, formulées sans marque de genre
const MESSAGES: string[] = [
  "Bon retour.",
  "Voici votre tableau de bord.",
  "Reprenons là où vous en étiez.",
  "Tout est à jour de votre côté.",
  "Bonne journée de travail.",
  "Que souhaitez-vous consulter aujourd'hui ?",
];

function getPeriod(hour: number): GreetingPeriod {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

// Hash simple et déterministe : même clé -> même index
function hashIndex(seed: string, length: number): number {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }

  return Math.abs(hash) % length;
}

/**
 * Construit le message d'accueil.
 * La variante change chaque jour (et diffère d'une personne à l'autre),
 * mais reste identique pendant toute la session du jour.
 */
export function buildGreeting(
  name: string,
  seedKey: string,
  reference: Date = new Date(),
): string {
  const period = getPeriod(reference.getHours());
  const dayKey = reference.toISOString().slice(0, 10); // AAAA-MM-JJ
  const seed = `${seedKey}-${dayKey}`;

  const salutations = SALUTATIONS[period];
  const salutation = salutations[hashIndex(`${seed}-s`, salutations.length)];
  const message = MESSAGES[hashIndex(`${seed}-m`, MESSAGES.length)];

  return `${salutation} ${name}. ${message}`;
}
