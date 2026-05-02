package com.shopflow.repository;

import com.shopflow.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /** Avis approuvés d'un produit (avec pagination) */
    Page<Review> findAllByProductIdAndApprouveTrue(Long productId, Pageable pageable);

    /** Avis approuvés d'un produit (sans pagination) */
    List<Review> findByProductIdAndApprouveTrue(Long productId);

    /** Tous les avis d'un produit (admin) */
    List<Review> findByProductId(Long productId);

    /** Avis en attente de modération (sans pagination) */
    List<Review> findByApprouveFalse();

    /** Avis en attente de modération (avec pagination - dashboard ADMIN) */
    Page<Review> findAllByApprouveFalse(Pageable pageable);

    /** Note moyenne d'un produit (calculée en base, plus performant qu'en Java) */
    @Query("SELECT AVG(r.note) FROM Review r WHERE r.product.id = :productId AND r.approuve = true")
    Optional<Double> calculateNoteMoyenne(@Param("productId") Long productId);

    /** Un client ne peut laisser qu'un seul avis par produit */
    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    /** Nombre d'avis d'un client */
    long countByCustomerId(Long customerId);

    /** Nombre d'avis en attente de modération */
    long countByApprouveFalse();
}