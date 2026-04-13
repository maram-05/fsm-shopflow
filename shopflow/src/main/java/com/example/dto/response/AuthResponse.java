package com.shopflow.dto.response;

import lombok.Builder;
import lombok.Data;

/** Réponse renvoyée après une connexion réussie — contient les 2 tokens JWT */
@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;   // Toujours "Bearer"
    private UserResponse user;
}