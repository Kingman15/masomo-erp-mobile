export interface StudentRegulationArticleDTO {
  id: string;
  parentArticleId: string | null;
  number: string | null;
  title: string | null;
  content: string | null;
  displayOrder: number | null;
  defaultSanctionTypeId: string | null;
  comments: string | null;
  childArticles: StudentRegulationArticleDTO[] | null;
}
