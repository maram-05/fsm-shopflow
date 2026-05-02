package com.shopflow.controller;

import com.shopflow.dto.response.CategoryResponse;
import com.shopflow.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion des catégories.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Récupère toutes les catégories.
     * Accessible à tous.
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        log.info("GET /api/categories - Récupération de toutes les catégories");
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Récupère les catégories racines (sans parent).
     * Accessible à tous.
     */
    @GetMapping("/root")
    public ResponseEntity<List<CategoryResponse>> getRootCategories() {
        log.info("GET /api/categories/root - Récupération des catégories racines");
        List<CategoryResponse> categories = categoryService.getRootCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Récupère une catégorie par son ID.
     * Accessible à tous.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        log.info("GET /api/categories/{} - Récupération de la catégorie", id);
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    /**
     * Récupère les sous-catégories d'une catégorie.
     * Accessible à tous.
     */
    @GetMapping("/{id}/children")
    public ResponseEntity<List<CategoryResponse>> getSubCategories(@PathVariable Long id) {
        log.info("GET /api/categories/{}/children - Récupération des sous-catégories", id);
        List<CategoryResponse> subCategories = categoryService.getSubCategories(id);
        return ResponseEntity.ok(subCategories);
    }

    /**
     * Recherche des catégories par nom.
     * Accessible à tous.
     */
    @GetMapping("/search")
    public ResponseEntity<List<CategoryResponse>> searchCategories(@RequestParam String keyword) {
        log.info("GET /api/categories/search?keyword={} - Recherche de catégories", keyword);
        List<CategoryResponse> categories = categoryService.searchCategories(keyword);
        return ResponseEntity.ok(categories);
    }

    /**
     * Crée une nouvelle catégorie.
     * Réservé aux administrateurs.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestParam String nom,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long parentId) {
        log.info("POST /api/categories - Création d'une catégorie: {}", nom);
        CategoryResponse category = categoryService.createCategory(nom, description, parentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    /**
     * Met à jour une catégorie.
     * Réservé aux administrateurs.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestParam String nom,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long parentId) {
        log.info("PUT /api/categories/{} - Mise à jour de la catégorie", id);
        CategoryResponse category = categoryService.updateCategory(id, nom, description, parentId);
        return ResponseEntity.ok(category);
    }

    /**
     * Supprime une catégorie.
     * Réservé aux administrateurs.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        log.info("DELETE /api/categories/{} - Suppression de la catégorie", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
