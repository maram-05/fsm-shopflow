package com.shopflow.controller;

import com.shopflow.dto.request.OrderRequest;
import com.shopflow.dto.response.OrderResponse;
import com.shopflow.entity.Order;
import com.shopflow.entity.enums.OrderStatus;
import com.shopflow.repository.OrderRepository;
import com.shopflow.service.OrderService;
import com.shopflow.util.AuthenticationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    /**
     * Récupère toutes les commandes de l'utilisateur connecté.
     */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("GET /api/orders - Récupération des commandes de l'utilisateur: {}", userId);
        List<Order> orders = orderService.getUserOrders(userId);
        
        // ✅ Convertir en DTO pour éviter les cycles JSON
        List<OrderResponse> response = orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère toutes les commandes (admin).
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        log.info("GET /api/orders/all - Récupération de toutes les commandes");
        List<Order> orders = orderRepository.findAll();
        
        // ✅ Convertir en DTO
        List<OrderResponse> response = orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère une commande par son ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("GET /api/orders/{} - Récupération de la commande", id);
        Order order = orderService.getOrderById(id, userId);
        
        // ✅ Convertir en DTO
        OrderResponse response = mapToResponse(order);
        return ResponseEntity.ok(response);
    }

    /**
     * Crée une nouvelle commande à partir du panier.
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("POST /api/orders - Création d'une commande pour l'utilisateur: {}", userId);
        Order order = orderService.createOrder(
                userId,
                request.getAddressId(),
                request.getCodeCoupon()
        );
        OrderResponse response = mapToResponse(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Méthode utilitaire de mapping
    private OrderResponse mapToResponse(Order order) {
        if (order == null) return null;
        
        return OrderResponse.builder()
                .id(order.getId())
                .numeroCommande(order.getNumeroCommande())
                .statut(order.getStatut())
                .sousTotal(order.getSousTotal())
                .fraisLivraison(order.getFraisLivraison())
                .totalTTC(order.getTotalTTC())
                .dateCommande(order.getDateCommande())
                .adresseLivraison(order.getAdresseLivraison())
                .build();
    }

    /**
     * Met à jour le statut d'une commande.
     * Réservé aux administrateurs et vendeurs.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        log.info("PUT /api/orders/{}/status - Mise à jour du statut: {}", id, status);
        Order order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }

    /**
     * Annule une commande.
     * Le client peut annuler sa propre commande si elle est en statut PENDING.
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("PUT /api/orders/{}/cancel - Annulation de la commande", id);
        Order order = orderService.cancelOrder(id, userId);
        return ResponseEntity.ok(order);
    }
}