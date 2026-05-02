package com.shopflow.service;

import com.shopflow.dto.response.UserResponse;
import com.shopflow.entity.User;
import com.shopflow.entity.enums.Role;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service de gestion des utilisateurs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Récupère tous les utilisateurs.
     */
    public List<UserResponse> getAllUsers() {
        log.debug("Récupération de tous les utilisateurs");
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un utilisateur par son ID.
     */
    public UserResponse getUserById(Long id) {
        log.debug("Récupération de l'utilisateur: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + id));
        return mapToResponse(user);
    }

    /**
     * Récupère un utilisateur par son email.
     */
    public UserResponse getUserByEmail(String email) {
        log.debug("Récupération de l'utilisateur: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + email));
        return mapToResponse(user);
    }

    /**
     * Récupère les utilisateurs par rôle.
     */
    public List<UserResponse> getUsersByRole(Role role) {
        log.debug("Récupération des utilisateurs avec le rôle: {}", role);
        return userRepository.findByRole(role).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère les utilisateurs actifs.
     */
    public List<UserResponse> getActiveUsers() {
        log.debug("Récupération des utilisateurs actifs");
        return userRepository.findByActifTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recherche des utilisateurs par nom ou prénom.
     */
    public List<UserResponse> searchUsers(String keyword) {
        log.debug("Recherche d'utilisateurs avec le mot-clé: {}", keyword);
        return userRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(keyword, keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Met à jour les informations d'un utilisateur.
     */
    @Transactional
    public UserResponse updateUser(Long id, String prenom, String nom, String email) {
        log.info("Mise à jour de l'utilisateur: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + id));

        // Vérifier que le nouvel email n'existe pas déjà (sauf si c'est le même)
        if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Cet email est déjà utilisé: " + email);
        }

        user.setPrenom(prenom);
        user.setNom(nom);
        user.setEmail(email);

        User updated = userRepository.save(user);
        log.info("Utilisateur mis à jour avec succès: {}", id);
        return mapToResponse(updated);
    }

    /**
     * Change le mot de passe d'un utilisateur.
     */
    @Transactional
    public void changePassword(Long id, String ancienMotDePasse, String nouveauMotDePasse) {
        log.info("Changement de mot de passe pour l'utilisateur: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + id));

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(ancienMotDePasse, user.getMotDePasse())) {
            throw new IllegalArgumentException("L'ancien mot de passe est incorrect");
        }

        // Valider le nouveau mot de passe
        if (nouveauMotDePasse == null || nouveauMotDePasse.length() < 6) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit contenir au moins 6 caractères");
        }

        user.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        userRepository.save(user);

        log.info("Mot de passe changé avec succès pour l'utilisateur: {}", id);
    }

    /**
     * Réinitialise le mot de passe d'un utilisateur (admin uniquement).
     */
    @Transactional
    public void resetPassword(Long id, String nouveauMotDePasse) {
        log.info("Réinitialisation du mot de passe pour l'utilisateur: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + id));

        // Valider le nouveau mot de passe
        if (nouveauMotDePasse == null || nouveauMotDePasse.length() < 6) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 6 caractères");
        }

        user.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        userRepository.save(user);

        log.info("Mot de passe réinitialisé avec succès pour l'utilisateur: {}", id);
    }

    /**
     * Active un utilisateur.
     */
    @Transactional
    public UserResponse activateUser(Long id) {
        log.info("Activation de l'utilisateur: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + id));

        user.setActif(true);
        User updated = userRepository.save(user);

        log.info("Utilisateur activé avec succès: {}", id);
        return mapToResponse(updated);
    }

    /**
     * Désactive un utilisateur.
     */
    @Transactional
    public UserResponse deactivateUser(Long id) {
        log.info("Désactivation de l'utilisateur: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + id));

        user.setActif(false);
        User updated = userRepository.save(user);

        log.info("Utilisateur désactivé avec succès: {}", id);
        return mapToResponse(updated);
    }

    /**
     * Change le rôle d'un utilisateur (admin uniquement).
     */
    @Transactional
    public UserResponse changeUserRole(Long id, Role newRole) {
        log.info("Changement de rôle pour l'utilisateur: {} -> {}", id, newRole);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + id));

        user.setRole(newRole);
        User updated = userRepository.save(user);

        log.info("Rôle de l'utilisateur changé avec succès: {}", id);
        return mapToResponse(updated);
    }

    /**
     * Supprime un utilisateur.
     * Attention : cela supprime aussi toutes ses données associées (cascade).
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("Suppression de l'utilisateur: {}", id);

        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur non trouvé: " + id);
        }

        userRepository.deleteById(id);
        log.info("Utilisateur supprimé avec succès: {}", id);
    }

    /**
     * Compte le nombre total d'utilisateurs.
     */
    public long countAllUsers() {
        return userRepository.count();
    }

    /**
     * Compte le nombre d'utilisateurs par rôle.
     */
    public long countUsersByRole(Role role) {
        return userRepository.countByRole(role);
    }

    /**
     * Compte le nombre d'utilisateurs actifs.
     */
    public long countActiveUsers() {
        return userRepository.countByActifTrue();
    }

    /**
     * Vérifie si un email existe déjà.
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // --- Méthodes utilitaires ---

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .prenom(user.getPrenom())
                .nom(user.getNom())
                .role(user.getRole())
                .actif(user.getActif())
                .dateCreation(user.getDateCreation())
                .build();
    }
}
