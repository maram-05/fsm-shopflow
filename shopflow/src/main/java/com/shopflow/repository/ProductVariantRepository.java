package com.shopflow.repository;

import com.shopflow.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour gérer les variantes de produits (tailles, couleurs, etc.).
 */
@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    /**
     * Trouve toutes les variantes d'un produit.
     * @param productId ID du produit
     * @return Liste des variantes
     */
    List<ProductVariant> findByProductId(Long productId);

    /**
     * Trouve une variante spécifique d'un produit par attribut et valeur.
     * @param productId ID du produit
     * @param attribut Type d'attribut (ex: "Taille", "Couleur")
     * @param valeur Valeur de l'attribut (ex: "M", "Rouge")
     * @return La variante si trouvée
     */
    Optional<ProductVariant> findByProductIdAndAttributAndValeur(
        Long productId, 
        String attribut, 
        String valeur
    );

    /**
     * Trouve toutes les variantes d'un produit par type d'attribut.
     * @param productId ID du produit
     * @param attribut Type d'attribut (ex: "Taille")
     * @return Liste des variantes
     */
    List<ProductVariant> findByProductIdAndAttribut(Long productId, String attribut);

    /**
     * Vérifie si une variante existe pour un produit.
     * @param productId ID du produit
     * @param attribut Type d'attribut
     * @param valeur Valeur de l'attribut
     * @return true si la variante existe
     */
    boolean existsByProductIdAndAttributAndValeur(
        Long productId, 
        String attribut, 
        String valeur
    );

    /**
     * Supprime toutes les variantes d'un produit.
     * @param productId ID du produit
     */
    void deleteByProductId(Long productId);

    /**
     * Compte le nombre de variantes d'un produit.
     * @param productId ID du produit
     * @return Nombre de variantes
     */
    long countByProductId(Long productId);

    /**
     * Trouve les types d'attributs distincts pour un produit.
     * @param productId ID du produit
     * @return Liste des types d'attributs
     */
    @Query("SELECT DISTINCT pv.attribut FROM ProductVariant pv WHERE pv.product.id = :productId")
    List<String> findDistinctAttributsByProductId(Long productId);
}
