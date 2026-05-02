export interface Category {
  id: number;
  nom: string;
  description?: string;
  parentId?: number;
  parentNom?: string;
  nombreSousCategories: number;
}
