package com.shopflow.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/** DTO pour ajouter/modifier un article dans le panier */
@Data
public class CartItemRequest {

    @NotNull(message = "L'ID du produit est obligatoire")
    private Long productId;

    /** Optionnel — si le produit a des variantes */
    private Long variantId;

    @NotNull
    @Positive(message = "La quantité doit être au moins 1")
    private Integer quantite;
}