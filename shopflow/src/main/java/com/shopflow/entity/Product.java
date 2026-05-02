package com.shopflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Produit mis en vente par un vendeur.
 *
 * Points JPA importants :
 *  - Relation ManyToMany avec Category (table de jointure product_categories)
 *  - Relation OneToMany avec ProductVariant (tailles, couleurs...)
 *  - Relation OneToMany avec Review (avis clients)
 *  - soft delete : "actif=false" au lieu de supprimer réellement la ligne
 */
@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "idx_product_seller", columnList = "seller_id"),
        @Index(name = "idx_product_actif",  columnList = "actif")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Le vendeur propriétaire de ce produit.
     * FetchType.LAZY : on ne charge pas le vendeur à chaque requête produit.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private SellerProfile seller;

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Column(nullable = false, length = 200)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Positive(message = "Le prix doit être positif")
    @Column(nullable = false)
    private Double prix;

    /**
     * Prix promotionnel — null si pas de promo.
     * Si prixPromo < prix, le produit est affiché avec le prix barré.
     */
    private Double prixPromo;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Builder.Default
    private Boolean actif = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    /**
     * Images du produit — stockées comme une liste de chaînes séparées par des virgules.
     * En prod on utiliserait une table dédiée ou du JSON.
     */
    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    /**
     * RELATION MANY-TO-MANY avec Category.
     * Spring crée automatiquement une table "product_categories" avec 2 colonnes FK.
     * Un produit peut appartenir à plusieurs catégories et vice-versa.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "product_categories",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new HashSet<>();

    /**
     * Variantes du produit (taille M, couleur rouge, etc.)
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    /**
     * Avis des clients
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }

    // --- Méthodes utilitaires métier ---

    /** Retourne true si ce produit est en promotion */
    public boolean isEnPromotion() {
        return prixPromo != null && prixPromo < prix;
    }

    /** Calcule le pourcentage de remise */
    public Double getPourcentageRemise() {
        if (!isEnPromotion()) return 0.0;
        return Math.round(((prix - prixPromo) / prix) * 100.0 * 100.0) / 100.0;
    }

    /** Prix effectif (promo si disponible, sinon prix normal) */
    public Double getPrixEffectif() {
        return isEnPromotion() ? prixPromo : prix;
    }
}