package com.shopflow.service;

import com.shopflow.entity.Product;
import com.shopflow.entity.ProductVariant;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service de gestion des variantes de produits (tailles, couleurs, formats, etc.).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;

    /**
     * Récupère toutes les variantes d'un produit.
     */
    public List<ProductVariant> getProductVariants(Long productId) {
        log.debug("Récupération des variantes du produit: {}", productId);
        return productVariantRepository.findByProductId(productId);
    }

    /**
     * Récupère une variante par son ID.
     */
    public ProductVariant getVariantById(Long id) {
        log.debug("Récupération de la variante: {}", id);
        return productVariantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variante non trouvée: " + id));
    }

    /**
     * Récupère une variante spécifique d'un produit.
     */
    public ProductVariant getVariantByAttributes(Long productId, String attribut, String valeur) {
        log.debug("Récupération de la variante: {} = {} pour le produit: {}", attribut, valeur, productId);
        return productVariantRepository.findByProductIdAndAttributAndValeur(productId, attribut, valeur)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Variante non trouvée: %s = %s pour le produit %d", attribut, valeur, productId)
                ));
    }

    /**
     * Récupère toutes les variantes d'un produit par type d'attribut.
     */
    public List<ProductVariant> getVariantsByAttribute(Long productId, String attribut) {
        log.debug("Récupération des variantes {} du produit: {}", attribut, productId);
        return productVariantRepository.findByProductIdAndAttribut(productId, attribut);
    }

    /**
     * Récupère les types d'attributs distincts pour un produit.
     */
    public List<String> getDistinctAttributes(Long productId) {
        log.debug("Récupération des types d'attributs du produit: {}", productId);
        return productVariantRepository.findDistinctAttributsByProductId(productId);
    }

    /**
     * Crée une nouvelle variante pour un produit.
     */
    @Transactional
    public ProductVariant createVariant(Long productId, String attribut, String valeur, Integer stockSupplementaire, Double prixDelta) {
        log.info("Création d'une variante pour le produit: {}", productId);

        // Vérifier que le produit existe
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé: " + productId));

        // Vérifier que cette variante n'existe pas déjà
        if (productVariantRepository.existsByProductIdAndAttributAndValeur(productId, attribut, valeur)) {
            throw new IllegalArgumentException(
                    String.format("Cette variante existe déjà: %s = %s", attribut, valeur)
            );
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .attribut(attribut)
                .valeur(valeur)
                .stockSupplementaire(stockSupplementaire != null ? stockSupplementaire : 0)
                .prixDelta(prixDelta != null ? prixDelta : 0.0)
                .build();

        ProductVariant saved = productVariantRepository.save(variant);
        log.info("Variante créée avec succès: {}", saved.getId());
        return saved;
    }

    /**
     * Met à jour une variante existante.
     */
    @Transactional
    public ProductVariant updateVariant(Long id, String attribut, String valeur, Integer stockSupplementaire, Double prixDelta) {
        log.info("Mise à jour de la variante: {}", id);

        ProductVariant variant = getVariantById(id);

        // Si on change l'attribut ou la valeur, vérifier que la nouvelle combinaison n'existe pas déjà
        if (!variant.getAttribut().equals(attribut) || !variant.getValeur().equals(valeur)) {
            if (productVariantRepository.existsByProductIdAndAttributAndValeur(
                    variant.getProduct().getId(), attribut, valeur)) {
                throw new IllegalArgumentException(
                        String.format("Cette variante existe déjà: %s = %s", attribut, valeur)
                );
            }
        }

        variant.setAttribut(attribut);
        variant.setValeur(valeur);
        variant.setStockSupplementaire(stockSupplementaire != null ? stockSupplementaire : 0);
        variant.setPrixDelta(prixDelta != null ? prixDelta : 0.0);

        ProductVariant updated = productVariantRepository.save(variant);
        log.info("Variante mise à jour avec succès: {}", id);
        return updated;
    }

    /**
     * Met à jour le stock d'une variante.
     */
    @Transactional
    public ProductVariant updateVariantStock(Long id, Integer stockSupplementaire) {
        log.info("Mise à jour du stock de la variante: {} -> {}", id, stockSupplementaire);

        ProductVariant variant = getVariantById(id);
        variant.setStockSupplementaire(stockSupplementaire);

        ProductVariant updated = productVariantRepository.save(variant);
        log.info("Stock de la variante mis à jour: {}", id);
        return updated;
    }

    /**
     * Supprime une variante.
     */
    @Transactional
    public void deleteVariant(Long id) {
        log.info("Suppression de la variante: {}", id);

        if (!productVariantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Variante non trouvée: " + id);
        }

        productVariantRepository.deleteById(id);
        log.info("Variante supprimée avec succès: {}", id);
    }

    /**
     * Supprime toutes les variantes d'un produit.
     */
    @Transactional
    public void deleteAllProductVariants(Long productId) {
        log.info("Suppression de toutes les variantes du produit: {}", productId);

        productVariantRepository.deleteByProductId(productId);
        log.info("Toutes les variantes du produit {} ont été supprimées", productId);
    }

    /**
     * Compte le nombre de variantes d'un produit.
     */
    public long countProductVariants(Long productId) {
        return productVariantRepository.countByProductId(productId);
    }

    /**
     * Vérifie si une variante existe.
     */
    public boolean variantExists(Long productId, String attribut, String valeur) {
        return productVariantRepository.existsByProductIdAndAttributAndValeur(productId, attribut, valeur);
    }

    /**
     * Calcule le prix final d'une variante (prix produit + delta).
     */
    public Double calculateVariantPrice(Long variantId) {
        ProductVariant variant = getVariantById(variantId);
        Product product = variant.getProduct();
        Double basePrice = product.getPrixEffectif(); // Prix avec promo si applicable
        return basePrice + variant.getPrixDelta();
    }

    /**
     * Calcule le stock total disponible pour une variante (stock produit + stock variante).
     */
    public Integer calculateTotalStock(Long variantId) {
        ProductVariant variant = getVariantById(variantId);
        Product product = variant.getProduct();
        return product.getStock() + variant.getStockSupplementaire();
    }
}
