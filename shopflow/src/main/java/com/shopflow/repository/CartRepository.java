package com.shopflow.repository;

import com.shopflow.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * Récupère le panier d'un client avec tous ses articles chargés en une requête.
     * Sans JOIN FETCH, chaque CartItem déclencherait une requête supplémentaire
     * (problème N+1).
     */
    @Query("""
        SELECT c FROM Cart c
        LEFT JOIN FETCH c.lignes l
        LEFT JOIN FETCH l.product
        WHERE c.customer.id = :customerId
        """)
    Optional<Cart> findByCustomerIdWithItems(@Param("customerId") Long customerId);

    Optional<Cart> findByCustomerId(Long customerId);
}