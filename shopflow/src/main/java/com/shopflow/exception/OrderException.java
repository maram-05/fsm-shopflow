package com.shopflow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception spécifique pour les problèmes de commandes.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class OrderException extends BusinessException {
    
    public enum OrderError {
        EMPTY_CART("Le panier est vide"),
        CANNOT_CANCEL("Cette commande ne peut plus être annulée"),
        INVALID_STATUS("Statut de commande invalide"),
        PAYMENT_FAILED("Le paiement a échoué"),
        INVALID_ADDRESS("Adresse de livraison invalide");
        
        private final String message;
        
        OrderError(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
    }
    
    private final OrderError orderError;
    private final Long orderId;
    
    public OrderException(OrderError orderError) {
        super(orderError.getMessage(), "ORDER_ERROR");
        this.orderError = orderError;
        this.orderId = null;
    }
    
    public OrderException(OrderError orderError, Long orderId) {
        super(orderError.getMessage() + " (Commande: " + orderId + ")", "ORDER_ERROR");
        this.orderError = orderError;
        this.orderId = orderId;
    }
    
    public OrderError getOrderError() {
        return orderError;
    }
    
    public Long getOrderId() {
        return orderId;
    }
}