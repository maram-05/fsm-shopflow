package com.shopflow.controller;

import com.shopflow.dto.response.UserResponse;
import com.shopflow.entity.User;
import com.shopflow.entity.enums.Role;
import com.shopflow.service.UserService;
import com.shopflow.util.AuthenticationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour la gestion des utilisateurs.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * Récupère tous les utilisateurs (admin).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("GET /api/users - Récupération de tous les utilisateurs");
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Récupère les utilisateurs actifs (admin).
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {
        log.info("GET /api/users/active - Récupération des utilisateurs actifs");
        List<UserResponse> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Récupère les utilisateurs par rôle (admin).
     */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable Role role) {
        log.info("GET /api/users/role/{} - Récupération des utilisateurs par rôle", role);
        List<UserResponse> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    /**
     * Récupère un utilisateur par son ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        log.info("GET /api/users/{} - Récupération de l'utilisateur", id);
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Récupère le profil de l'utilisateur connecté.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("GET /api/users/me - Récupération du profil de l'utilisateur: {}", userId);
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    /**
     * Recherche des utilisateurs par nom ou prénom (admin).
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String keyword) {
        log.info("GET /api/users/search?keyword={} - Recherche d'utilisateurs", keyword);
        List<UserResponse> users = userService.searchUsers(keyword);
        return ResponseEntity.ok(users);
    }

    /**
     * Met à jour les informations d'un utilisateur.
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String prenom,
            @RequestParam(required = false) String telephone,
            Authentication authentication) {
        Long currentUserId = AuthenticationUtil.getUserId(authentication);
        
        // Un utilisateur ne peut modifier que son propre profil (sauf admin)
        if (!currentUserId.equals(id)) {
            log.warn("Tentative de modification du profil d'un autre utilisateur");
            return ResponseEntity.status(403).build();
        }
        
        log.info("PUT /api/users/{} - Mise à jour de l'utilisateur", id);
        UserResponse user = userService.updateUser(id, nom, prenom, telephone);
        return ResponseEntity.ok(user);
    }

    /**
     * Change le mot de passe d'un utilisateur.
     */
    @PutMapping("/{id}/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword,
            Authentication authentication) {
        Long currentUserId = AuthenticationUtil.getUserId(authentication);
        
        // Un utilisateur ne peut changer que son propre mot de passe
        if (!currentUserId.equals(id)) {
            log.warn("Tentative de changement du mot de passe d'un autre utilisateur");
            return ResponseEntity.status(403).build();
        }
        
        log.info("PUT /api/users/{}/password - Changement de mot de passe", id);
        userService.changePassword(id, oldPassword, newPassword);
        return ResponseEntity.noContent().build();
    }

    /**
     * Change le rôle d'un utilisateur (admin).
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> changeUserRole(
            @PathVariable Long id,
            @RequestParam Role newRole) {
        log.info("PUT /api/users/{}/role - Changement de rôle: {}", id, newRole);
        UserResponse user = userService.changeUserRole(id, newRole);
        return ResponseEntity.ok(user);
    }

    /**
     * Active/désactive un utilisateur (admin).
     */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long id) {
        log.info("PUT /api/users/{}/toggle - Changement de statut de l'utilisateur", id);
        
        // Récupérer l'utilisateur pour vérifier son statut actuel
        UserResponse user = userService.getUserById(id);
        
        // Toggle le statut
        UserResponse updated;
        if (user.getActif()) {
            updated = userService.deactivateUser(id);
        } else {
            updated = userService.activateUser(id);
        }
        
        return ResponseEntity.ok(updated);
    }

    /**
     * Supprime un utilisateur (admin).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("DELETE /api/users/{} - Suppression de l'utilisateur", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
