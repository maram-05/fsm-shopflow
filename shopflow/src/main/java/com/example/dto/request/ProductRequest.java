package com.shopflow.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;
import java.util.Set;

/** DTO pour créer ou modifier un produit */
@Data
public class ProductRequest {

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Size(min = 3, max = 200)
    private String nom;

    private String description;

    @NotNull
    @Positive(message = "Le prix doit être positif")
    private Double prix;

    /** null = pas de promo */
    @Positive
    private Double prixPromo;

    @NotNull
    @PositiveOrZero
    private Integer stock;

    /** IDs des catégories associées */
    private Set<Long> categoryIds;

    /** URLs des images */
    private List<String> images;
}