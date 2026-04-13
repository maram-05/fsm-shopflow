package com.shopflow.dto.request;

import com.shopflow.entity.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO reçu lors de l'inscription d'un nouvel utilisateur.
 *
 * @Valid dans le Controller déclenche automatiquement
 * la validation de toutes ces annotations.
 */
@Data
public class RegisterRequest {

    @Email(message = "Format email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    /**
     * Mot de passe fort : au moins 8 caractères,
     * une majuscule, une minuscule, un chiffre.
     */
    @NotBlank
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
        message = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
    )
    private String motDePasse;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 80)
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 80)
    private String nom;

    /** CUSTOMER par défaut si non précisé */
    private Role role = Role.CUSTOMER;

    /** Requis si role = SELLER */
    private String nomBoutique;

    private String descriptionBoutique;
}