package com.shopflow.service;

import com.shopflow.entity.Product;
import com.shopflow.entity.Review;
import com.shopflow.entity.User;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ReviewRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service de gestion des avis clients.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Récupère tous les avis d'un produit (approuvés uniquement).
     */
    public List<Review> getProductReviews(Long productId) {
        log.debug("Récupération des avis du produit: {}", productId);
        return reviewRepository.findByProductIdAndApprouveTrue(productId);
    }

    /**
     * Récupère tous les avis d'un produit (admin).
     */
    public List<Review> getAllProductReviews(Long productId) {
        log.debug("Récupération de tous les avis du produit: {}", productId);
        return reviewRepository.findByProductId(productId);
    }

    /**
     * Récupère les avis en attente de modération.
     */
    public List<Review> getPendingReviews() {
        log.debug("Récupération des avis en attente");
        return reviewRepository.findByApprouveFalse();
    }

    /**
     * Crée un avis.
     */
    @Transactional
    public Review createReview(Long userId, Long productId, Integer note, String commentaire) {
        log.info("Création d'un avis pour le produit: {}", productId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé: " + productId));

        // Vérifier si l'utilisateur a déjà laissé un avis
        if (reviewRepository.existsByCustomerIdAndProductId(userId, productId)) {
            throw new IllegalStateException("Vous avez déjà laissé un avis pour ce produit");
        }

        Review review = Review.builder()
                .customer(user)
                .product(product)
                .note(note)
                .commentaire(commentaire)
                .approuve(false)
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Avis créé avec succès: {}", saved.getId());
        return saved;
    }

    /**
     * Approuve un avis (admin).
     */
    @Transactional
    public Review approveReview(Long id) {
        log.info("Approbation de l'avis: {}", id);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis non trouvé: " + id));

        review.setApprouve(true);
        Review updated = reviewRepository.save(review);
        log.info("Avis approuvé: {}", id);
        return updated;
    }

    /**
     * Supprime un avis.
     */
    @Transactional
    public void deleteReview(Long id, Long userId) {
        log.info("Suppression de l'avis: {}", id);

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis non trouvé: " + id));

        if (!review.getCustomer().getId().equals(userId)) {
            throw new IllegalArgumentException("Cet avis ne vous appartient pas");
        }

        reviewRepository.deleteById(id);
        log.info("Avis supprimé: {}", id);
    }
}
