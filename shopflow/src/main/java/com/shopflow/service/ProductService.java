package com.shopflow.service;

import com.shopflow.dto.request.ProductRequest;
import com.shopflow.dto.response.ProductResponse;
import com.shopflow.entity.Category;
import com.shopflow.entity.Product;
import com.shopflow.entity.SellerProfile;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.CategoryRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.SellerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service de gestion des produits.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Récupère tous les produits actifs.
     */
    public List<ProductResponse> getAllActiveProducts() {
        log.debug("Récupération de tous les produits actifs");
        return productRepository.findByActifTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère tous les produits (admin).
     */
    public List<ProductResponse> getAllProducts() {
        log.debug("Récupération de tous les produits");
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un produit par son ID.
     */
    public ProductResponse getProductById(Long id) {
        log.debug("Récupération du produit: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé: " + id));
        return mapToResponse(product);
    }

    /**
     * Récupère les produits d'un vendeur.
     */
    public List<ProductResponse> getProductsBySeller(Long sellerId) {
        log.debug("Récupération des produits du vendeur: {}", sellerId);
        return productRepository.findBySellerIdAndActifTrue(sellerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les produits d'une catégorie.
     */
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        log.debug("Récupération des produits de la catégorie: {}", categoryId);
        return productRepository.findByCategoriesIdAndActifTrue(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recherche des produits par nom.
     */
    public List<ProductResponse> searchProducts(String keyword) {
        log.debug("Recherche de produits avec le mot-clé: {}", keyword);
        return productRepository.findByNomContainingIgnoreCaseAndActifTrue(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les produits en promotion.
     */
    public List<ProductResponse> getPromotionalProducts() {
        log.debug("Récupération des produits en promotion");
        return productRepository.findByPrixPromoIsNotNullAndActifTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Crée un nouveau produit.
     */
    @Transactional
    public ProductResponse createProduct(Long sellerId, ProductRequest request) {
        log.info("Création d'un produit pour le vendeur: {}", sellerId);

        SellerProfile seller = sellerProfileRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendeur non trouvé: " + sellerId));

        Product product = Product.builder()
                .seller(seller)
                .nom(request.getNom())
                .description(request.getDescription())
                .prix(request.getPrix())
                .prixPromo(request.getPrixPromo())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .actif(true)
                .images(request.getImages() != null ? request.getImages() : List.of())
                .categories(new HashSet<>())
                .build();

        // Ajouter les catégories
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            Set<Category> categories = request.getCategoryIds().stream()
                    .map(categoryId -> categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée: " + categoryId)))
                    .collect(Collectors.toSet());
            product.setCategories(categories);
        }

        Product saved = productRepository.save(product);
        log.info("Produit créé avec succès: {}", saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Met à jour un produit.
     */
    @Transactional
    public ProductResponse updateProduct(Long id, Long sellerId, ProductRequest request) {
        log.info("Mise à jour du produit: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé: " + id));

        // Vérifier que le produit appartient au vendeur
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Ce produit n'appartient pas à ce vendeur");
        }

        product.setNom(request.getNom());
        product.setDescription(request.getDescription());
        product.setPrix(request.getPrix());
        product.setPrixPromo(request.getPrixPromo());
        product.setStock(request.getStock());

        // Mettre à jour les images
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }

        // Mettre à jour les catégories
        if (request.getCategoryIds() != null) {
            Set<Category> categories = request.getCategoryIds().stream()
                    .map(categoryId -> categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée: " + categoryId)))
                    .collect(Collectors.toSet());
            product.setCategories(categories);
        }

        Product updated = productRepository.save(product);
        log.info("Produit mis à jour avec succès: {}", id);
        return mapToResponse(updated);
    }

    /**
     * Met à jour le stock d'un produit.
     */
    @Transactional
    public ProductResponse updateStock(Long id, Long sellerId, Integer newStock) {
        log.info("Mise à jour du stock du produit: {} -> {}", id, newStock);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé: " + id));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Ce produit n'appartient pas à ce vendeur");
        }

        product.setStock(newStock);
        Product updated = productRepository.save(product);
        log.info("Stock mis à jour: {}", id);
        return mapToResponse(updated);
    }

    /**
     * Active/désactive un produit.
     */
    @Transactional
    public ProductResponse toggleProductStatus(Long id, Long sellerId) {
        log.info("Changement de statut du produit: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé: " + id));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Ce produit n'appartient pas à ce vendeur");
        }

        product.setActif(!product.getActif());
        Product updated = productRepository.save(product);
        log.info("Statut du produit changé: {} -> {}", id, updated.getActif());
        return mapToResponse(updated);
    }

    /**
     * Supprime un produit.
     */
    @Transactional
    public void deleteProduct(Long id, Long sellerId) {
        log.info("Suppression du produit: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé: " + id));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new IllegalArgumentException("Ce produit n'appartient pas à ce vendeur");
        }

        productRepository.deleteById(id);
        log.info("Produit supprimé avec succès: {}", id);
    }

    /**
     * Vérifie si un produit appartient à un vendeur.
     */
    public boolean isOwner(Long productId, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé: " + productId));
        return product.getSeller().getId().equals(sellerId);
    }

    // --- Méthodes utilitaires ---

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .nom(product.getNom())
                .description(product.getDescription())
                .prix(product.getPrix())
                .prixPromo(product.getPrixPromo())
                .prixEffectif(product.getPrixEffectif())
                .stock(product.getStock())
                .actif(product.getActif())
                .images(product.getImages())
                .sellerId(product.getSeller().getId())
                .sellerNom(product.getSeller().getNomBoutique())
                .dateCreation(product.getDateCreation())
                .enPromotion(product.isEnPromotion())
                .pourcentageRemise(product.getPourcentageRemise())
                .build();
    }
}
