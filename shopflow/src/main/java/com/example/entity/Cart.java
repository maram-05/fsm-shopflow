package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Panier d'un client — persisté en base (survit à la déconnexion).
 * Relation 1-1 avec User : chaque client a UN seul panier.
 */
@Entity
@Table(name = "carts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relation 1-1 : ce panier appartient à un seul client.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private User customer;

    private LocalDateTime dateModification;

    /**
     * Articles dans le panier.
     * CascadeType.ALL : si on supprime le panier, tous les CartItem sont supprimés.
     * orphanRemoval : si on retire un CartItem de la liste, il est supprimé de la base.
     */
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CartItem> lignes = new ArrayList<>();

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.dateModification = LocalDateTime.now();
    }

    /** Calcule le total du panier */
    public Double calculerTotal() {
        return lignes.stream()
            .mapToDouble(item -> item.getProduct().getPrixEffectif() * item.getQuantite())
            .sum();
    }
}