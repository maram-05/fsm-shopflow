package com.shopflow.service;

import com.shopflow.entity.SellerProfile;
import com.shopflow.entity.User;
import com.shopflow.entity.enums.Role;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.SellerProfileRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service de gestion des profils vendeurs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;

    /**
     * Récupère tous les profils vendeurs.
     */
    public List<SellerProfile> getAllSellerProfiles() {
        log.debug("Récupération de tous les profils vendeurs");
        return sellerProfileRepository.findAll();
    }

    /**
     * Récupère un profil vendeur par son ID.
     */
    public SellerProfile getSellerProfileById(Long id) {
        log.debug("Récupération du profil vendeur: {}", id);
        return sellerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profil vendeur non trouvé: " + id));
    }

    /**
     * Récupère un profil vendeur par l'ID de l'utilisateur.
     */
    public SellerProfile getSellerProfileByUserId(Long userId) {
        log.debug("Récupération du profil vendeur de l'utilisateur: {}", userId);
        return sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profil vendeur non trouvé pour l'utilisateur: " + userId));
    }

    /**
     * Récupère un profil vendeur par le nom de la boutique.
     */
    public SellerProfile getSellerProfileByNomBoutique(String nomBoutique) {
        log.debug("Récupération du profil vendeur: {}", nomBoutique);
        return sellerProfileRepository.findByNomBoutique(nomBoutique)
                .orElseThrow(() -> new ResourceNotFoundException("Boutique non trouvée: " + nomBoutique));
    }

    /**
     * Récupère les vendeurs les mieux notés.
     */
    public List<SellerProfile> getTopRatedSellers() {
        log.debug("Récupération des vendeurs les mieux notés");
        return sellerProfileRepository.findTopRatedSellers();
    }

    /**
     * Récupère les vendeurs avec une note minimale.
     */
    public List<SellerProfile> getSellersByMinRating(Double minNote) {
        log.debug("Récupération des vendeurs avec note >= {}", minNote);
        return sellerProfileRepository.findByNoteGreaterThanEqual(minNote);
    }

    /**
     * Crée un profil vendeur pour un utilisateur existant.
     */
    @Transactional
    public SellerProfile createSellerProfile(Long userId, String nomBoutique, String description, String logo) {
        log.info("Création d'un profil vendeur pour l'utilisateur: {}", userId);

        // Vérifier que l'utilisateur existe
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + userId));

        // Vérifier que l'utilisateur est un vendeur
        if (user.getRole() != Role.SELLER) {
            throw new IllegalArgumentException("L'utilisateur doit avoir le rôle SELLER");
        }

        // Vérifier qu'il n'a pas déjà un profil vendeur
        if (sellerProfileRepository.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("Cet utilisateur a déjà un profil vendeur");
        }

        // Vérifier que le nom de boutique n'existe pas déjà
        if (sellerProfileRepository.existsByNomBoutique(nomBoutique)) {
            throw new IllegalArgumentException("Ce nom de boutique existe déjà: " + nomBoutique);
        }

        SellerProfile sellerProfile = SellerProfile.builder()
                .user(user)
                .nomBoutique(nomBoutique)
                .description(description)
                .logo(logo)
                .note(0.0)
                .build();

        SellerProfile saved = sellerProfileRepository.save(sellerProfile);
        log.info("Profil vendeur créé avec succès: {}", saved.getId());
        return saved;
    }

    /**
     * Met à jour un profil vendeur.
     */
    @Transactional
    public SellerProfile updateSellerProfile(Long id, Long userId, String nomBoutique, String description, String logo) {
        log.info("Mise à jour du profil vendeur: {}", id);

        SellerProfile sellerProfile = getSellerProfileById(id);

        // Vérifier que le profil appartient bien à l'utilisateur
        if (!sellerProfile.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Ce profil vendeur n'appartient pas à l'utilisateur");
        }

        // Vérifier que le nouveau nom de boutique n'existe pas déjà (sauf si c'est le même)
        if (!sellerProfile.getNomBoutique().equals(nomBoutique) &&
                sellerProfileRepository.existsByNomBoutique(nomBoutique)) {
            throw new IllegalArgumentException("Ce nom de boutique existe déjà: " + nomBoutique);
        }

        sellerProfile.setNomBoutique(nomBoutique);
        sellerProfile.setDescription(description);
        sellerProfile.setLogo(logo);

        SellerProfile updated = sellerProfileRepository.save(sellerProfile);
        log.info("Profil vendeur mis à jour avec succès: {}", id);
        return updated;
    }

    /**
     * Met à jour la note d'un vendeur.
     * Cette méthode est appelée automatiquement lors de l'ajout/modification d'avis.
     */
    @Transactional
    public void updateSellerRating(Long sellerId, Double newRating) {
        log.info("Mise à jour de la note du vendeur: {} -> {}", sellerId, newRating);

        SellerProfile sellerProfile = getSellerProfileById(sellerId);
        sellerProfile.setNote(newRating);
        sellerProfileRepository.save(sellerProfile);

        log.info("Note du vendeur mise à jour: {}", sellerId);
    }

    /**
     * Supprime un profil vendeur.
     * Attention : cela ne supprime pas l'utilisateur, seulement son profil vendeur.
     */
    @Transactional
    public void deleteSellerProfile(Long id, Long userId) {
        log.info("Suppression du profil vendeur: {}", id);

        SellerProfile sellerProfile = getSellerProfileById(id);

        // Vérifier que le profil appartient bien à l'utilisateur
        if (!sellerProfile.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Ce profil vendeur n'appartient pas à l'utilisateur");
        }

        // Vérifier qu'il n'y a pas de produits associés
        // Cette vérification sera faite via le ProductRepository dans une version complète

        sellerProfileRepository.deleteById(id);
        log.info("Profil vendeur supprimé avec succès: {}", id);
    }

    /**
     * Vérifie si un utilisateur est propriétaire d'un profil vendeur.
     */
    public boolean isOwner(Long sellerId, Long userId) {
        SellerProfile sellerProfile = getSellerProfileById(sellerId);
        return sellerProfile.getUser().getId().equals(userId);
    }
}
