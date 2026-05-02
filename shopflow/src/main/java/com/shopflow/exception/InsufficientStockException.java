package com.shopflow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception spécifique pour les problèmes de stock insuffisant.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class InsufficientStockException extends BusinessException {
    
    private final Long productId;
    private final Integer requestedQuantity;
    private final Integer availableStock;
    
    public InsufficientStockException(Long productId, Integer requestedQuantity, Integer availableStock) {
        super(String.format("Stock insuffisant pour le produit %d. Demandé: %d, Disponible: %d", 
              productId, requestedQuantity, availableStock), "INSUFFICIENT_STOCK");
        this.productId = productId;
        this.requestedQuantity = requestedQuantity;
        this.availableStock = availableStock;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public Integer getRequestedQuantity() {
        return requestedQuantity;
    }
    
    public Integer getAvailableStock() {
        return availableStock;
    }
}