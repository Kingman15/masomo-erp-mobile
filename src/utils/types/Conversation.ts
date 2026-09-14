import type { ServiceDesk } from "./ServiceDesk";

export const CONVERSATION_PARTY_KINDS = ["guardian", "student"] as const;
export type ConversationPartyKind = (typeof CONVERSATION_PARTY_KINDS)[number];

export interface ConversationParty {
  id: string;
  name: string;
}

export interface Conversation {
  id: string;
  code: string | null;

  schoolYearId: string;
  partyUserId: string;
  partyKind: ConversationPartyKind;
  counterpartDeskId: string;

  // Seul "statut" du fil : pilote une file d'attente, pas un cycle de vie
  awaitingSchoolReply: boolean;

  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageBySchool: boolean;
  messagesCount: number;
  createdAt: string | null;
  isUnread: boolean;

  party: ConversationParty | null;
  serviceDesk: ServiceDesk | null;
}
