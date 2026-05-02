package com.shopflow.repository;

import com.shopflow.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    boolean existsByCode(String code);

    /** Trouve les coupons actifs */
    java.util.List<Coupon> findByActifTrue();

    /** Trouve les coupons valides (actifs et non expirés) */
    @org.springframework.data.jpa.repository.Query("""
        SELECT c FROM Coupon c 
        WHERE c.actif = true 
        AND (c.dateExpiration IS NULL OR c.dateExpiration >= :today)
        AND (c.usagesMax IS NULL OR c.usagesActuels < c.usagesMax)
    """)
    java.util.List<Coupon> findValidCoupons(java.time.LocalDate today);
}