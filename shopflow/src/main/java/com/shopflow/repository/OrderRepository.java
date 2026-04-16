package com.shopflow.repository;

import com.shopflow.entity.Order;
import com.shopflow.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Commandes d'un client (pour "mes commandes") */
    Page<Order> findAllByCustomerIdOrderByDateCommandeDesc(Long customerId, Pageable pageable);

    /** Commandes reçues par un vendeur (via les OrderItem) */
    @Query("""
        SELECT DISTINCT o FROM Order o
        JOIN o.lignes oi
        WHERE oi.product.seller.id = :sellerId
        ORDER BY o.dateCommande DESC
        """)
    Page<Order> findAllBySellerIdOrderByDateDesc(@Param("sellerId") Long sellerId, Pageable pageable);

    /** Commandes en attente pour un vendeur */
    @Query("""
        SELECT DISTINCT o FROM Order o
        JOIN o.lignes oi
        WHERE oi.product.seller.id = :sellerId
        AND o.statut = :statut
        """)
    List<Order> findBySellerIdAndStatut(@Param("sellerId") Long sellerId,
                                        @Param("statut") OrderStatus statut);

    /** Vérifie si un client a bien acheté un produit (pour autoriser un avis) */
    @Query("""
        SELECT COUNT(o) > 0 FROM Order o
        JOIN o.lignes oi
        WHERE o.customer.id = :customerId
        AND oi.product.id = :productId
        AND o.statut = com.shopflow.entity.enums.OrderStatus.DELIVERED
        """)
    boolean hasCustomerPurchasedProduct(@Param("customerId") Long customerId,
                                        @Param("productId") Long productId);

    Optional<Order> findByNumeroCommande(String numeroCommande);

    /** Chiffre d'affaires global (dashboard ADMIN) */
    @Query("SELECT SUM(o.totalTTC) FROM Order o WHERE o.statut NOT IN ('CANCELLED', 'REFUNDED')")
    Double calculateChiffreAffairesGlobal();

    /** CA d'un vendeur spécifique */
    @Query("""
        SELECT SUM(oi.prixUnitaire * oi.quantite) FROM OrderItem oi
        WHERE oi.product.seller.id = :sellerId
        AND oi.order.statut NOT IN (
            com.shopflow.entity.enums.OrderStatus.CANCELLED,
            com.shopflow.entity.enums.OrderStatus.REFUNDED
        )
        """)
    Double calculateChiffreAffairesBySeller(@Param("sellerId") Long sellerId);
}