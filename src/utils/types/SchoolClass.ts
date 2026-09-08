import { Employee } from "./Employee";
import { GeneralClass } from "./GeneralClass";
import { SchoolSpace } from "./SchoolSpace";

export interface SchoolClass {
  id: string;
  code: string | null;
  generalClassId: string | null;
  teacherId: string | null;
  classroomId: string | null;
  distinctive: string | null;
  title: string | null;
  abbreviation: string | null;
  isActive: boolean;
  displayOrder: number | null;
  description: string | null;
  comments: string | null;

  generalClass?: GeneralClass | null;
  teacher?: Employee | null;
  classroom?: SchoolSpace | null;
}
