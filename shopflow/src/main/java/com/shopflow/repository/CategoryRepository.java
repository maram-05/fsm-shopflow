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

    boolean existsByNom(String nom);
}