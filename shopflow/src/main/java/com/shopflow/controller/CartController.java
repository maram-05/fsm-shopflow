package com.shopflow.controller;

import com.shopflow.dto.request.CartItemRequest;
import com.shopflow.dto.response.CartResponse;
import com.shopflow.entity.Cart;
import com.shopflow.service.CartService;
import com.shopflow.util.AuthenticationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * Controller REST pour la gestion du panier.
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    /**
     * Récupère le panier de l'utilisateur connecté.
     */
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> getMyCart(Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("GET /api/cart - Récupération du panier de l'utilisateur: {}", userId);
        CartResponse cart = cartService.getCart(userId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Ajoute un article au panier.
     */
    @PostMapping("/items")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> addItemToCart(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("POST /api/cart/items - Ajout d'un article au panier: produit={}, quantité={}",
                request.getProductId(), request.getQuantite());
        CartResponse cart = cartService.addToCart(
                userId,
                request.getProductId(),
                request.getVariantId(),
                request.getQuantite()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    /**
     * Met à jour la quantité d'un article dans le panier.
     */
    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long itemId,
            @RequestParam Integer quantite,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("PUT /api/cart/items/{} - Mise à jour de la quantité: {}", itemId, quantite);
        CartResponse cart = cartService.updateQuantity(userId, itemId, quantite);
        return ResponseEntity.ok(cart);
    }

    /**
     * Retire un article du panier.
     */
    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> removeCartItem(
            @PathVariable Long itemId,
            Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("DELETE /api/cart/items/{} - Retrait de l'article du panier", itemId);
        CartResponse cart = cartService.removeFromCart(userId, itemId);
        return ResponseEntity.ok(cart);
    }

    /**
     * Vide complètement le panier.
     */
    @DeleteMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        Long userId = AuthenticationUtil.getUserId(authentication);
        log.info("DELETE /api/cart - Vidage du panier de l'utilisateur: {}", userId);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
