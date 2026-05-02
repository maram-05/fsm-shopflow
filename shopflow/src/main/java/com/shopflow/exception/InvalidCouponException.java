package com.shopflow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception spécifique pour les problèmes de coupons invalides.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidCouponException extends BusinessException {
    
    public enum CouponError {
        EXPIRED("Le coupon a expiré"),
        INACTIVE("Le coupon n'est plus actif"),
        MAX_USAGE_REACHED("Le coupon a atteint son nombre maximum d'utilisations"),
        NOT_FOUND("Le coupon n'existe pas"),
        INVALID_VALUE("La valeur du coupon est invalide");
        
        private final String message;
        
        CouponError(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    }
    
    private final CouponError couponError;
    private final String couponCode;
    
    public InvalidCouponException(CouponError couponError, String couponCode) {
        super(couponError.getMessage() + ": " + couponCode, "INVALID_COUPON");
        this.couponError = couponError;
        this.couponCode = couponCode;
    }
    
    public CouponError getCouponError() {
        return couponError;
    }
    
    public String getCouponCode() {
        return couponCode;
    }
}