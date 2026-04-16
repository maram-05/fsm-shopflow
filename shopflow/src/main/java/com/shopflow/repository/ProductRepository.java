package com.shopflow.repository;

import com.shopflow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour Product.
 *
 * On étend aussi JpaSpecificationExecutor<Product> pour pouvoir
 * faire des filtres dynamiques (catégorie + prix + vendeur + promo
 * tous combinables) via la classe ProductSpecification.
 *
 * Pageable = pagination automatique (page, taille, tri).
 * Page<Product> = résultat avec les données + métadonnées (total, pages...).
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
                                            JpaSpecificationExecutor<Product> {

    /**
     * Liste paginée des produits actifs.
     * C'est ce qu'on retourne aux clients qui naviguent dans le catalogue.
     */
    Page<Product> findAllByActifTrue(Pageable pageable);

    /**
     * Produits d'un vendeur spécifique (pour son tableau de bord).
     */
    Page<Product> findAllBySeller_IdAndActifTrue(Long sellerId, Pageable pageable);

    /**
     * Recherche plein-texte sur le nom et la description.
     * LOWER() → insensible à la casse
     * LIKE '%mot%' → contient le mot
     *
     * Ex: search("chaussure") trouvera "Chaussures Nike" et "Belle chaussure"
     */
    @Query("""
        SELECT p FROM Product p
        WHERE p.actif = true
        AND (
            LOWER(p.nom) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))
        )
        """)
    Page<Product> searchByNomOrDescription(@Param("query") String query, Pageable pageable);

    /**
     * Top 10 des meilleures ventes.
     * Fait une jointure avec OrderItem et compte les ventes par produit.
     * Utile pour la page d'accueil et le dashboard ADMIN.
     */
    @Query("""
        SELECT p FROM Product p
        JOIN OrderItem oi ON oi.product = p
        WHERE p.actif = true
        GROUP BY p
        ORDER BY SUM(oi.quantite) DESC
        """)
    List<Product> findTop10BestSelling(Pageable pageable);

    /**
     * Produits en promotion (prixPromo < prix et prixPromo non null).
     */
    @Query("SELECT p FROM Product p WHERE p.actif = true AND p.prixPromo IS NOT NULL AND p.prixPromo < p.prix")
    Page<Product> findAllEnPromotion(Pageable pageable);

    /**
     * Produits avec stock faible — utile pour les alertes vendeur.
     * @param seuilStock alerte si stock <= seuilStock (ex: 5)
     */
    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId AND p.stock <= :seuilStock AND p.actif = true")
    List<Product> findLowStockBySeller(@Param("sellerId") Long sellerId,
                                       @Param("seuilStock") Integer seuilStock);

    /**
     * Soft delete : on met actif = false au lieu de vraiment supprimer.
     * @Modifying indique que c'est un UPDATE (pas un SELECT).
     * @Transactional est géré dans le Service qui appelle cette méthode.
     */
    @Modifying
    @Query("UPDATE Product p SET p.actif = false WHERE p.id = :id")
    void softDeleteById(@Param("id") Long id);

    /**
     * Vérifie si un produit appartient bien à un vendeur donné.
     * Sécurité : un vendeur ne peut modifier que SES produits.
     */
    boolean existsByIdAndSeller_Id(Long productId, Long sellerId);

    /**
     * Produit avec ses variantes chargées en une seule requête.
     * JOIN FETCH évite le problème N+1 (une requête par variante).
     */
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.variants WHERE p.id = :id AND p.actif = true")
    Optional<Product> findByIdWithVariants(@Param("id") Long id);
}