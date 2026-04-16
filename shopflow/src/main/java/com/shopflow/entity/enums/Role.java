package com.shopflow.entity.enums;

/**
 * Les 3 rôles possibles d'un utilisateur dans ShopFlow.
 * Stocké en base comme une chaîne de caractères (ex: "ADMIN").
 */
public enum Role {
    ADMIN,      // Gère toute la plateforme
    SELLER,     // Vendeur — gère sa boutique
    CUSTOMER    // Client — achète des produits
}