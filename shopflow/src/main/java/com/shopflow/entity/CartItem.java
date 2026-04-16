package com.shopflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.*;

/**
 * Un article dans le panier.
 * Correspond à : 1 produit (+ éventuellement 1 variante) x une quantité.
 */
@Entity
@Table(name = "cart_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Variante choisie (taille, couleur...) — peut être null si pas de variante.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Positive(message = "La quantité doit être au moins 1")
    @Column(nullable = false)
    @Builder.Default
    private Integer quantite = 1;
}