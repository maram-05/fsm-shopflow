package com.shopflow.config;

import com.shopflow.entity.*;
import com.shopflow.entity.enums.CouponType;
import com.shopflow.entity.enums.Role;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Charge des données de test au démarrage de l'application.
 * Utile pour le développement et les tests.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("🚀 Chargement des données de test...");
            loadData();
            log.info("✅ Données de test chargées avec succès !");
        } else {
            log.info("ℹ️ Données déjà présentes, chargement ignoré.");
        }
    }

    private void loadData() {
        // 1. Créer les utilisateurs
        User admin = createUser("admin@shopflow.com", "Admin", "ShopFlow", "admin123", Role.ADMIN);
        User seller1 = createUser("seller1@shopflow.com", "Jean", "Dupont", "seller123", Role.SELLER);
        User seller2 = createUser("seller2@shopflow.com", "Marie", "Martin", "seller123", Role.SELLER);
        User customer1 = createUser("customer1@shopflow.com", "Pierre", "Durand", "customer123", Role.CUSTOMER);
        User customer2 = createUser("customer2@shopflow.com", "Sophie", "Bernard", "customer123", Role.CUSTOMER);

        log.info("✅ 5 utilisateurs créés");

        // 2. Créer les profils vendeurs
        SellerProfile profile1 = createSellerProfile(seller1, "Boutique Tech", "Spécialiste en électronique", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop");
        SellerProfile profile2 = createSellerProfile(seller2, "Mode & Style", "Vêtements tendance", "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=150&fit=crop");

        log.info("✅ 2 profils vendeurs créés");

        // 3. Créer les catégories
        Category electronique = createCategory("Électronique", "Produits électroniques et high-tech", null);
        Category vetements = createCategory("Vêtements", "Mode et accessoires", null);
        Category maison = createCategory("Maison", "Décoration et équipement", null);

        Category smartphones = createCategory("Smartphones", "Téléphones mobiles", electronique);
        Category ordinateurs = createCategory("Ordinateurs", "PC et laptops", electronique);
        Category hommes = createCategory("Hommes", "Mode masculine", vetements);
        Category femmes = createCategory("Femmes", "Mode féminine", vetements);

        log.info("✅ 7 catégories créées");

        // 4. Créer les produits
        List<Product> products = new ArrayList<>();

        // Produits électroniques
        products.add(createProduct(profile1, "iPhone 15 Pro", "Dernier iPhone avec puce A17", 1199.99, 999.99, 50, 
                List.of("https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop"), smartphones));
        products.add(createProduct(profile1, "Samsung Galaxy S24", "Flagship Samsung 2024", 899.99, null, 30, 
                List.of("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop"), smartphones));
        products.add(createProduct(profile1, "MacBook Pro M3", "Laptop professionnel Apple", 2499.99, 2299.99, 20, 
                List.of("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"), ordinateurs));
        products.add(createProduct(profile1, "Dell XPS 15", "Laptop haute performance", 1799.99, null, 15, 
                List.of("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"), ordinateurs));

        // Produits mode
        products.add(createProduct(profile2, "T-Shirt Premium", "T-shirt en coton bio", 29.99, 19.99, 100, 
                List.of("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"), hommes));
        products.add(createProduct(profile2, "Jean Slim Fit", "Jean confortable et stylé", 79.99, null, 80, 
                List.of("https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop"), hommes));
        products.add(createProduct(profile2, "Robe d'été", "Robe légère et élégante", 59.99, 49.99, 60, 
                List.of("https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop"), femmes));
        products.add(createProduct(profile2, "Veste en cuir", "Veste en cuir véritable", 199.99, null, 25, 
                List.of("https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"), femmes));

        // Produits maison
        products.add(createProduct(profile1, "Lampe LED", "Lampe de bureau moderne", 39.99, 29.99, 40, 
                List.of("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"), maison));
        products.add(createProduct(profile2, "Coussin déco", "Coussin confortable 45x45cm", 24.99, null, 70, 
                List.of("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"), maison));

        // Produits supplémentaires pour une meilleure vitrine
        products.add(createProduct(profile1, "Casque Audio Pro", "Casque sans fil haute qualité", 149.99, 119.99, 35, 
                List.of("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"), electronique));
        products.add(createProduct(profile1, "Montre Connectée", "Smartwatch avec GPS", 299.99, 249.99, 45, 
                List.of("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"), electronique));
        products.add(createProduct(profile2, "Sneakers Premium", "Chaussures de sport confortables", 89.99, 69.99, 60, 
                List.of("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop"), hommes));
        products.add(createProduct(profile2, "Sac à Main", "Sac élégant en cuir véritable", 129.99, null, 30, 
                List.of("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"), femmes));
        products.add(createProduct(profile1, "Plante Verte", "Monstera Deliciosa - Plante d'intérieur", 34.99, 24.99, 25, 
                List.of("https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=400&fit=crop"), maison));
        products.add(createProduct(profile2, "Bougie Parfumée", "Bougie artisanale vanille-coco", 19.99, 14.99, 80, 
                List.of("https://images.unsplash.com/photo-1602874801006-e26d3d17d0ed?w=400&h=400&fit=crop"), maison));

        log.info("✅ 16 produits créés");

        // 5. Créer les coupons
        createCoupon("BIENVENUE10", CouponType.PERCENT, 10.0, LocalDate.now().plusMonths(3), 100);
        createCoupon("PROMO20", CouponType.PERCENT, 20.0, LocalDate.now().plusMonths(1), 50);
        createCoupon("REDUC50", CouponType.FIXED, 50.0, LocalDate.now().plusMonths(2), 30);

        log.info("✅ 3 coupons créés");
    }

    private User createUser(String email, String prenom, String nom, String password, Role role) {
        User user = User.builder()
                .email(email)
                .prenom(prenom)
                .nom(nom)
                .motDePasse(passwordEncoder.encode(password))
                .role(role)
                .actif(true)
                .build();
        return userRepository.save(user);
    }

    private SellerProfile createSellerProfile(User user, String nomBoutique, String description, String logo) {
        SellerProfile profile = SellerProfile.builder()
                .user(user)
                .nomBoutique(nomBoutique)
                .description(description)
                .logo(logo)
                .note(4.5)
                .build();
        return sellerProfileRepository.save(profile);
    }

    private Category createCategory(String nom, String description, Category parent) {
        Category category = Category.builder()
                .nom(nom)
                .description(description)
                .parent(parent)
                .build();
        return categoryRepository.save(category);
    }

    private Product createProduct(SellerProfile seller, String nom, String description, 
                                  Double prix, Double prixPromo, Integer stock, 
                                  List<String> images, Category category) {
        Product product = Product.builder()
                .seller(seller)
                .nom(nom)
                .description(description)
                .prix(prix)
                .prixPromo(prixPromo)
                .stock(stock)
                .actif(true)
                .images(images)
                .build();
        
        product.getCategories().add(category);
        return productRepository.save(product);
    }

    private Coupon createCoupon(String code, CouponType type, Double valeur, 
                                LocalDate dateExpiration, Integer usagesMax) {
        Coupon coupon = Coupon.builder()
                .code(code)
                .type(type)
                .valeur(valeur)
                .dateExpiration(dateExpiration)
                .usagesMax(usagesMax)
                .usagesActuels(0)
                .actif(true)
                .build();
        return couponRepository.save(coupon);
    }
}
