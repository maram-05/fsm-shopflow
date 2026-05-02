package com.shopflow.util;

import com.shopflow.entity.User;
import org.springframework.security.core.Authentication;

/**
 * Utilitaire pour extraire les informations d'authentification.
 */
public class AuthenticationUtil {

    /**
     * Extrait l'ID de l'utilisateur depuis l'objet Authentication.
     * 
     * @param authentication L'objet Authentication de Spring Security
     * @return L'ID de l'utilisateur connecté
     * @throws ClassCastException si le principal n'est pas un User
     */
    public static Long getUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication ou principal est null");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getId();
        }
        
        throw new ClassCastException("Le principal n'est pas une instance de User");
    }

    /**
     * Extrait l'email de l'utilisateur depuis l'objet Authentication.
     * 
     * @param authentication L'objet Authentication de Spring Security
     * @return L'email de l'utilisateur connecté
     */
    public static String getUserEmail(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalArgumentException("Authentication est null");
        }
        return authentication.getName();
    }

    /**
     * Extrait l'objet User complet depuis l'objet Authentication.
     * 
     * @param authentication L'objet Authentication de Spring Security
     * @return L'utilisateur connecté
     * @throws ClassCastException si le principal n'est pas un User
     */
    public static User getUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalArgumentException("Authentication ou principal est null");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        
        throw new ClassCastException("Le principal n'est pas une instance de User");
    }
}
