package com.shopflow;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée de l'application ShopFlow.
 *
 * @SpringBootApplication regroupe 3 annotations :
 *   - @Configuration        : cette classe peut définir des beans Spring
 *   - @EnableAutoConfiguration : Spring Boot configure automatiquement JPA, Security, etc.
 *   - @ComponentScan        : Spring cherche les @Service, @Repository, @Controller dans ce package
 */
@SpringBootApplication
public class ShopflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopflowApplication.class, args);
        System.out.println("===========================================");
        System.out.println("  ShopFlow démarré avec succès !");
        System.out.println("  API      : http://localhost:8080/api");
        System.out.println("  Swagger  : http://localhost:8080/swagger-ui");
        System.out.println("  H2 Console: http://localhost:8080/h2-console");
        System.out.println("===========================================");
    }
}