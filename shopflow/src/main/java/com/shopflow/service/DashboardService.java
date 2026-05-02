package com.shopflow.service;

import com.shopflow.entity.Order;
import com.shopflow.entity.enums.OrderStatus;
import com.shopflow.entity.enums.Role;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * Service pour les statistiques et le dashboard.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Statistiques globales (admin).
     */
    public Map<String, Object> getAdminStats() {
        log.debug("Récupération des statistiques admin");

        Map<String, Object> stats = new HashMap<>();

        // Utilisateurs
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCustomers", userRepository.countByRole(Role.CUSTOMER));
        stats.put("totalSellers", userRepository.countByRole(Role.SELLER));
        stats.put("activeUsers", userRepository.countByActifTrue());

        // Produits
        stats.put("totalProducts", productRepository.count());
        stats.put("activeProducts", productRepository.countByActifTrue());

        // Commandes
        stats.put("totalOrders", orderRepository.count());
        stats.put("pendingOrders", orderRepository.countByStatut(OrderStatus.PENDING));
        stats.put("completedOrders", orderRepository.countByStatut(OrderStatus.DELIVERED));

        // Avis
        stats.put("totalReviews", reviewRepository.count());
        stats.put("pendingReviews", reviewRepository.countByApprouveFalse());

        // Chiffre d'affaires total
        Double totalRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatut() == OrderStatus.DELIVERED)
                .mapToDouble(Order::getTotalTTC)
                .sum();
        stats.put("totalRevenue", totalRevenue);

        return stats;
    }

    /**
     * Statistiques vendeur.
     */
    public Map<String, Object> getSellerStats(Long sellerId) {
        log.debug("Récupération des statistiques du vendeur: {}", sellerId);

        Map<String, Object> stats = new HashMap<>();

        // Produits
        long totalProducts = productRepository.countBySellerId(sellerId);
        long activeProducts = productRepository.countBySellerIdAndActifTrue(sellerId);
        stats.put("totalProducts", totalProducts);
        stats.put("activeProducts", activeProducts);

        // Ventes
        Integer totalSales = orderItemRepository.sumQuantiteByProductSellerId(sellerId);
        Double totalRevenue = orderItemRepository.sumRevenueByProductSellerId(sellerId);
        stats.put("totalSales", totalSales != null ? totalSales : 0);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        return stats;
    }

    /**
     * Statistiques client.
     */
    public Map<String, Object> getCustomerStats(Long userId) {
        log.debug("Récupération des statistiques du client: {}", userId);

        Map<String, Object> stats = new HashMap<>();

        // Commandes
        long totalOrders = orderRepository.countByCustomerId(userId);
        stats.put("totalOrders", totalOrders);

        // Montant total dépensé
        Double totalSpent = orderRepository.findByCustomerId(userId).stream()
                .filter(order -> order.getStatut() == OrderStatus.DELIVERED)
                .mapToDouble(Order::getTotalTTC)
                .sum();
        stats.put("totalSpent", totalSpent);

        // Avis laissés
        long totalReviews = reviewRepository.countByCustomerId(userId);
        stats.put("totalReviews", totalReviews);

        return stats;
    }
}
