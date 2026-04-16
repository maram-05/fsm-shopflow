package com.shopflow.repository;

import com.shopflow.entity.User;
import com.shopflow.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité User.
 *
 * JpaRepository<User, Long> nous donne GRATUITEMENT :
 *   - save(user)         → INSERT ou UPDATE
 *   - findById(id)       → SELECT par ID
 *   - findAll()          → SELECT tous
 *   - delete(user)       → DELETE
 *   - count()            → COUNT(*)
 *   ... et bien d'autres
 *
 * On ajoute ici nos propres requêtes en suivant la convention de nommage
 * Spring Data : findBy + NomDuChamp + Condition
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Cherche un utilisateur par son email.
     * Spring génère automatiquement : SELECT * FROM users WHERE email = ?
     * Utilisé par Spring Security pour l'authentification.
     */
    Optional<User> findByEmail(String email);

    /**
     * Vérifie si un email existe déjà en base.
     * Utilisé lors de l'inscription pour éviter les doublons.
     */
    boolean existsByEmail(String email);

    /**
     * Trouve tous les utilisateurs avec un rôle donné.
     * Ex: findAllByRole(Role.SELLER) → tous les vendeurs
     */
    List<User> findAllByRole(Role role);

    /**
     * Trouve tous les utilisateurs actifs avec un rôle donné.
     * Spring génère : SELECT * FROM users WHERE role = ? AND actif = ?
     */
    List<User> findAllByRoleAndActif(Role role, Boolean actif);

    /**
     * Exemple de requête JPQL personnalisée.
     * JPQL utilise les noms des classes Java (User), pas des tables SQL (users).
     * Utile pour le dashboard ADMIN : compte les clients actifs.
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.actif = true")
    Long countActiveByRole(Role role);
}