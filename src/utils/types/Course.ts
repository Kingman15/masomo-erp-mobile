import { CourseCategory } from "./CourseCategory";

export interface Course {
  id: string;
  code: string;
  name: string;
  shortName: string | null;

  status: "active" | "inactive" | "archived";

  isSystem: boolean;

  description: string | null;
  comments: string | null;

  courseCategoryId: string | null;

  // Relations ===

  category: CourseCategory | null;

  // Appends ===

  statusStr: string;
}
