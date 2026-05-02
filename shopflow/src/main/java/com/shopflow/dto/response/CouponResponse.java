package com.shopflow.dto.response;

import com.shopflow.entity.enums.CouponType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

/**
 * Réponse contenant les informations d'un coupon.
 */
@Data
@Builder
public class CouponResponse {
    private Long id;
    private String code;
    private CouponType type;
    private Double valeur;
    private LocalDate dateExpiration;
    private Integer usagesMax;
    private Integer usagesActuels;
    private Boolean actif;
    private Boolean valide;
}
