package com.shopflow.entity;

import com.shopflow.entity.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Entité centrale : représente un utilisateur de ShopFlow.
 *
 * Implémente UserDetails pour que Spring Security puisse
 * l'utiliser directement pour l'authentification JWT.
 *
 * Annotations Lombok utilisées :
 *   @Data       = génère getters, setters, toString, equals, hashCode
 *   @Builder    = permet de créer un objet avec User.builder().email("...").build()
 *   @NoArgsConstructor / @AllArgsConstructor = constructeurs requis par JPA et Builder
 */
@Entity
@Table(
    name = "users",   // "user" est un mot réservé SQL — on utilise "users"
    indexes = {
        @Index(name = "idx_user_email", columnList = "email", unique = true)
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email(message = "Format email invalide")
    @NotBlank(message = "L'email est obligatoire")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Column(nullable = false)
    private String motDePasse;  // Stocké hashé avec BCrypt — jamais en clair !

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false, length = 80)
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false, length = 80)
    private String nom;

    @Enumerated(EnumType.STRING)  // Stocke "ADMIN", "SELLER" ou "CUSTOMER" en base
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    // =========================================================
    //  RELATIONS JPA
    // =========================================================

    /**
     * Un vendeur a un profil boutique (relation 1-1).
     * mappedBy = "user" signifie que la FK est dans SellerProfile, pas ici.
     * CascadeType.ALL : si on supprime User, son SellerProfile est aussi supprimé.
     */
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private SellerProfile sellerProfile;

    /**
     * Un client peut avoir plusieurs adresses de livraison.
     * FetchType.LAZY = les adresses ne sont chargées que si on les demande (bonne pratique).
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

    /**
     * Un client a un seul panier.
     */
    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Cart cart;

    /**
     * Un client peut avoir plusieurs commandes.
     */
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    // =========================================================
    //  LIFECYCLE JPA — appelé automatiquement avant insertion
    // =========================================================
    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }

    // =========================================================
    //  INTERFACE UserDetails — requis par Spring Security
    //  Ces méthodes disent à Spring Security comment vérifier
    //  les droits d'accès.
    // =========================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // "ROLE_ADMIN", "ROLE_SELLER" ou "ROLE_CUSTOMER"
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return motDePasse;
    }

    @Override
    public String getUsername() {
        return email;  // On utilise l'email comme identifiant
    }

    @Override
    public boolean isAccountNonExpired()    { return true; }

    @Override
    public boolean isAccountNonLocked()     { return actif; }

    @Override
    public boolean isCredentialsNonExpired(){ return true; }

    @Override
    public boolean isEnabled()              { return actif; }
}