package com.shopflow.repository;

import com.shopflow.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /** Toutes les catégories racines (sans parent) — pour construire l'arbre */
    List<Category> findAllByParentIsNull();

    /** Alias pour findAllByParentIsNull */
    default List<Category> findByParentIsNull() {
        return findAllByParentIsNull();
    }

    /** Trouve une catégorie par son nom */
    java.util.Optional<Category> findByNom(String nom);

    /** Trouve les sous-catégories d'une catégorie */
    List<Category> findByParentId(Long parentId);

    /** Recherche par nom (contient, insensible à la casse) */
    List<Category> findByNomContainingIgnoreCase(String keyword);

    /** Compte le nombre de produits dans une catégorie */
    @Query("SELECT COUNT(p) FROM Product p JOIN p.categories c WHERE c.id = :categoryId")
    long countProductsByCategoryId(Long categoryId);

    boolean existsByNom(String nom);
}