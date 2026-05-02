package com.shopflow.service;

import com.shopflow.entity.*;
import com.shopflow.entity.enums.OrderStatus;
import com.shopflow.exception.OrderException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.exception.UnauthorizedOperationException;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service de gestion des commandes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final AddressRepository addressRepository;

    /**
     * Récupère toutes les commandes d'un utilisateur.
     */
    public List<Order> getUserOrders(Long userId) {
        log.debug("Récupération des commandes de l'utilisateur: {}", userId);
        return orderRepository.findByCustomerId(userId);
    }

    /**
     * Récupère une commande par son ID.
     */
    public Order getOrderById(Long id, Long userId) {
        log.debug("Récupération de la commande: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée: " + id));

        if (!order.getCustomer().getId().equals(userId)) {
            throw new UnauthorizedOperationException("accès", "commande");
        }

        return order;
    }

    /**
     * Crée une commande à partir du panier.
     */
    @Transactional
    public Order createOrder(Long userId, Long addressId, String couponCode) {
        log.info("Création d'une commande pour l'utilisateur: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + userId));

        Cart cart = cartRepository.findByCustomerId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Panier non trouvé"));

        if (cart.getLignes().isEmpty()) {
            throw new OrderException(OrderException.OrderError.EMPTY_CART);
        }

        // Récupérer l'adresse
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Adresse non trouvée: " + addressId));

        // Calculer le sous-total
        Double sousTotal = cart.calculerTotal();

        // Appliquer le coupon si fourni
        Coupon coupon = null;
        Double remise = 0.0;
        if (couponCode != null && !couponCode.isEmpty()) {
            coupon = couponRepository.findByCode(couponCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon non trouvé: " + couponCode));

            if (!coupon.estValide()) {
                throw new IllegalStateException("Ce coupon n'est pas valide");
            }

            remise = coupon.calculerRemise(sousTotal);
        }

        // Frais de livraison (fixe pour l'exemple)
        Double fraisLivraison = 5.0;

        // Total TTC
        Double totalTTC = sousTotal - remise + fraisLivraison;

        // Créer la commande
        Order order = Order.builder()
                .customer(user)
                .numeroCommande(generateOrderNumber())
                .statut(OrderStatus.PENDING)
                .adresseLivraison(formatAddress(address))
                .sousTotal(sousTotal)
                .fraisLivraison(fraisLivraison)
                .totalTTC(totalTTC)
                .coupon(coupon)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Créer les lignes de commande
        for (CartItem cartItem : cart.getLignes()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .variant(cartItem.getVariant())
                    .quantite(cartItem.getQuantite())
                    .prixUnitaire(cartItem.getProduct().getPrixEffectif())
                    .build();
            orderItemRepository.save(orderItem);

            // Décrémenter le stock
            Product product = cartItem.getProduct();
            product.setStock(product.getStock() - cartItem.getQuantite());
        }

        // Incrémenter l'utilisation du coupon
        if (coupon != null) {
            coupon.setUsagesActuels(coupon.getUsagesActuels() + 1);
            couponRepository.save(coupon);
        }

        // Vider le panier
        cartItemRepository.deleteByCartId(cart.getId());

        log.info("Commande créée avec succès: {}", savedOrder.getNumeroCommande());
        return savedOrder;
    }

    /**
     * Met à jour le statut d'une commande.
     */
    @Transactional
    public Order updateOrderStatus(Long id, OrderStatus newStatus) {
        log.info("Mise à jour du statut de la commande: {} -> {}", id, newStatus);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée: " + id));

        order.setStatut(newStatus);
        Order updated = orderRepository.save(order);
        log.info("Statut mis à jour: {}", id);
        return updated;
    }

    /**
     * Annule une commande.
     */
    @Transactional
    public Order cancelOrder(Long id, Long userId) {
        log.info("Annulation de la commande: {}", id);

        Order order = getOrderById(id, userId);

        if (!order.peutEtreAnnulee()) {
            throw new OrderException(OrderException.OrderError.CANNOT_CANCEL, order.getId());
        }

        order.setStatut(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        log.info("Commande annulée: {}", id);
        return updated;
    }

    // --- Méthodes utilitaires ---

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String formatAddress(Address address) {
        return String.format("%s, %s %s, %s",
                address.getRue(),
                address.getCodePostal(),
                address.getVille(),
                address.getPays());
    }
}
