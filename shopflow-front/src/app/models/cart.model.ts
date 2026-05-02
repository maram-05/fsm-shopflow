export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  montantTotal: number;
  nombreArticles: number;
  dateModification?: Date;
}

export interface CartItem {
  id: number;
  productId: number;
  productNom: string;
  productImageUrl?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  stock?: number;
}

export interface CartItemRequest {
  productId: number;
  variantId?: number;
  quantite: number;
}
