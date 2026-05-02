package com.shopflow.controller;

import com.shopflow.service.DashboardService;
import com.shopflow.util.AuthenticationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller REST pour les statistiques et le dashboard.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Récupère les statistiques globales (admin).
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        log.info("GET /api/dashboard/admin - Récupération des statistiques admin");
        Map<String, Object> stats = dashboardService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les statistiques du vendeur connecté.
     */
    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Map<String, Object>> getSellerStats(
            @RequestParam Long sellerId,
            Authentication authentication) {
        log.info("GET /api/dashboard/seller - Récupération des statistiques du vendeur: {}", sellerId);
        Map<String, Object> stats = dashboardService.getSellerStats(sellerId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les statistiques du client connecté.
     */
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getCustomerStats(Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("GET /api/dashboard/customer - Récupération des statistiques du client: {}", userId);
        Map<String, Object> stats = dashboardService.getCustomerStats(userId);
        return ResponseEntity.ok(stats);
    }
}
