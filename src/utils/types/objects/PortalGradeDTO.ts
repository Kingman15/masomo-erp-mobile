export interface PortalGradeDTO {
  id: string;

  course: {
    id: string;
    name: string;
    shortName: string | null;
  };

  evaluationPeriod: {
    id: string;
    name: string;
  };

  evaluationType: string | null;
  wording: string | null;
  evaluationDate: string | null;

  score: string;
  maxScore: string;
  weight: string;

  countsTowardsFinal: boolean;
  approvedAt: string | null;
  comments: string | null;
}
