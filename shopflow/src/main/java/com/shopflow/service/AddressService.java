package com.shopflow.service;

import com.shopflow.entity.Address;
import com.shopflow.entity.User;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.AddressRepository;
import com.shopflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service de gestion des adresses de livraison.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    /**
     * Récupère toutes les adresses d'un utilisateur.
     */
    public List<Address> getUserAddresses(Long userId) {
        log.debug("Récupération des adresses de l'utilisateur: {}", userId);
        return addressRepository.findByUserId(userId);
    }

    /**
     * Récupère l'adresse principale d'un utilisateur.
     */
    public Address getPrincipalAddress(Long userId) {
        log.debug("Récupération de l'adresse principale de l'utilisateur: {}", userId);
        return addressRepository.findByUserIdAndPrincipalTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune adresse principale trouvée pour l'utilisateur: " + userId));
    }

    /**
     * Récupère une adresse par son ID.
     */
    public Address getAddressById(Long id, Long userId) {
        log.debug("Récupération de l'adresse: {}", id);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adresse non trouvée: " + id));

        // Vérifier que l'adresse appartient bien à l'utilisateur
        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cette adresse n'appartient pas à l'utilisateur");
        }

        return address;
    }

    /**
     * Crée une nouvelle adresse pour un utilisateur.
     */
    @Transactional
    public Address createAddress(Long userId, String rue, String ville, String codePostal, String pays, Boolean principal) {
        log.info("Création d'une nouvelle adresse pour l'utilisateur: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + userId));

        // Si cette adresse doit être principale, retirer le flag des autres
        if (Boolean.TRUE.equals(principal)) {
            removePrincipalFlag(userId);
        }

        // Si c'est la première adresse, la rendre principale automatiquement
        if (!addressRepository.existsByUserId(userId)) {
            principal = true;
        }

        Address address = Address.builder()
                .user(user)
                .rue(rue)
                .ville(ville)
                .codePostal(codePostal)
                .pays(pays)
                .principal(principal != null ? principal : false)
                .build();

        Address saved = addressRepository.save(address);
        log.info("Adresse créée avec succès: {}", saved.getId());
        return saved;
    }

    /**
     * Met à jour une adresse existante.
     */
    @Transactional
    public Address updateAddress(Long id, Long userId, String rue, String ville, String codePostal, String pays, Boolean principal) {
        log.info("Mise à jour de l'adresse: {}", id);

        Address address = getAddressById(id, userId);

        address.setRue(rue);
        address.setVille(ville);
        address.setCodePostal(codePostal);
        address.setPays(pays);

        // Si cette adresse devient principale, retirer le flag des autres
        if (Boolean.TRUE.equals(principal) && !address.getPrincipal()) {
            removePrincipalFlag(userId);
            address.setPrincipal(true);
        } else if (Boolean.FALSE.equals(principal) && address.getPrincipal()) {
            // Ne pas permettre de retirer le flag principal s'il n'y a qu'une seule adresse
            long addressCount = addressRepository.countByUserId(userId);
            if (addressCount == 1) {
                throw new IllegalStateException("Impossible de retirer le flag principal de la seule adresse");
            }
            address.setPrincipal(false);
        }

        Address updated = addressRepository.save(address);
        log.info("Adresse mise à jour avec succès: {}", id);
        return updated;
    }

    /**
     * Définit une adresse comme principale.
     */
    @Transactional
    public Address setPrincipalAddress(Long id, Long userId) {
        log.info("Définition de l'adresse {} comme principale pour l'utilisateur: {}", id, userId);

        Address address = getAddressById(id, userId);

        // Retirer le flag principal des autres adresses
        removePrincipalFlag(userId);

        address.setPrincipal(true);
        Address updated = addressRepository.save(address);
        log.info("Adresse définie comme principale: {}", id);
        return updated;
    }

    /**
     * Supprime une adresse.
     */
    @Transactional
    public void deleteAddress(Long id, Long userId) {
        log.info("Suppression de l'adresse: {}", id);

        Address address = getAddressById(id, userId);

        // Ne pas permettre de supprimer la seule adresse principale
        if (address.getPrincipal()) {
            long addressCount = addressRepository.countByUserId(userId);
            if (addressCount == 1) {
                throw new IllegalStateException("Impossible de supprimer la seule adresse");
            }
            // Si on supprime l'adresse principale et qu'il y en a d'autres, définir la première comme principale
            List<Address> otherAddresses = addressRepository.findByUserId(userId);
            otherAddresses.stream()
                    .filter(a -> !a.getId().equals(id))
                    .findFirst()
                    .ifPresent(a -> {
                        a.setPrincipal(true);
                        addressRepository.save(a);
                    });
        }

        addressRepository.deleteById(id);
        log.info("Adresse supprimée avec succès: {}", id);
    }

    // --- Méthodes utilitaires ---

    /**
     * Retire le flag principal de toutes les adresses d'un utilisateur.
     */
    private void removePrincipalFlag(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(a -> {
            if (a.getPrincipal()) {
                a.setPrincipal(false);
                addressRepository.save(a);
            }
        });
    }
}
