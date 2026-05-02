export interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  prixPromotion?: number; // Alias pour prixPromo
  stock: number;
  imageUrl?: string;
  images?: string[]; // Images de l'API
  categorieId?: number;
  categorieNom?: string;
  vendeurId?: number;
  vendeurNom?: string;
  sellerId?: number; // ID vendeur de l'API
  sellerNom?: string; // Nom vendeur de l'API
  sku?: string;
  noteAverage?: number;
  noteMoyenne?: number; // Note moyenne de l'API
  nombreAvis?: number;
  pourcentagePromotion?: number;
  pourcentageRemise?: number; // Pourcentage remise de l'API
  enPromotion?: boolean;
  actif?: boolean; // Statut actif/inactif du produit
  dateCreation?: Date;
}

export interface ProductRequest {
  nom: string;
  description: string;
  prix: number;
  prixPromo?: number;
  stock: number;
  images?: string[];
  categoryIds?: number[];
}
