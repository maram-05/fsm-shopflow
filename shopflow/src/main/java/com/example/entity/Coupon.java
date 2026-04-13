package com.shopflow.entity;

import com.shopflow.entity.enums.CouponType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Code promo applicable sur une commande.
 *
 * Deux types :
 *   PERCENT → remise en % (ex: -20%)
 *   FIXED   → remise fixe  (ex: -10 TND)
 *
 * Un coupon a un nombre max d'utilisations et une date d'expiration.
 */
@Entity
@Table(
    name = "coupons",
    indexes = {
        @Index(name = "idx_coupon_code", columnList = "code", unique = true)
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le code promo est obligatoire")
    @Column(nullable = false, unique = true, length = 30)
    private String code;  // Ex: "ETE2025", "BIENVENUE10"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;

    @Positive(message = "La valeur de remise doit être positive")
    @Column(nullable = false)
    private Double valeur;  // 20 pour 20% ou 20 pour 20 TND selon le type

    private LocalDate dateExpiration;

    /** Nombre maximum d'utilisations autorisées (null = illimité) */
    private Integer usagesMax;

    @Builder.Default
    private Integer usagesActuels = 0;

    @Builder.Default
    private Boolean actif = true;

    // --- Méthodes utilitaires métier ---

    /**
     * Vérifie si ce coupon est encore valide.
     * Un coupon est valide si :
     *  - il est actif
     *  - il n'a pas expiré
     *  - il n'a pas dépassé son nombre max d'utilisations
     */
    public boolean estValide() {
        if (!actif) return false;
        if (dateExpiration != null && LocalDate.now().isAfter(dateExpiration)) return false;
        if (usagesMax != null && usagesActuels >= usagesMax) return false;
        return true;
    }

    /**
     * Calcule le montant de la remise pour un sous-total donné.
     * @param sousTotal le montant avant remise
     * @return le montant de la remise (jamais supérieur au sous-total)
     */
    public Double calculerRemise(Double sousTotal) {
        if (!estValide()) return 0.0;
        double remise = switch (type) {
            case PERCENT -> sousTotal * (valeur / 100.0);
            case FIXED   -> valeur;
        };
        return Math.min(remise, sousTotal); // La remise ne peut pas dépasser le total
    }
}