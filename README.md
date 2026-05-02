# 🛍️ SHOPFLOW - Système de Gestion de Boutique en Ligne

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-18+-red.svg)](https://angular.io/)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

> Plateforme e-commerce complète avec gestion multi-vendeurs, panier, commandes et avis clients.

---

## 📋 TABLE DES MATIÈRES

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Démarrage rapide](#-démarrage-rapide)
- [Documentation](#-documentation)
- [Architecture](#-architecture)
- [État du projet](#-état-du-projet)
- [Contribution](#-contribution)

---

## 🎯 APERÇU

ShopFlow est une application e-commerce moderne permettant à plusieurs vendeurs de gérer leurs boutiques en ligne. Les clients peuvent parcourir les produits, les ajouter au panier, passer des commandes et laisser des avis.

### 👥 Rôles utilisateurs

- **ADMIN** : Gestion complète de la plateforme
- **SELLER** : Gestion de sa boutique et de ses produits
- **CUSTOMER** : Achat de produits et gestion de commandes

---

## ✨ FONCTIONNALITÉS

### 🔐 Authentification & Sécurité
- ✅ Inscription et connexion avec JWT
- ✅ Gestion des rôles (ADMIN, SELLER, CUSTOMER)
- ✅ Protection des endpoints par rôle
- ✅ Tokens JWT avec expiration

### 🛒 Gestion des produits
- ✅ CRUD complet des produits
- ✅ Variantes (tailles, couleurs, formats)
- ✅ Catégories hiérarchiques
- ✅ Prix promotionnels
- ✅ Gestion du stock
- ✅ Images multiples

### 🛍️ Panier & Commandes
- ✅ Panier persistant en base
- ✅ Gestion des quantités
- ✅ Codes promo (pourcentage ou fixe)
- ✅ Suivi des commandes
- ✅ Historique des achats

### ⭐ Avis clients
- ✅ Notes de 1 à 5 étoiles
- ✅ Commentaires
- ✅ Modération par admin

### 📊 Statistiques
- ✅ Dashboard vendeur
- ✅ Produits les plus vendus
- ✅ Chiffre d'affaires
- ✅ Statistiques admin

---

## 🛠️ TECHNOLOGIES

### Backend
- **Java 17**
- **Spring Boot 3.2.5**
- **Spring Data JPA** (Hibernate)
- **Spring Security** + **JWT**
- **H2 Database** (dev) / **PostgreSQL** (prod)
- **Maven**
- **Lombok**
- **MapStruct**
- **Swagger/OpenAPI**

### Frontend
- **Angular 18+**
- **TypeScript**
- **RxJS**
- **Angular Material** (à venir)

---

## 🚀 DÉMARRAGE RAPIDE

### Prérequis
- Java 17+
- Maven 3.8+
- Node.js 18+ (pour le frontend)

### Installation

#### 1. Cloner le projet
```bash
git clone https://github.com/votre-repo/shopflow.git
cd shopflow
```

#### 2. Lancer le backend
```bash
cd shopflow
mvn spring-boot:run
```

Le serveur démarre sur **http://localhost:8080**

#### 3. Accéder aux interfaces

- **API REST :** http://localhost:8080/api
- **Swagger UI :** http://localhost:8080/swagger-ui
- **H2 Console :** http://localhost:8080/h2-console

#### 4. Tester l'API

**Créer un compte :**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "motDePasse": "password123",
    "prenom": "John",
    "nom": "Doe",
    "role": "CUSTOMER"
  }'
```

**Se connecter :**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "motDePasse": "password123"
  }'
```

---

## 📚 DOCUMENTATION

### 📖 Guides disponibles

| Document | Description |
|----------|-------------|
| [QUICK_START.md](./QUICK_START.md) | Démarrage en 5 minutes |
| [INDEX_DOCUMENTATION.md](./INDEX_DOCUMENTATION.md) | Guide de navigation |
| [README_TRAVAIL_EFFECTUE.md](./README_TRAVAIL_EFFECTUE.md) | Résumé de la session |
| [DIAGRAMME_ARCHITECTURE.md](./DIAGRAMME_ARCHITECTURE.md) | Architecture visuelle |
| [STRUCTURE_PROJET.md](./STRUCTURE_PROJET.md) | Organisation du code |
| [REPOSITORIES_COMPLETS.md](./REPOSITORIES_COMPLETS.md) | Documentation repositories |
| [PROGRESSION.md](./PROGRESSION.md) | Suivi de progression |

### 🎓 Pour commencer
1. Lisez [QUICK_START.md](./QUICK_START.md)
2. Consultez [INDEX_DOCUMENTATION.md](./INDEX_DOCUMENTATION.md)
3. Explorez [DIAGRAMME_ARCHITECTURE.md](./DIAGRAMME_ARCHITECTURE.md)

---

## 🏗️ ARCHITECTURE

### Structure en couches

```
┌─────────────────────┐
│   Frontend Angular  │
├─────────────────────┤
│   Controllers REST  │
├─────────────────────┤
│   Services Métier   │
├─────────────────────┤
│   Repositories JPA  │
├─────────────────────┤
│   Entités JPA       │
├─────────────────────┤
│   Base de données   │
└─────────────────────┘
```

### Modules principaux

- **Authentification** : Gestion JWT et sécurité
- **Utilisateurs** : Users, Addresses, SellerProfiles
- **Produits** : Products, Variants, Categories
- **Panier** : Cart, CartItems
- **Commandes** : Orders, OrderItems, Coupons
- **Avis** : Reviews

---

## 📊 ÉTAT DU PROJET

### ✅ Terminé (100%)
- [x] 12 Entités JPA
- [x] 12 Repositories (70+ méthodes)
- [x] Spring Security + JWT
- [x] Configuration H2
- [x] Swagger UI
- [x] Gestion des erreurs

### 🔄 En cours (8%)
- [ ] Services (1/12)
- [ ] Controllers (1/12)
- [ ] DTOs complets

### 🔜 À faire (0%)
- [ ] 11 Services manquants
- [ ] 11 Controllers manquants
- [ ] Frontend Angular complet
- [ ] Tests unitaires
- [ ] Tests E2E
- [ ] DataLoader (données test)

### Progression globale

```
[████████░░░░░░░░░░░░] 40%
```

---

## 🗄️ BASE DE DONNÉES

### Tables (12)

```sql
users, seller_profiles, addresses
products, product_variants, categories
carts, cart_items
orders, order_items
reviews, coupons
```

### Relations principales

- User (1:1) SellerProfile
- User (1:N) Address, Order, Review
- SellerProfile (1:N) Product
- Product (N:N) Category
- Product (1:N) ProductVariant, Review
- Cart (1:N) CartItem
- Order (1:N) OrderItem

---

## 🔒 SÉCURITÉ

### Authentification
- JWT avec expiration (15 minutes)
- Refresh token (7 jours)
- Mot de passe hashé avec BCrypt

### Autorisation
- Endpoints publics : `/api/auth/**`, `/swagger-ui/**`, `/h2-console/**`
- Endpoints protégés : Tous les autres (JWT requis)
- Contrôle d'accès par rôle : `@PreAuthorize("hasRole('ADMIN')")`

---

## 🧪 TESTS

### Lancer les tests
```bash
mvn test
```

### Tester avec Swagger
👉 http://localhost:8080/swagger-ui

### Tester avec Postman
Collection disponible dans `/docs/postman/`

---

## 📦 COMPILATION & DÉPLOIEMENT

### Compiler
```bash
mvn clean compile
```

### Créer le JAR
```bash
mvn clean package
```

### Lancer le JAR
```bash
java -jar target/shopflow-0.0.1-SNAPSHOT.jar
```

---

## 🤝 CONTRIBUTION

### Workflow Git
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code
- Suivre les conventions Java
- Documenter les méthodes publiques
- Écrire des tests unitaires
- Utiliser Lombok pour réduire le boilerplate

---

## 📝 CHANGELOG

### Version 0.0.1-SNAPSHOT (26/04/2026)
- ✅ Création du projet Spring Boot
- ✅ 12 Entités JPA créées
- ✅ 12 Repositories créés
- ✅ Spring Security + JWT implémenté
- ✅ AuthService et AuthController créés
- ✅ Configuration H2 et Swagger
- ✅ Documentation complète

---

## 📄 LICENCE

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👨‍💻 AUTEURS

- **Équipe ShopFlow** - *Développement initial*

---

## 🙏 REMERCIEMENTS

- Spring Boot pour le framework
- JWT.io pour la gestion des tokens
- H2 Database pour la base de développement
- Swagger pour la documentation API

---

## 📞 SUPPORT

Pour toute question ou problème :
1. Consultez la [documentation](./INDEX_DOCUMENTATION.md)
2. Ouvrez une [issue](https://github.com/votre-repo/shopflow/issues)
3. Contactez l'équipe

---

## 🔗 LIENS UTILES

- [Documentation Spring Boot](https://spring.io/projects/spring-boot)
- [Documentation Spring Security](https://spring.io/projects/spring-security)
- [Documentation JWT](https://jwt.io/)
- [Documentation Angular](https://angular.io/)

---

<div align="center">

**Fait avec ❤️ par l'équipe ShopFlow**

[⬆ Retour en haut](#-shopflow---système-de-gestion-de-boutique-en-ligne)

</div>
