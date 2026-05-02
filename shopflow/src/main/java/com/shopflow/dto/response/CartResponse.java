package com.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Réponse contenant les informations du panier.
 */
@Data
@Builder
public class CartResponse {
    private Long id;
    private Long customerId;
    private Double total;
    private Integer nombreArticles;
    private LocalDateTime dateModification;
    private List<CartItemResponse> items;  // ✅ Ajout de la liste des items
}
