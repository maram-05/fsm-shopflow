package com.shopflow.controller;

import com.shopflow.dto.response.CouponResponse;
import com.shopflow.entity.Coupon;
import com.shopflow.entity.enums.CouponType;
import com.shopflow.service.CouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller REST pour la gestion des coupons de réduction.
 */
@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Slf4j
public class CouponController {

    private final CouponService couponService;

    /**
     * Récupère tous les coupons (admin).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        log.info("GET /api/coupons - Récupération de tous les coupons");
        List<Coupon> coupons = couponService.getAllCoupons();
        List<CouponResponse> responses = coupons.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * Récupère les coupons actifs (admin).
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponResponse>> getActiveCoupons() {
        log.info("GET /api/coupons/active - Récupération des coupons actifs");
        List<Coupon> coupons = couponService.getActiveCoupons();
        List<CouponResponse> responses = coupons.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * Récupère les coupons valides (non expirés, actifs, avec usages disponibles).
     */
    @GetMapping("/valid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponResponse>> getValidCoupons() {
        log.info("GET /api/coupons/valid - Récupération des coupons valides");
        List<Coupon> coupons = couponService.getValidCoupons();
        List<CouponResponse> responses = coupons.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * Récupère un coupon par son ID (admin).
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> getCouponById(@PathVariable Long id) {
        log.info("GET /api/coupons/{} - Récupération du coupon", id);
        Coupon coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(mapToResponse(coupon));
    }

    /**
     * Valide un code promo et retourne le coupon s'il est valide.
     * Accessible aux clients authentifiés.
     */
    @PostMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CouponResponse> validateCoupon(@RequestParam String code) {
        log.info("POST /api/coupons/validate - Validation du code: {}", code);
        Coupon coupon = couponService.validateCoupon(code);
        return ResponseEntity.ok(mapToResponse(coupon));
    }

    /**
     * Crée un nouveau coupon (admin).
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> createCoupon(
            @RequestParam String code,
            @RequestParam CouponType type,
            @RequestParam Double valeur,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateExpiration,
            @RequestParam(required = false) Integer usagesMax) {
        log.info("POST /api/coupons - Création d'un coupon: {}", code);
        Coupon coupon = couponService.createCoupon(code, type, valeur, dateExpiration, usagesMax);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(coupon));
    }

    /**
     * Met à jour un coupon (admin).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @RequestParam String code,
            @RequestParam CouponType type,
            @RequestParam Double valeur,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateExpiration,
            @RequestParam(required = false) Integer usagesMax,
            @RequestParam(defaultValue = "true") Boolean actif) {
        log.info("PUT /api/coupons/{} - Mise à jour du coupon", id);
        Coupon coupon = couponService.updateCoupon(id, code, type, valeur, dateExpiration, usagesMax, actif);
        return ResponseEntity.ok(mapToResponse(coupon));
    }

    /**
     * Active/désactive un coupon (admin).
     */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> toggleCouponStatus(@PathVariable Long id) {
        log.info("PUT /api/coupons/{}/toggle - Changement de statut du coupon", id);
        
        Coupon coupon = couponService.getCouponById(id);
        Coupon updated;
        if (coupon.getActif()) {
            updated = couponService.deactivateCoupon(id);
        } else {
            updated = couponService.activateCoupon(id);
        }
        
        return ResponseEntity.ok(mapToResponse(updated));
    }

    /**
     * Supprime un coupon (admin).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        log.info("DELETE /api/coupons/{} - Suppression du coupon", id);
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    // --- Méthode utilitaire de mapping ---

    private CouponResponse mapToResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .type(coupon.getType())
                .valeur(coupon.getValeur())
                .dateExpiration(coupon.getDateExpiration())
                .usagesMax(coupon.getUsagesMax())
                .usagesActuels(coupon.getUsagesActuels())
                .actif(coupon.getActif())
                .valide(coupon.estValide())
                .build();
    }
}
