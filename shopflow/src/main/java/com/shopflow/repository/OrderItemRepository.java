package com.shopflow.repository;

import com.shopflow.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour gérer les lignes de commande.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Trouve toutes les lignes d'une commande.
     * @param orderId ID de la commande
     * @return Liste des lignes de commande
     */
    List<OrderItem> findByOrderId(Long orderId);

    /**
     * Trouve toutes les commandes contenant un produit spécifique.
     * Utile pour les statistiques de vente d'un produit.
     * @param productId ID du produit
     * @return Liste des lignes de commande
     */
    List<OrderItem> findByProductId(Long productId);

    /**
     * Compte le nombre de fois qu'un produit a été commandé.
     * @param productId ID du produit
     * @return Nombre de commandes
     */
    long countByProductId(Long productId);

    /**
     * Calcule le nombre total d'unités vendues pour un produit.
     * @param productId ID du produit
     * @return Quantité totale vendue
     */
    @Query("SELECT COALESCE(SUM(oi.quantite), 0) FROM OrderItem oi WHERE oi.product.id = :productId")
    Integer sumQuantiteByProductId(Long productId);

    /**
     * Calcule le chiffre d'affaires total généré par un produit.
     * @param productId ID du produit
     * @return Chiffre d'affaires total
     */
    @Query("SELECT COALESCE(SUM(oi.quantite * oi.prixUnitaire), 0.0) FROM OrderItem oi WHERE oi.product.id = :productId")
    Double sumRevenueByProductId(Long productId);

    /**
     * Trouve les produits les plus vendus (top N).
     * @return Liste des lignes de commande groupées par produit
     */
    @Query("""
        SELECT oi FROM OrderItem oi 
        GROUP BY oi.product 
        ORDER BY SUM(oi.quantite) DESC
    """)
    List<OrderItem> findTopSellingProducts();

    /**
     * Trouve toutes les commandes d'un vendeur spécifique.
     * @param sellerId ID du profil vendeur
     * @return Liste des lignes de commande
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.seller.id = :sellerId")
    List<OrderItem> findByProductSellerId(Long sellerId);

    /**
     * Calcule le chiffre d'affaires total d'un vendeur.
     * @param sellerId ID du profil vendeur
     * @return Chiffre d'affaires total
     */
    @Query("""
        SELECT COALESCE(SUM(oi.quantite * oi.prixUnitaire), 0.0) 
        FROM OrderItem oi 
        WHERE oi.product.seller.id = :sellerId
    """)
    Double sumRevenueByProductSellerId(Long sellerId);

    /**
     * Compte le nombre de produits vendus par un vendeur.
     * @param sellerId ID du profil vendeur
     * @return Nombre total d'unités vendues
     */
    @Query("""
        SELECT COALESCE(SUM(oi.quantite), 0) 
        FROM OrderItem oi 
        WHERE oi.product.seller.id = :sellerId
    """)
    Integer sumQuantiteByProductSellerId(Long sellerId);
}
