import { GeneralClass } from "./GeneralClass";
import { SchoolClassHomeroomTeacher } from "./SchoolClassHomeroomTeacher";
import { SchoolSpace } from "./SchoolSpace";

export interface SchoolClass {
  id: string;
  code: string | null;
  generalClassId: string | null;
  classroomId: string | null;
  distinctive: string | null;
  title: string | null;
  abbreviation: string | null;
  isActive: boolean;
  displayOrder: number | null;
  description: string | null;
  comments: string | null;

  generalClass?: GeneralClass | null;
  // Titulaires en vigueur, principal en premier
  homeroomTeachers?: SchoolClassHomeroomTeacher[];
  classroom?: SchoolSpace | null;
}
