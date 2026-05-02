package com.shopflow.controller;

import com.shopflow.dto.response.SellerProfileResponse;
import com.shopflow.entity.SellerProfile;
import com.shopflow.service.SellerProfileService;
import com.shopflow.util.AuthenticationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller REST pour la gestion des profils vendeurs.
 */
@RestController
@RequestMapping("/api/sellers")
@RequiredArgsConstructor
@Slf4j
public class SellerProfileController {

    private final SellerProfileService sellerProfileService;

    /**
     * Récupère tous les profils vendeurs.
     * Accessible à tous.
     */
    @GetMapping
    public ResponseEntity<List<SellerProfileResponse>> getAllSellers() {
        log.info("GET /api/sellers - Récupération de tous les vendeurs");
        List<SellerProfile> profiles = sellerProfileService.getAllSellerProfiles();
        List<SellerProfileResponse> sellers = profiles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sellers);
    }

    /**
     * Récupère les meilleurs vendeurs (classés par note).
     * Accessible à tous.
     */
    @GetMapping("/top")
    public ResponseEntity<List<SellerProfileResponse>> getTopSellers() {
        log.info("GET /api/sellers/top - Récupération des meilleurs vendeurs");
        List<SellerProfile> profiles = sellerProfileService.getTopRatedSellers();
        List<SellerProfileResponse> sellers = profiles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(sellers);
    }

    /**
     * Récupère un profil vendeur par son ID.
     * Accessible à tous.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SellerProfileResponse> getSellerById(@PathVariable Long id) {
        log.info("GET /api/sellers/{} - Récupération du vendeur", id);
        SellerProfile profile = sellerProfileService.getSellerProfileById(id);
        return ResponseEntity.ok(mapToResponse(profile));
    }

    /**
     * Récupère le profil vendeur d'un utilisateur.
     * Accessible à tous.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<SellerProfileResponse> getSellerByUserId(@PathVariable Long userId) {
        log.info("GET /api/sellers/user/{} - Récupération du profil vendeur", userId);
        SellerProfile profile = sellerProfileService.getSellerProfileByUserId(userId);
        return ResponseEntity.ok(mapToResponse(profile));
    }

    /**
     * Crée un profil vendeur.
     * L'utilisateur doit avoir le rôle SELLER.
     */
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerProfileResponse> createSellerProfile(
            @RequestParam String nomBoutique,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String logo,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("POST /api/sellers - Création d'un profil vendeur pour l'utilisateur: {}", userId);
        SellerProfile profile = sellerProfileService.createSellerProfile(userId, nomBoutique, description, logo);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(profile));
    }

    /**
     * Met à jour un profil vendeur.
     * Le vendeur ne peut modifier que son propre profil.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerProfileResponse> updateSellerProfile(
            @PathVariable Long id,
            @RequestParam String nomBoutique,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String logo,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("PUT /api/sellers/{} - Mise à jour du profil vendeur", id);
        SellerProfile profile = sellerProfileService.updateSellerProfile(id, userId, nomBoutique, description, logo);
        return ResponseEntity.ok(mapToResponse(profile));
    }

    /**
     * Supprime un profil vendeur (admin uniquement).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSellerProfile(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("DELETE /api/sellers/{} - Suppression du profil vendeur", id);
        sellerProfileService.deleteSellerProfile(id, userId);
        return ResponseEntity.noContent().build();
    }

    // --- Méthode utilitaire de mapping ---

    private SellerProfileResponse mapToResponse(SellerProfile profile) {
        return SellerProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .nomBoutique(profile.getNomBoutique())
                .description(profile.getDescription())
                .logo(profile.getLogo())
                .note(profile.getNote())
                .build();
    }
}
