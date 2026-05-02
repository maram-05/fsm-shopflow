export interface Order {
  id: number;
  numeroCommande: string;
  statut: string;
  montantTotal: number;
  dateCommande: string;
  items: OrderItem[];
  codeCoupon?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productNom: string;
  productImageUrl?: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface OrderRequest {
  addressId: number;
  codeCoupon?: string;
}
