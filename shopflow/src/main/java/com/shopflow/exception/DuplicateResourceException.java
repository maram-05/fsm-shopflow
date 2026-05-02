package com.shopflow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception pour les tentatives de création de ressources déjà existantes.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateResourceException extends BusinessException {
    
    private final String resourceType;
    private final String resourceValue;
    
    public DuplicateResourceException(String resourceType, String resourceValue) {
        super(String.format("%s '%s' existe déjà", resourceType, resourceValue), "DUPLICATE_RESOURCE");
        this.resourceType = resourceType;
        this.resourceValue = resourceValue;
    }
    
    public DuplicateResourceException(String message, String resourceType, String resourceValue) {
        super(message, "DUPLICATE_RESOURCE");
        this.resourceType = resourceType;
        this.resourceValue = resourceValue;
    }
    
    public String getResourceType() {
        return resourceType;
    }
    
    public String getResourceValue() {
        return resourceValue;
    }
}