package com.shopflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Catégorie de produit — supporte les sous-catégories (arbre).
 *
 * Exemple d'arbre :
 *   Électronique
 *   ├── Téléphones
 *   │   ├── Android
 *   │   └── iPhone
 *   └── Ordinateurs
 *
 * La relation parent est une auto-référence : une Category
 * peut avoir une Category parente (de la même table).
 */
@Entity
@Table(name = "categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Relation auto-référence : catégorie parente.
     * Une catégorie principale (Électronique) n'a pas de parent (null).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    /**
     * Sous-catégories de cette catégorie.
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Category> sousCategories = new ArrayList<>();
}