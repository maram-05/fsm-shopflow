package com.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/** Réponse complète d'un produit (fiche produit) */
@Data
@Builder
public class ProductResponse {
    private Long id;
    private String nom;
    private String description;
    private Double prix;
    private Double prixPromo;
    private Double prixEffectif;
    private Boolean enPromotion;
    private Double pourcentageRemise;
    private Integer stock;
    private Boolean actif;
    private LocalDateTime dateCreation;
    private List<String> images;
    private Set<CategoryResponse> categories;
    private List<ProductVariantResponse> variants;
    private Double noteMoyenne;
    private Long sellerId;
    private String sellerNom;
    private Long sellerProfileId;
    private String nomBoutique;

    @Data
    @Builder
    public static class ProductVariantResponse {
        private Long id;
        private String attribut;
        private String valeur;
        private Integer stockSupplementaire;
        private Double prixDelta;
    }
}