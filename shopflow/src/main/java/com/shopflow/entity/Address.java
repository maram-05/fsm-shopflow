package com.shopflow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Adresse de livraison d'un client.
 * Un client peut avoir plusieurs adresses.
 */
@Entity
@Table(name = "addresses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relation N-1 : plusieurs adresses appartiennent à un User.
     * @JoinColumn : la colonne "user_id" dans la table addresses.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String rue;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String ville;

    @Column(length = 20)
    private String codePostal;

    @Column(length = 80)
    private String pays;

    /**
     * true = adresse principale (utilisée par défaut pour les commandes)
     */
    @Builder.Default
    private Boolean principal = false;
}