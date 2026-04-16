package com.shopflow.dto.response;

import com.shopflow.entity.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/** Réponse renvoyée après inscription ou pour le profil utilisateur */
@Data
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String prenom;
    private String nom;
    private Role role;
    private Boolean actif;
    private LocalDateTime dateCreation;
}