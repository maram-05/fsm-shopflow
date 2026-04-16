package com.shopflow.entity;

import com.shopflow.entity.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Commande passée par un client.
 *
 * IMPORTANT : "order" est un mot réservé SQL — la table s'appelle "orders".
 *
 * Le numéro de commande est unique et généré automatiquement.
 * Format : ORD-2025-XXXXX
 */
@Entity
@Table(
    name = "orders",
    indexes = {
        @Index(name = "idx_order_customer",       columnList = "customer_id"),
        @Index(name = "idx_order_numero",         columnList = "numero_commande", unique = true),
        @Index(name = "idx_order_statut",         columnList = "statut")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus statut = OrderStatus.PENDING;

    @Column(name = "numero_commande", nullable = false, unique = true, length = 20)
    private String numeroCommande;  // Ex: ORD-2025-00001

    /**
     * Adresse de livraison (copiée au moment de la commande pour garder l'historique)
     */
    @Column(columnDefinition = "TEXT")
    private String adresseLivraison;

    @Column(nullable = false)
    @Builder.Default
    private Double sousTotal = 0.0;

    @Builder.Default
    private Double fraisLivraison = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double totalTTC = 0.0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCommande;

    /**
     * Coupon appliqué à cette commande (optionnel).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    /**
     * Lignes de commande — snapshot des produits au moment de l'achat.
     * On ne référence pas directement les produits car leurs prix peuvent changer.
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> lignes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.dateCommande = LocalDateTime.now();
    }

    /** Vérifie si la commande peut être annulée */
    public boolean peutEtreAnnulee() {
        return statut == OrderStatus.PENDING || statut == OrderStatus.PAID;
    }
}