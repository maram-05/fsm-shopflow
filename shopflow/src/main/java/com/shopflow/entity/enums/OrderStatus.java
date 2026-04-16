package com.shopflow.entity.enums;

/**
 * Les étapes de vie d'une commande.
 *
 * Flux autorisé :
 *   PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
 *   PENDING → CANCELLED  (si le client annule)
 *   PAID    → CANCELLED  (si le client annule avant traitement)
 *   CANCELLED → REFUNDED (remboursement simulé)
 */
public enum OrderStatus {
    PENDING,      // Commande créée, paiement non encore reçu
    PAID,         // Paiement reçu
    PROCESSING,   // En cours de préparation par le vendeur
    SHIPPED,      // Expédiée
    DELIVERED,    // Livrée au client
    CANCELLED,    // Annulée
    REFUNDED      // Remboursée
}