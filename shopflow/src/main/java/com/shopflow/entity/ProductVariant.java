package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Variante d'un produit.
 * Exemples : Taille=M, Couleur=Rouge, Format=256GB
 */
@Entity
@Table(name = "product_variants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 50)
    private String attribut;  // Ex: "Taille", "Couleur"

    @Column(nullable = false, length = 100)
    private String valeur;    // Ex: "M", "Rouge", "256GB"

    /** Stock supplémentaire propre à cette variante */
    @Builder.Default
    private Integer stockSupplementaire = 0;

    /** Différence de prix par rapport au produit de base (peut être négatif) */
    @Builder.Default
    private Double prixDelta = 0.0;
}