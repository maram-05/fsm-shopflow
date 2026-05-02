package com.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Réponse contenant les informations d'un avis.
 */
@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long customerId;
    private String customerNom;
    private Long productId;
    private String productNom;
    private Integer note;
    private String commentaire;
    private Boolean approuve;
    private LocalDateTime dateCreation;
}
