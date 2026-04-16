package com.shopflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Profil boutique d'un vendeur.
 * Relation 1-1 avec User (FK dans cette table : user_id).
 */
@Entity
@Table(name = "seller_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relation 1-1 avec User.
     * @JoinColumn : la colonne "user_id" dans la table seller_profiles.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotBlank(message = "Le nom de la boutique est obligatoire")
    @Column(nullable = false, length = 150)
    private String nomBoutique;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String logo;  // URL de l'image

    @Builder.Default
    private Double note = 0.0;
}