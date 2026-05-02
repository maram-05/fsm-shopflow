package com.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Réponse contenant les informations d'un item du panier.
 */
@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productNom;
    private String productImage;
    private Double prixUnitaire;
    private Double prixPromo;
    private Integer quantite;
    private Double sousTotal;
    private Long variantId;
}
