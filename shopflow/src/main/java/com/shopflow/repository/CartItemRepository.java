package com.shopflow.repository;

import com.shopflow.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour gérer les articles dans les paniers.
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * Trouve tous les articles d'un panier.
     * @param cartId ID du panier
     * @return Liste des articles
     */
    List<CartItem> findByCartId(Long cartId);

    /**
     * Trouve un article spécifique dans un panier (produit sans variante).
     * @param cartId ID du panier
     * @param productId ID du produit
     * @return L'article si trouvé
     */
    Optional<CartItem> findByCartIdAndProductIdAndVariantIsNull(Long cartId, Long productId);

    /**
     * Trouve un article spécifique dans un panier (produit avec variante).
     * @param cartId ID du panier
     * @param productId ID du produit
     * @param variantId ID de la variante
     * @return L'article si trouvé
     */
    Optional<CartItem> findByCartIdAndProductIdAndVariantId(
        Long cartId, 
        Long productId, 
        Long variantId
    );

    /**
     * Vérifie si un produit est déjà dans le panier.
     * @param cartId ID du panier
     * @param productId ID du produit
     * @return true si le produit est dans le panier
     */
    boolean existsByCartIdAndProductId(Long cartId, Long productId);

    /**
     * Supprime tous les articles d'un panier.
     * @param cartId ID du panier
     */
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteByCartId(Long cartId);

    /**
     * Supprime un article spécifique du panier.
     * @param cartId ID du panier
     * @param productId ID du produit
     */
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    void deleteByCartIdAndProductId(Long cartId, Long productId);

    /**
     * Compte le nombre d'articles dans un panier.
     * @param cartId ID du panier
     * @return Nombre d'articles
     */
    long countByCartId(Long cartId);

    /**
     * Calcule la quantité totale d'articles dans un panier.
     * @param cartId ID du panier
     * @return Quantité totale
     */
    @Query("SELECT COALESCE(SUM(ci.quantite), 0) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Integer sumQuantiteByCartId(Long cartId);

    /**
     * Trouve tous les paniers contenant un produit spécifique.
     * Utile pour notifier les clients si un produit est supprimé ou en rupture.
     * @param productId ID du produit
     * @return Liste des articles
     */
    List<CartItem> findByProductId(Long productId);
}
