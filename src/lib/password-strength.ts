import { Alert } from "react-native";

/**
 * Force d'un mot de passe, seulement signalée : l'API n'impose que la longueur minimale (PasswordPolicy),
 * l'utilisateur garde le dernier mot. Même logique que le web (web/src/utils/password-strength.ts).
 * - too-weak : deviné en quelques essais (identifiant, liste courante, caractère répété, suite) → confirmation demandée ;
 * - weak : court ou d'un seul type de caractère → simple avertissement.
 */
export type PasswordStrength = "too-weak" | "weak" | "ok";

/** Informations du compte qu'un mot de passe ne doit pas reprendre ; l'e-mail est comparé par sa partie avant « @ ». */
export type PasswordIdentifiers = {
  username?: string | null;
  phone?: string | null;
  email?: string | null;
  name?: string | null;
};

type IdentifierKind = keyof PasswordIdentifiers;
type TooWeakReason = IdentifierKind | "common" | "repeated" | "sequence";

export type PasswordAnalysis =
  | { strength: "ok" }
  | { strength: "weak"; message: string }
  | { strength: "too-weak"; message: string };

const MIN_LENGTH_BEFORE_ADVICE = 6;

const COMMON_PASSWORDS = new Set([
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "654321",
  "000000",
  "111111",
  "123123",
  "121212",
  "password",
  "motdepasse",
  "azerty",
  "azertyuiop",
  "qwerty",
  "qwertyuiop",
  "abc123",
  "abcdef",
  "iloveyou",
  "jetaime",
  "bonjour",
  "soleil",
  "masomo",
]);

const SEQUENCES = [
  "0123456789",
  "abcdefghijklmnopqrstuvwxyz",
  "azertyuiop",
  "qwertyuiop",
];

const TOO_WEAK_MESSAGES: Record<TooWeakReason, string> = {
  username: "Votre mot de passe contient votre nom d'utilisateur.",
  phone: "Votre mot de passe contient votre numéro de téléphone.",
  email: "Votre mot de passe contient votre adresse e-mail.",
  name: "Votre mot de passe contient votre nom.",
  common: "Mot de passe très courant : il fait partie des premiers essayés.",
  repeated:
    "Mot de passe trop répétitif : utilisez des caractères plus variés.",
  sequence:
    "Mot de passe trop prévisible : évitez les suites comme 123456 ou azerty.",
};

const WEAK_MESSAGE =
  "Mot de passe faible : mélangez lettres et chiffres, ou allongez-le.";

function isSequence(value: string): boolean {
  if (value.length < 4) return false;
  // Séquences ASCII : split('') suffit
  return SEQUENCES.some(
    (sequence) =>
      sequence.includes(value) ||
      sequence.split("").reverse().join("").includes(value),
  );
}

/** Premier identifiant repris par le mot de passe (déjà en minuscules). */
function matchedIdentifier(
  value: string,
  identifiers: PasswordIdentifiers,
): IdentifierKind | undefined {
  const isDigitsOnly = /^\d+$/.test(value);

  return (Object.keys(identifiers) as IdentifierKind[]).find((kind) => {
    const raw =
      kind === "email"
        ? identifiers.email?.split("@")[0]
        : identifiers[kind];
    const text = (raw ?? "").toLowerCase().trim();
    const digits = text.replace(/\D/g, "");

    return (
      (text.length >= 3 && value.includes(text)) ||
      (isDigitsOnly && digits.length >= 6 && digits.includes(value))
    );
  });
}

function tooWeakReason(
  value: string,
  identifiers: PasswordIdentifiers,
): TooWeakReason | undefined {
  // Identifiant en premier : c'est le message le plus utile à l'utilisateur
  const identifier = matchedIdentifier(value, identifiers);
  if (identifier) return identifier;
  if (COMMON_PASSWORDS.has(value)) return "common";
  if (new Set(value).size <= 2) return "repeated";
  if (isSequence(value)) return "sequence";
  return undefined;
}

/** @param identifiers informations du compte : un mot de passe qui les reprend est trop faible */
export function analyzePassword(
  password: string | undefined,
  identifiers: PasswordIdentifiers = {},
): PasswordAnalysis {
  const value = (password ?? "").toLowerCase();

  // Pas d'avis pendant la frappe : rien avant la longueur minimale la plus courte (portail), le minimum est vérifié à l'envoi
  if (value.length < MIN_LENGTH_BEFORE_ADVICE) return { strength: "ok" };

  const reason = tooWeakReason(value, identifiers);
  if (reason)
    return { strength: "too-weak", message: TOO_WEAK_MESSAGES[reason] };

  const kinds = [
    /[a-z]/.test(value),
    /\d/.test(value),
    /[^a-z\d]/.test(value),
  ].filter(Boolean).length;

  if (value.length < 8 || kinds < 2)
    return { strength: "weak", message: WEAK_MESSAGE };

  return { strength: "ok" };
}

export function getPasswordStrength(
  password: string | undefined,
  identifiers: PasswordIdentifiers = {},
): PasswordStrength {
  return analyzePassword(password, identifiers).strength;
}

/** Confirmation native avant d'enregistrer un mot de passe trop faible : true pour l'utiliser quand même. */
export function confirmTooWeakPassword(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      "Mot de passe très facile à deviner",
      "Quelqu'un qui vous connaît pourrait le trouver en quelques essais et accéder à votre compte. Voulez-vous vraiment l'utiliser ?",
      [
        { text: "Le modifier", style: "cancel", onPress: () => resolve(false) },
        {
          text: "Utiliser quand même",
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** À appeler avant l'envoi : false si l'utilisateur préfère modifier un mot de passe trop faible. */
export async function acceptPasswordStrength(
  password: string,
  identifiers: PasswordIdentifiers,
): Promise<boolean> {
  return (
    getPasswordStrength(password, identifiers) !== "too-weak" ||
    confirmTooWeakPassword()
  );
}
