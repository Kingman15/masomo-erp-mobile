export interface CourseCategory {
  id: string;
  code: string;
  name: string;
  shortName: string | null;
  categoryType: string | null;
  level: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isDefault: boolean;
  isSystem: boolean;
  displayOrder: number | null;
  description: string | null;
  comments: string | null;
  parentCategoryId: string | null;

  parentCategory: CourseCategory | null;
  children: CourseCategory[] | null;
}
