package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Ligne d'une commande — snapshot du produit au moment de l'achat.
 * Le prixUnitaire est figé ici : si le vendeur change son prix après,
 * la commande garde l'ancien prix. C'est la règle métier correcte.
 */
@Entity
@Table(name = "order_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(nullable = false)
    private Integer quantite;

    /** Prix figé au moment de la commande */
    @Column(nullable = false)
    private Double prixUnitaire;

    public Double getSousTotal() {
        return prixUnitaire * quantite;
    }
}