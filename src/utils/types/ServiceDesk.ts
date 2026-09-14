export interface ServiceDesk {
  id: string;
  code: string;
  name: string;
  description: string | null;
  acceptsGuardians: boolean;
  acceptsStudents: boolean;
  isActive: boolean;
  order: number;

  // Uniquement sur /service-desks/mine
  pendingConversationsCount: number | null;
  // Membership de l'agent connecté sur CE guichet précis
  canReply: boolean | null;
  isCurrentUserMember: boolean | null;
}
