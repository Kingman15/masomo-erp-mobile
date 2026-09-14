import type { Document } from "./Document";

export interface MessageDocument {
  id: string;
  documentId: string;
  wording: string | null;
  comments: string | null;
  document: Document | null;
}

// Forme minimale nécessaire à l'affichage dans le composeur, satisfaite structurellement à la fois par
// Document (guichet) et PortalDocumentDTO (portail) — le composeur de message est réutilisé par les deux.
export interface MessageAttachableDocument {
  id: string;
  title: string | null;
  originalName: string | null;
  mimeType: string | null;
  size: number | null;
  url: string | null;
}

// État local d'une pièce jointe en attente d'envoi dans le composeur
export interface MessageDocumentDraft {
  tempId: string;
  documentId: string;
  document: MessageAttachableDocument | null;
}
