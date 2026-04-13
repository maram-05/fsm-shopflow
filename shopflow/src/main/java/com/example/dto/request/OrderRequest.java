package com.shopflow.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** DTO pour passer une commande depuis le panier */
@Data
public class OrderRequest {

    @NotNull(message = "L'adresse de livraison est obligatoire")
    private Long addressId;

    /** Code promo optionnel */
    private String codeCoupon;
}