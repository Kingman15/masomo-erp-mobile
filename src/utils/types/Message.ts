import type { MessageDocument } from "./MessageDocument";

export interface MessageSender {
  id: string;
  name: string;
}

export interface MessageDesk {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  code: string;
  conversationId: string;

  senderUserId: string;
  // Non-null ⇒ envoyé "en tant que guichet" — pilote le côté de la bulle
  sentAsDeskId: string | null;

  body: string | null;
  hasAttachments: boolean;
  editedAt: string | null;
  createdAt: string;

  // sentAsDesk prime sur sender pour l'affichage (nom du guichet côté famille)
  sender: MessageSender | null;
  sentAsDesk: MessageDesk | null;

  documents: MessageDocument[];
}
