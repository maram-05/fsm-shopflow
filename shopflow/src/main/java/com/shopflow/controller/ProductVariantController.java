package com.shopflow.controller;

import com.shopflow.entity.ProductVariant;
import com.shopflow.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion des variantes de produits.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ProductVariantController {

    private final ProductVariantService variantService;

    /**
     * Récupère toutes les variantes d'un produit.
     * Accessible à tous.
     */
    @GetMapping("/products/{productId}/variants")
    public ResponseEntity<List<ProductVariant>> getProductVariants(@PathVariable Long productId) {
        log.info("GET /api/products/{}/variants - Récupération des variantes", productId);
        List<ProductVariant> variants = variantService.getProductVariants(productId);
        return ResponseEntity.ok(variants);
    }

    /**
     * Récupère les variantes disponibles d'un produit (stock > 0).
     * Accessible à tous.
     */
    @GetMapping("/products/{productId}/variants/available")
    public ResponseEntity<List<ProductVariant>> getAvailableVariants(@PathVariable Long productId) {
        log.info("GET /api/products/{}/variants/available - Récupération des variantes disponibles", productId);
        List<ProductVariant> variants = variantService.getProductVariants(productId).stream()
                .filter(v -> v.getStockSupplementaire() > 0)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(variants);
    }

    /**
     * Récupère une variante par son ID.
     * Accessible à tous.
     */
    @GetMapping("/variants/{id}")
    public ResponseEntity<ProductVariant> getVariantById(@PathVariable Long id) {
        log.info("GET /api/variants/{} - Récupération de la variante", id);
        ProductVariant variant = variantService.getVariantById(id);
        return ResponseEntity.ok(variant);
    }

    /**
     * Recherche des variantes par attribut et valeur.
     * Accessible à tous.
     */
    @GetMapping("/products/{productId}/variants/search")
    public ResponseEntity<List<ProductVariant>> findVariants(
            @PathVariable Long productId,
            @RequestParam String attribut,
            @RequestParam String valeur) {
        log.info("GET /api/products/{}/variants/search - Recherche: {}={}", productId, attribut, valeur);
        List<ProductVariant> variants = variantService.getVariantsByAttribute(productId, attribut).stream()
                .filter(v -> v.getValeur().equalsIgnoreCase(valeur))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(variants);
    }

    /**
     * Crée une nouvelle variante pour un produit.
     * Réservé aux vendeurs.
     */
    @PostMapping("/products/{productId}/variants")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductVariant> createVariant(
            @PathVariable Long productId,
            @RequestParam String attribut,
            @RequestParam String valeur,
            @RequestParam(required = false, defaultValue = "0") Integer stockSupplementaire,
            @RequestParam(required = false, defaultValue = "0.0") Double prixDelta,
            Authentication authentication) {
        log.info("POST /api/products/{}/variants - Création d'une variante: {}={}", productId, attribut, valeur);
        ProductVariant variant = variantService.createVariant(
                productId,
                attribut,
                valeur,
                stockSupplementaire,
                prixDelta
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(variant);
    }

    /**
     * Met à jour une variante.
     * Le vendeur ne peut modifier que les variantes de ses propres produits.
     */
    @PutMapping("/variants/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductVariant> updateVariant(
            @PathVariable Long id,
            @RequestParam String attribut,
            @RequestParam String valeur,
            @RequestParam Integer stockSupplementaire,
            @RequestParam Double prixDelta,
            Authentication authentication) {
        log.info("PUT /api/variants/{} - Mise à jour de la variante", id);
        ProductVariant variant = variantService.updateVariant(
                id,
                attribut,
                valeur,
                stockSupplementaire,
                prixDelta
        );
        return ResponseEntity.ok(variant);
    }

    /**
     * Met à jour le stock d'une variante.
     * Le vendeur ne peut modifier que les variantes de ses propres produits.
     */
    @PutMapping("/variants/{id}/stock")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductVariant> updateVariantStock(
            @PathVariable Long id,
            @RequestParam Integer stock,
            Authentication authentication) {
        log.info("PUT /api/variants/{}/stock - Mise à jour du stock: {}", id, stock);
        ProductVariant variant = variantService.updateVariantStock(id, stock);
        return ResponseEntity.ok(variant);
    }

    /**
     * Supprime une variante.
     * Le vendeur ne peut supprimer que les variantes de ses propres produits.
     */
    @DeleteMapping("/variants/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteVariant(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("DELETE /api/variants/{} - Suppression de la variante", id);
        variantService.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }
}
