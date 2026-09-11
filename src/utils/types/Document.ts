import { User } from "./User";

export interface Document {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  originalName: string | null;
  mimeType: string | null;
  size: number | null;
  url: string | null;
  createdAt: string | null;

  uploadedByUser: User | null;
}
