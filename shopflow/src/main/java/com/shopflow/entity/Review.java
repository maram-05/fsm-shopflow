package com.shopflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Avis laissé par un client sur un produit qu'il a acheté.
 *
 * Règle métier importante : un client ne peut laisser un avis
 * que sur un produit qu'il a réellement commandé et reçu.
 * Cette vérification se fait dans le Service, pas ici.
 *
 * Les avis doivent être approuvés par un ADMIN avant d'être visibles.
 */
@Entity
@Table(
    name = "reviews",
    indexes = {
        @Index(name = "idx_review_product",  columnList = "product_id"),
        @Index(name = "idx_review_customer", columnList = "customer_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product888 product;

    /**
     * Note de 1 à 5 étoiles.
     * @Min et @Max valident automatiquement avec @Valid dans le Controller.
     */
    @Min(value = 1, message = "La note minimum est 1")
    @Max(value = 5, message = "La note maximum est 5")
    @Column(nullable = false)
    private Integer note;

    @NotBlank(message = "Le commentaire ne peut pas être vide")
    @Size(min = 10, max = 1000, message = "Le commentaire doit faire entre 10 et 1000 caractères")
    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    /** false = en attente de modération, true = visible publiquement */
    @Builder.Default
    private Boolean approuve = false;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }
}