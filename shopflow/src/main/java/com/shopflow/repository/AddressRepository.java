package com.shopflow.repository;

import com.shopflow.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour gérer les adresses de livraison des clients.
 */
@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    /**
     * Trouve toutes les adresses d'un utilisateur.
     * @param userId ID de l'utilisateur
     * @return Liste des adresses
     */
    List<Address> findByUserId(Long userId);

    /**
     * Trouve l'adresse principale d'un utilisateur.
     * @param userId ID de l'utilisateur
     * @return L'adresse principale si elle existe
     */
    Optional<Address> findByUserIdAndPrincipalTrue(Long userId);

    /**
     * Vérifie si un utilisateur a au moins une adresse.
     * @param userId ID de l'utilisateur
     * @return true si l'utilisateur a des adresses
     */
    boolean existsByUserId(Long userId);

    /**
     * Compte le nombre d'adresses d'un utilisateur.
     * @param userId ID de l'utilisateur
     * @return Nombre d'adresses
     */
    long countByUserId(Long userId);
}
