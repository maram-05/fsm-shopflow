package com.shopflow.controller;

import com.shopflow.dto.request.ReviewRequest;
import com.shopflow.entity.Review;
import com.shopflow.service.ReviewService;
import com.shopflow.util.AuthenticationUtil;
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
 * Controller REST pour la gestion des avis clients.
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Récupère tous les avis approuvés d'un produit.
     * Accessible à tous.
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        log.info("GET /api/reviews/product/{} - Récupération des avis du produit", productId);
        List<Review> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Récupère tous les avis d'un produit (admin).
     */
    @GetMapping("/product/{productId}/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Review>> getAllProductReviews(@PathVariable Long productId) {
        log.info("GET /api/reviews/product/{}/all - Récupération de tous les avis", productId);
        List<Review> reviews = reviewService.getAllProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Récupère les avis en attente de modération (admin).
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Review>> getPendingReviews() {
        log.info("GET /api/reviews/pending - Récupération des avis en attente");
        List<Review> reviews = reviewService.getPendingReviews();
        return ResponseEntity.ok(reviews);
    }

    /**
     * Crée un nouvel avis.
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Review> createReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("POST /api/reviews - Création d'un avis pour le produit: {}", request.getProductId());
        Review review = reviewService.createReview(
                userId,
                request.getProductId(),
                request.getNote(),
                request.getCommentaire()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    /**
     * Approuve un avis (admin).
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Review> approveReview(@PathVariable Long id) {
        log.info("PUT /api/reviews/{}/approve - Approbation de l'avis", id);
        Review review = reviewService.approveReview(id);
        return ResponseEntity.ok(review);
    }

    /**
     * Supprime un avis.
     * Le client peut supprimer son propre avis, l'admin peut supprimer n'importe quel avis.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("DELETE /api/reviews/{} - Suppression de l'avis", id);
        reviewService.deleteReview(id, userId);
        return ResponseEntity.noContent().build();
    }
}
