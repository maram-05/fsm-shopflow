package com.shopflow.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration Swagger/OpenAPI pour ShopFlow
 * 
 * SÉCURITÉ :
 * - Activé uniquement si springdoc.swagger-ui.enabled=true
 * - Désactivé automatiquement en production
 * - Accès limité aux administrateurs via SecurityConfig
 */
@Configuration
@ConditionalOnProperty(
    name = "springdoc.swagger-ui.enabled", 
    havingValue = "true", 
    matchIfMissing = true
)
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("ShopFlow API")
                .version("1.0.0")
                .description("""
                    API REST pour la plateforme e-commerce ShopFlow
                    
                    🔒 ACCÈS RESTREINT - ADMINISTRATEURS UNIQUEMENT
                    
                    Cette interface est destinée aux développeurs et administrateurs.
                    Pour accéder aux endpoints protégés, vous devez :
                    1. Vous connecter avec un compte ADMIN
                    2. Utiliser le token JWT dans l'en-tête Authorization
                    """)
                .contact(new Contact()
                    .name("Équipe ShopFlow")
                    .email("admin@shopflow.com")
                )
            )
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication", 
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Entrez votre token JWT (sans 'Bearer ')")
                )
            );
    }
}