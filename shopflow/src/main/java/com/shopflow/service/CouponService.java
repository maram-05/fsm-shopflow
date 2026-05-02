package com.shopflow.service;

import com.shopflow.entity.Coupon;
import com.shopflow.entity.enums.CouponType;
import com.shopflow.exception.DuplicateResourceException;
import com.shopflow.exception.InvalidCouponException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service de gestion des coupons de réduction.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;

    /**
     * Récupère tous les coupons.
     */
    public List<Coupon> getAllCoupons() {
        log.debug("Récupération de tous les coupons");
        return couponRepository.findAll();
    }

    /**
     * Récupère les coupons actifs.
     */
    public List<Coupon> getActiveCoupons() {
        log.debug("Récupération des coupons actifs");
        return couponRepository.findByActifTrue();
    }

    /**
     * Récupère les coupons valides (actifs et non expirés).
     */
    public List<Coupon> getValidCoupons() {
        log.debug("Récupération des coupons valides");
        return couponRepository.findValidCoupons(LocalDate.now());
    }

    /**
     * Récupère un coupon par son ID.
     */
    public Coupon getCouponById(Long id) {
        log.debug("Récupération du coupon: {}", id);
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon non trouvé: " + id));
    }

    /**
     * Récupère un coupon par son code.
     */
    public Coupon getCouponByCode(String code) {
        log.debug("Récupération du coupon avec le code: {}", code);
        return couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon non trouvé avec le code: " + code));
    }

    /**
     * Valide un code promo et retourne le coupon s'il est valide.
     */
    public Coupon validateCoupon(String code) {
        log.info("Validation du code promo: {}", code);

        Coupon coupon = getCouponByCode(code);

        if (!coupon.estValide()) {
            if (!coupon.getActif()) {
                throw new InvalidCouponException(InvalidCouponException.CouponError.INACTIVE, code);
            }
            if (coupon.getDateExpiration() != null && LocalDate.now().isAfter(coupon.getDateExpiration())) {
                throw new InvalidCouponException(InvalidCouponException.CouponError.EXPIRED, code);
            }
            if (coupon.getUsagesMax() != null && coupon.getUsagesActuels() >= coupon.getUsagesMax()) {
                throw new InvalidCouponException(InvalidCouponException.CouponError.MAX_USAGE_REACHED, code);
            }
        }

        log.info("Code promo valide: {}", code);
        return coupon;
    }

    /**
     * Crée un nouveau coupon.
     */
    @Transactional
    public Coupon createCoupon(String code, CouponType type, Double valeur, LocalDate dateExpiration, Integer usagesMax) {
        log.info("Création d'un nouveau coupon: {}", code);

        // Vérifier si le code existe déjà
        if (couponRepository.existsByCode(code.toUpperCase())) {
            throw new IllegalArgumentException("Un coupon avec ce code existe déjà: " + code);
        }

        // Valider la valeur selon le type
        if (type == CouponType.PERCENT && (valeur <= 0 || valeur > 100)) {
            throw new IllegalArgumentException("La valeur d'un coupon en pourcentage doit être entre 0 et 100");
        }
        if (type == CouponType.FIXED && valeur <= 0) {
            throw new IllegalArgumentException("La valeur d'un coupon fixe doit être positive");
        }

        Coupon coupon = Coupon.builder()
                .code(code.toUpperCase())
                .type(type)
                .valeur(valeur)
                .dateExpiration(dateExpiration)
                .usagesMax(usagesMax)
                .usagesActuels(0)
                .actif(true)
                .build();

        Coupon saved = couponRepository.save(coupon);
        log.info("Coupon créé avec succès: {}", saved.getId());
        return saved;
    }

    /**
     * Met à jour un coupon existant.
     */
    @Transactional
    public Coupon updateCoupon(Long id, String code, CouponType type, Double valeur, LocalDate dateExpiration, Integer usagesMax, Boolean actif) {
        log.info("Mise à jour du coupon: {}", id);

        Coupon coupon = getCouponById(id);

        // Vérifier si le nouveau code existe déjà (sauf si c'est le même)
        if (!coupon.getCode().equals(code.toUpperCase()) && couponRepository.existsByCode(code.toUpperCase())) {
            throw new IllegalArgumentException("Un coupon avec ce code existe déjà: " + code);
        }

        // Valider la valeur selon le type
        if (type == CouponType.PERCENT && (valeur <= 0 || valeur > 100)) {
            throw new IllegalArgumentException("La valeur d'un coupon en pourcentage doit être entre 0 et 100");
        }
        if (type == CouponType.FIXED && valeur <= 0) {
            throw new IllegalArgumentException("La valeur d'un coupon fixe doit être positive");
        }

        coupon.setCode(code.toUpperCase());
        coupon.setType(type);
        coupon.setValeur(valeur);
        coupon.setDateExpiration(dateExpiration);
        coupon.setUsagesMax(usagesMax);
        coupon.setActif(actif);

        Coupon updated = couponRepository.save(coupon);
        log.info("Coupon mis à jour avec succès: {}", id);
        return updated;
    }

    /**
     * Désactive un coupon.
     */
    @Transactional
    public Coupon deactivateCoupon(Long id) {
        log.info("Désactivation du coupon: {}", id);

        Coupon coupon = getCouponById(id);
        coupon.setActif(false);

        Coupon updated = couponRepository.save(coupon);
        log.info("Coupon désactivé avec succès: {}", id);
        return updated;
    }

    /**
     * Active un coupon.
     */
    @Transactional
    public Coupon activateCoupon(Long id) {
        log.info("Activation du coupon: {}", id);

        Coupon coupon = getCouponById(id);
        coupon.setActif(true);

        Coupon updated = couponRepository.save(coupon);
        log.info("Coupon activé avec succès: {}", id);
        return updated;
    }

    /**
     * Incrémente le compteur d'utilisation d'un coupon.
     * Appelé lors de la validation d'une commande.
     */
    @Transactional
    public void incrementUsage(Long couponId) {
        log.info("Incrémentation de l'utilisation du coupon: {}", couponId);

        Coupon coupon = getCouponById(couponId);
        coupon.setUsagesActuels(coupon.getUsagesActuels() + 1);
        couponRepository.save(coupon);

        log.info("Utilisation du coupon incrémentée: {} ({}/{})",
                couponId, coupon.getUsagesActuels(), coupon.getUsagesMax());
    }

    /**
     * Supprime un coupon.
     * Attention : ne pas supprimer un coupon déjà utilisé dans des commandes.
     */
    @Transactional
    public void deleteCoupon(Long id) {
        log.info("Suppression du coupon: {}", id);

        Coupon coupon = getCouponById(id);

        // Vérifier si le coupon a été utilisé
        if (coupon.getUsagesActuels() > 0) {
            throw new IllegalStateException("Impossible de supprimer un coupon déjà utilisé. Désactivez-le plutôt.");
        }

        couponRepository.deleteById(id);
        log.info("Coupon supprimé avec succès: {}", id);
    }

    /**
     * Calcule le montant de la remise pour un sous-total donné.
     */
    public Double calculateDiscount(String code, Double sousTotal) {
        log.debug("Calcul de la remise pour le code: {} et sous-total: {}", code, sousTotal);

        Coupon coupon = validateCoupon(code);
        Double remise = coupon.calculerRemise(sousTotal);

        log.debug("Remise calculée: {} pour le code: {}", remise, code);
        return remise;
    }
}
