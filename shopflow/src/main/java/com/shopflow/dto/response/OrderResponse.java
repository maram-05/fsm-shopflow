package com.shopflow.dto.response;

import com.shopflow.entity.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Réponse contenant les informations d'une commande.
 */
@Data
@Builder
public class OrderResponse {
    private Long id;
    private String numeroCommande;
    private OrderStatus statut;
    private String adresseLivraison;
    private Double sousTotal;
    private Double fraisLivraison;
    private Double totalTTC;
    private LocalDateTime dateCommande;
    private String couponCode;
}
