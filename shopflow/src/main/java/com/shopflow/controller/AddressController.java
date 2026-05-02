package com.shopflow.controller;

import com.shopflow.dto.request.AddressRequest;
import com.shopflow.dto.response.AddressResponse;
import com.shopflow.entity.Address;
import com.shopflow.service.AddressService;
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
import java.util.stream.Collectors;

/**
 * Controller REST pour la gestion des adresses de livraison.
 */
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Slf4j
public class AddressController {

    private final AddressService addressService;

    /**
     * Récupère toutes les adresses de l'utilisateur connecté.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AddressResponse>> getMyAddresses(Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("GET /api/addresses - Récupération des adresses de l'utilisateur: {}", userId);
        List<Address> addresses = addressService.getUserAddresses(userId);
        List<AddressResponse> responses = addresses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * Récupère une adresse par son ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressResponse> getAddressById(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("GET /api/addresses/{} - Récupération de l'adresse", id);
        Address address = addressService.getAddressById(id, userId);
        return ResponseEntity.ok(mapToResponse(address));
    }

    /**
     * Récupère l'adresse principale de l'utilisateur.
     */
    @GetMapping("/principal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressResponse> getPrincipalAddress(Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("GET /api/addresses/principal - Récupération de l'adresse principale");
        Address address = addressService.getPrincipalAddress(userId);
        return ResponseEntity.ok(mapToResponse(address));
    }

    /**
     * Crée une nouvelle adresse.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressResponse> createAddress(
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("POST /api/addresses - Création d'une adresse pour l'utilisateur: {}", userId);
        Address address = addressService.createAddress(
                userId, 
                request.getRue(), 
                request.getVille(), 
                request.getCodePostal(), 
                request.getPays(), 
                request.getPrincipal() != null ? request.getPrincipal() : false
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(address));
    }

    /**
     * Met à jour une adresse.
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @RequestParam String rue,
            @RequestParam String ville,
            @RequestParam String codePostal,
            @RequestParam String pays,
            @RequestParam(required = false, defaultValue = "false") Boolean principal,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("PUT /api/addresses/{} - Mise à jour de l'adresse", id);
        Address address = addressService.updateAddress(id, userId, rue, ville, codePostal, pays, principal);
        return ResponseEntity.ok(mapToResponse(address));
    }

    /**
     * Définit une adresse comme principale.
     */
    @PutMapping("/{id}/principal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AddressResponse> setPrincipalAddress(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("PUT /api/addresses/{}/principal - Définition de l'adresse principale", id);
        Address address = addressService.setPrincipalAddress(id, userId);
        return ResponseEntity.ok(mapToResponse(address));
    }

    /**
     * Supprime une adresse.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("DELETE /api/addresses/{} - Suppression de l'adresse", id);
        addressService.deleteAddress(id, userId);
        return ResponseEntity.noContent().build();
    }

    // --- Méthode utilitaire de mapping ---

    private AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .rue(address.getRue())
                .ville(address.getVille())
                .codePostal(address.getCodePostal())
                .pays(address.getPays())
                .principal(address.getPrincipal())
                .build();
    }
}
