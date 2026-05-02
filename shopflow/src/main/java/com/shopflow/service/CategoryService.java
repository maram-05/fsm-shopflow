package com.shopflow.service;

import com.shopflow.dto.response.CategoryResponse;
import com.shopflow.entity.Category;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion des catégories de produits.
 * Supporte les catégories hiérarchiques (parent/enfant).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Récupère toutes les catégories.
     */
    public List<CategoryResponse> getAllCategories() {
        log.debug("Récupération de toutes les catégories");
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les catégories principales (sans parent).
     */
    public List<CategoryResponse> getRootCategories() {
        log.debug("Récupération des catégories principales");
        return categoryRepository.findByParentIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère une catégorie par son ID.
     */
    public CategoryResponse getCategoryById(Long id) {
        log.debug("Récupération de la catégorie avec l'ID: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée avec l'ID: " + id));
        return mapToResponse(category);
    }

    /**
     * Récupère une catégorie par son nom.
     */
    public CategoryResponse getCategoryByNom(String nom) {
        log.debug("Récupération de la catégorie: {}", nom);
        Category category = categoryRepository.findByNom(nom)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée: " + nom));
        return mapToResponse(category);
    }

    /**
     * Récupère les sous-catégories d'une catégorie.
     */
    public List<CategoryResponse> getSubCategories(Long parentId) {
        log.debug("Récupération des sous-catégories de la catégorie: {}", parentId);
        return categoryRepository.findByParentId(parentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Crée une nouvelle catégorie.
     */
    @Transactional
    public CategoryResponse createCategory(String nom, String description, Long parentId) {
        log.info("Création d'une nouvelle catégorie: {}", nom);

        // Vérifier si le nom existe déjà
        if (categoryRepository.existsByNom(nom)) {
            throw new IllegalArgumentException("Une catégorie avec ce nom existe déjà: " + nom);
        }

        Category category = Category.builder()
                .nom(nom)
                .description(description)
                .build();

        // Si un parent est spécifié, le récupérer
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie parente non trouvée: " + parentId));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        log.info("Catégorie créée avec succès: {}", saved.getId());
        return mapToResponse(saved);
    }

    /**
     * Met à jour une catégorie existante.
     */
    @Transactional
    public CategoryResponse updateCategory(Long id, String nom, String description, Long parentId) {
        log.info("Mise à jour de la catégorie: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée: " + id));

        // Vérifier si le nouveau nom existe déjà (sauf si c'est le même)
        if (!category.getNom().equals(nom) && categoryRepository.existsByNom(nom)) {
            throw new IllegalArgumentException("Une catégorie avec ce nom existe déjà: " + nom);
        }

        category.setNom(nom);
        category.setDescription(description);

        // Mettre à jour le parent si spécifié
        if (parentId != null) {
            // Vérifier qu'on ne crée pas une boucle (une catégorie ne peut pas être son propre parent)
            if (parentId.equals(id)) {
                throw new IllegalArgumentException("Une catégorie ne peut pas être son propre parent");
            }
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie parente non trouvée: " + parentId));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category updated = categoryRepository.save(category);
        log.info("Catégorie mise à jour avec succès: {}", id);
        return mapToResponse(updated);
    }

    /**
     * Supprime une catégorie.
     * Attention : supprime aussi toutes les sous-catégories (cascade).
     */
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Suppression de la catégorie: {}", id);

        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Catégorie non trouvée: " + id);
        }

        // Vérifier s'il y a des produits associés
        long productCount = categoryRepository.countProductsByCategoryId(id);
        if (productCount > 0) {
            throw new IllegalStateException(
                    "Impossible de supprimer la catégorie car elle contient " + productCount + " produit(s)"
            );
        }

        categoryRepository.deleteById(id);
        log.info("Catégorie supprimée avec succès: {}", id);
    }

    /**
     * Recherche des catégories par nom (contient).
     */
    public List<CategoryResponse> searchCategories(String keyword) {
        log.debug("Recherche de catégories avec le mot-clé: {}", keyword);
        return categoryRepository.findByNomContainingIgnoreCase(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- Méthodes utilitaires ---

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .nom(category.getNom())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentNom(category.getParent() != null ? category.getParent().getNom() : null)
                .nombreSousCategories(category.getSousCategories() != null ? category.getSousCategories().size() : 0)
                .build();
    }
}
