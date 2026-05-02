package com.shopflow.repository;

import com.shopflow.entity.SellerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour gérer les profils vendeurs.
 */
@Repository
public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long> {

    /**
     * Trouve un profil vendeur par l'ID de l'utilisateur.
     * @param userId ID de l'utilisateur
     * @return Le profil vendeur si trouvé
     */
    Optional<SellerProfile> findByUserId(Long userId);

    /**
     * Trouve un profil vendeur par le nom de la boutique.
     * @param nomBoutique Nom de la boutique
     * @return Le profil vendeur si trouvé
     */
    Optional<SellerProfile> findByNomBoutique(String nomBoutique);

    /**
     * Vérifie si un nom de boutique existe déjà.
     * @param nomBoutique Nom de la boutique
     * @return true si le nom existe
     */
    boolean existsByNomBoutique(String nomBoutique);

    /**
     * Trouve les vendeurs les mieux notés.
     * @return Liste des profils vendeurs triés par note décroissante
     */
    @Query("SELECT sp FROM SellerProfile sp ORDER BY sp.note DESC")
    List<SellerProfile> findTopRatedSellers();

    /**
     * Trouve les vendeurs avec une note minimale.
     * @param minNote Note minimale
     * @return Liste des profils vendeurs
     */
    @Query("SELECT sp FROM SellerProfile sp WHERE sp.note >= :minNote ORDER BY sp.note DESC")
    List<SellerProfile> findByNoteGreaterThanEqual(Double minNote);
}
