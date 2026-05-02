package com.shopflow.service;

import com.shopflow.dto.response.CartResponse;
import com.shopflow.entity.Cart;
import com.shopflow.entity.CartItem;
import com.shopflow.entity.Product;
import com.shopflow.entity.ProductVariant;
import com.shopflow.entity.User;
import com.shopflow.exception.InsufficientStockException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.exception.UnauthorizedOperationException;
import com.shopflow.repository.CartItemRepository;
import com.shopflow.repository.CartRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ProductVariantRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service de gestion du panier.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    /**
     * Récupère le panier d'un utilisateur.
     */
    public CartResponse getCart(Long userId) {
        log.debug("Récupération du panier de l'utilisateur: {}", userId);
        Cart cart = getOrCreateCart(userId);
        return mapToResponse(cart);
    }

    /**
     * Ajoute un produit au panier.
     */
    @Transactional
    public CartResponse addToCart(Long userId, Long productId, Long variantId, Integer quantite) {
        log.info("Ajout au panier: produit={}, quantité={}", productId, quantite);

        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit non trouvé: " + productId));

        // Vérifier le stock
        if (product.getStock() < quantite) {
            throw new InsufficientStockException(productId, quantite, product.getStock());
        }

        ProductVariant variant = null;
        if (variantId != null) {
            variant = productVariantRepository.findById(variantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Variante non trouvée: " + variantId));
        }

        // Vérifier si le produit est déjà dans le panier
        CartItem existingItem;
        if (variantId != null) {
            existingItem = cartItemRepository.findByCartIdAndProductIdAndVariantId(cart.getId(), productId, variantId).orElse(null);
        } else {
            existingItem = cartItemRepository.findByCartIdAndProductIdAndVariantIsNull(cart.getId(), productId).orElse(null);
        }

        if (existingItem != null) {
            existingItem.setQuantite(existingItem.getQuantite() + quantite);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .quantite(quantite)
                    .build();
            cartItemRepository.save(newItem);
        }

        log.info("Produit ajouté au panier");
        return mapToResponse(cart);
    }

    /**
     * Met à jour la quantité d'un article.
     */
    @Transactional
    public CartResponse updateQuantity(Long userId, Long cartItemId, Integer newQuantite) {
        log.info("Mise à jour de la quantité: item={}, quantité={}", cartItemId, newQuantite);

        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Article non trouvé: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cet article n'appartient pas à ce panier");
        }

        if (newQuantite <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantite(newQuantite);
            cartItemRepository.save(item);
        }

        return mapToResponse(cart);
    }

    /**
     * Retire un article du panier.
     */
    @Transactional
    public CartResponse removeFromCart(Long userId, Long cartItemId) {
        log.info("Retrait du panier: item={}", cartItemId);

        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Article non trouvé: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cet article n'appartient pas à ce panier");
        }

        cartItemRepository.delete(item);
        log.info("Article retiré du panier");
        return mapToResponse(cart);
    }

    /**
     * Vide le panier.
     */
    @Transactional
    public void clearCart(Long userId) {
        log.info("Vidage du panier de l'utilisateur: {}", userId);
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        log.info("Panier vidé");
    }

    // --- Méthodes utilitaires ---

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByCustomerId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + userId));
                    Cart newCart = Cart.builder()
                            .customer(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse mapToResponse(Cart cart) {
        return CartResponse.builder()
                .id(cart.getId())
                .customerId(cart.getCustomer().getId())
                .total(cart.calculerTotal())
                .nombreArticles(cart.getLignes().size())
                .dateModification(cart.getDateModification())
                .items(cart.getLignes().stream()
                        .map(this::mapItemToResponse)
                        .toList())
                .build();
    }

    private com.shopflow.dto.response.CartItemResponse mapItemToResponse(CartItem item) {
        Product product = item.getProduct();
        Double prixUnitaire = product.getPrix();
        Double prixPromo = product.getPrixPromo();
        Double prixFinal = (prixPromo != null && prixPromo > 0) ? prixPromo : prixUnitaire;
        
        return com.shopflow.dto.response.CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productNom(product.getNom())
                .productImage(product.getImages() != null && !product.getImages().isEmpty() 
                    ? product.getImages().get(0) 
                    : null)
                .prixUnitaire(prixUnitaire)
                .prixPromo(prixPromo)
                .quantite(item.getQuantite())
                .sousTotal(prixFinal * item.getQuantite())
                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .build();
    }
}
