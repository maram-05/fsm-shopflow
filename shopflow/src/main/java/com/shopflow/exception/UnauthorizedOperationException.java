package com.shopflow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception pour les opérations non autorisées (différent de l'authentification).
 * Utilisée quand un utilisateur authentifié tente d'accéder à une ressource qui ne lui appartient pas.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedOperationException extends RuntimeException {
    
    private final String operation;
    private final String resource;
    
    public UnauthorizedOperationException(String message) {
        super(message);
        this.operation = null;
        this.resource = null;
    }
    
    public UnauthorizedOperationException(String operation, String resource) {
        super(String.format("Opération '%s' non autorisée sur la ressource '%s'", operation, resource));
        this.operation = operation;
        this.resource = resource;
    }
    
    public UnauthorizedOperationException(String message, String operation, String resource) {
        super(message);
        this.operation = operation;
        this.resource = resource;
    }
    
    public String getOperation() {
        return operation;
    }
    
    public String getResource() {
        return resource;
    }
}