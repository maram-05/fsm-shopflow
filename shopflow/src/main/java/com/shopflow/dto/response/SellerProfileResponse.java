package com.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Réponse contenant les informations d'un profil vendeur.
 */
@Data
@Builder
public class SellerProfileResponse {
    private Long id;
    private Long userId;
    private String nomBoutique;
    private String description;
    private String logo;
    private Double note;
}
