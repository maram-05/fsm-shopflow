package com.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Réponse contenant les informations d'une adresse.
 */
@Data
@Builder
public class AddressResponse {
    private Long id;
    private String rue;
    private String ville;
    private String codePostal;
    private String pays;
    private Boolean principal;
}
