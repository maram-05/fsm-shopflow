package com.shopflow.controller;

import com.shopflow.dto.request.ProductRequest;
import com.shopflow.dto.response.ProductResponse;
import com.shopflow.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Controller REST pour la gestion des produits.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    /**
     * Récupère tous les produits actifs.
     * Accessible à tous.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllActiveProducts() {
        log.info("GET /api/products - Récupération de tous les produits actifs");
        List<ProductResponse> products = productService.getAllActiveProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Récupère tous les produits (admin).
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        log.info("GET /api/products/all - Récupération de tous les produits");
        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Récupère un produit par son ID.
     * Accessible à tous.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        log.info("GET /api/products/{} - Récupération du produit", id);
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    /**
     * Récupère les produits d'un vendeur.
     * Accessible à tous.
     */
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ProductResponse>> getProductsBySeller(@PathVariable Long sellerId) {
        log.info("GET /api/products/seller/{} - Récupération des produits du vendeur", sellerId);
        List<ProductResponse> products = productService.getProductsBySeller(sellerId);
        return ResponseEntity.ok(products);
    }

    /**
     * Récupère les produits d'une catégorie.
     * Accessible à tous.
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable Long categoryId) {
        log.info("GET /api/products/category/{} - Récupération des produits de la catégorie", categoryId);
        List<ProductResponse> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }

    /**
     * Recherche des produits par nom.
     * Accessible à tous.
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(@RequestParam String keyword) {
        log.info("GET /api/products/search?keyword={} - Recherche de produits", keyword);
        List<ProductResponse> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    /**
     * Récupère les produits en promotion.
     * Accessible à tous.
     */
    @GetMapping("/promotions")
    public ResponseEntity<List<ProductResponse>> getPromotionalProducts() {
        log.info("GET /api/products/promotions - Récupération des produits en promotion");
        List<ProductResponse> products = productService.getPromotionalProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Crée un nouveau produit.
     * Réservé aux vendeurs.
     */
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request,
            @RequestParam Long sellerId,
            Authentication authentication) {
        log.info("POST /api/products - Création d'un produit pour le vendeur: {}", sellerId);
        ProductResponse product = productService.createProduct(sellerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    /**
     * Met à jour un produit.
     * Le vendeur ne peut modifier que ses propres produits.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @RequestParam Long sellerId,
            Authentication authentication) {
        log.info("PUT /api/products/{} - Mise à jour du produit", id);
        ProductResponse product = productService.updateProduct(id, sellerId, request);
        return ResponseEntity.ok(product);
    }

    /**
     * Met à jour le stock d'un produit.
     * Le vendeur ne peut modifier que ses propres produits.
     */
    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable Long id,
            @RequestParam Integer stock,
            @RequestParam Long sellerId,
            Authentication authentication) {
        log.info("PUT /api/products/{}/stock - Mise à jour du stock: {}", id, stock);
        ProductResponse product = productService.updateStock(id, sellerId, stock);
        return ResponseEntity.ok(product);
    }

    /**
     * Active/désactive un produit.
     * Le vendeur ne peut modifier que ses propres produits.
     */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductResponse> toggleProductStatus(
            @PathVariable Long id,
            @RequestParam Long sellerId,
            Authentication authentication) {
        log.info("PUT /api/products/{}/toggle - Changement de statut du produit", id);
        ProductResponse product = productService.toggleProductStatus(id, sellerId);
        return ResponseEntity.ok(product);
    }

    /**
     * Supprime un produit.
     * Le vendeur ne peut supprimer que ses propres produits.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @RequestParam Long sellerId,
            Authentication authentication) {
        log.info("DELETE /api/products/{} - Suppression du produit", id);
        productService.deleteProduct(id, sellerId);
        return ResponseEntity.noContent().build();
    }
}
