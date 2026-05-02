# Diagnostic et correction du 403 Forbidden sur POST /api/addresses

## Problème rencontré

```
POST http://localhost:8080/api/addresses → 403 Forbidden
```

Données envoyées par le frontend:
```json
{
  "rue": "rue 23",
  "ville": "Tinja",
  "codePostal": "7032",
  "pays": "Tunisie",
  "principal": true
}
```

## Diagnostic complet

### Analyse des logs backend

```
2026-05-01T15:42:48.761 DEBUG [ShopFlow] [nio-8080-exec-1] c.s.security.JwtAuthenticationFilter
: JwtAuthenticationFilter: POST /api/addresses

2026-05-01T15:42:48.762 DEBUG [ShopFlow] [nio-8080-exec-1] c.s.security.JwtAuthenticationFilter
: Pas de token JWT trouvé pour: /api/addresses

2026-05-01T15:42:48.762 DEBUG [ShopFlow] [nio-8080-exec-1] o.s.s.w.a.AnonymousAuthenticationFilter
: Set SecurityContextHolder to anonymous SecurityContext

2026-05-01T15:42:48.763 DEBUG [ShopFlow] [nio-8080-exec-1] o.s.s.w.a.Http403ForbiddenEntryPoint
: Pre-authenticated entry point called. Rejecting access
```

### Causes identifiées

#### Cause 1: Token JWT absent (CAUSE PRINCIPALE)

**Problème**: Le frontend n'envoie pas le token JWT dans le header Authorization

**Vérifications effectuées**:
- Intercepteur HTTP existe et est correctement configuré (`authInterceptor`)
- L'intercepteur ajoute bien le header `Authorization: Bearer ${token}`
- **MAIS**: `localStorage.getItem('token')` retourne `null`

**Raison**: L'utilisateur n'est pas connecté ou le token a expiré

**Solution**: L'utilisateur doit se connecter pour obtenir un token JWT valide

#### Cause 2: Incompatibilité format de données (PROBLEME SECONDAIRE)

**Problème**: Le backend attendait des `@RequestParam` mais le frontend envoie un JSON body

**Backend (AVANT)**:
```java
@PostMapping
public ResponseEntity<AddressResponse> createAddress(
    @RequestParam String rue,
    @RequestParam String ville,
    @RequestParam String codePostal,
    @RequestParam String pays,
    @RequestParam(defaultValue = "false") Boolean principal,
    Authentication authentication) {
    // ...
}
```

**Frontend**:
```typescript
createAddress(address: Address): Observable<Address> {
  return this.http.post<Address>(this.apiUrl, address);
}
```

Le frontend envoie un JSON body, mais le backend attend des paramètres de requête (form-data ou query params).

## Corrections appliquées

### Correction 1: Création du DTO AddressRequest

**Fichier créé**: `shopflow/src/main/java/com/shopflow/dto/request/AddressRequest.java`

```java
package com.shopflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @NotBlank(message = "La rue est obligatoire")
    @Size(max = 255, message = "La rue ne peut pas dépasser 255 caractères")
    private String rue;

    @NotBlank(message = "La ville est obligatoire")
    @Size(max = 100, message = "La ville ne peut pas dépasser 100 caractères")
    private String ville;

    @NotBlank(message = "Le code postal est obligatoire")
    @Size(max = 20, message = "Le code postal ne peut pas dépasser 20 caractères")
    private String codePostal;

    @NotBlank(message = "Le pays est obligatoire")
    @Size(max = 100, message = "Le pays ne peut pas dépasser 100 caractères")
    private String pays;

    private Boolean principal;
}
```

### Correction 2: Modification du AddressController

**Fichier modifié**: `shopflow/src/main/java/com/shopflow/controller/AddressController.java`

**AVANT**:
```java
@PostMapping
@PreAuthorize("isAuthenticated()")
public ResponseEntity<AddressResponse> createAddress(
        @RequestParam String rue,
        @RequestParam String ville,
        @RequestParam String codePostal,
        @RequestParam String pays,
        @RequestParam(defaultValue = "false") Boolean principal,
        Authentication authentication) {
    // ...
}
```

**APRES**:
```java
@PostMapping
@PreAuthorize("isAuthenticated()")
public ResponseEntity<AddressResponse> createAddress(
        @Valid @RequestBody AddressRequest request,
        Authentication authentication) {
    Long userId = AuthenticationUtil.getUserId(authentication);
    log.info("POST /api/addresses - Création d'une adresse pour l'utilisateur: {}", userId);
    Address address = addressService.createAddress(
            userId, 
            request.getRue(), 
            request.getVille(), 
            request.getCodePostal(), 
            request.getPays(), 
            request.getPrincipal() != null ? request.getPrincipal() : false
    );
    return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(address));
}
```

**Changements**:
- Remplacement de `@RequestParam` par `@RequestBody AddressRequest`
- Ajout de `@Valid` pour validation automatique
- Utilisation du DTO pour extraire les données

## Configuration de sécurité vérifiée

### SecurityConfig.java

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
    .requestMatchers(
        "/api/auth/**",
        "/api/products/**",
        "/api/categories/**",
        "/api/reviews/**",
        "/h2-console/**"
    ).permitAll()
    .anyRequest().authenticated()  // /api/addresses nécessite authentification
)
```

**Verdict**: Configuration correcte. `/api/addresses` nécessite bien une authentification.

### AddressController.java

```java
@PostMapping
@PreAuthorize("isAuthenticated()")  // Nécessite un utilisateur authentifié
public ResponseEntity<AddressResponse> createAddress(...)
```

**Verdict**: Annotation correcte. L'endpoint nécessite une authentification.

### CORS Configuration

```java
configuration.setAllowedOriginPatterns(List.of("http://localhost:*"));
configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
configuration.setAllowedHeaders(Arrays.asList(
    "Authorization", "Content-Type", "X-Requested-With",
    "Accept", "Origin", "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
));
configuration.setAllowCredentials(true);
```

**Verdict**: CORS correctement configuré. Le header `Authorization` est autorisé.

### CSRF

```java
.csrf(AbstractHttpConfigurer::disable)
```

**Verdict**: CSRF désactivé (correct pour une API REST stateless avec JWT).

## Frontend vérifié

### Intercepteur JWT

**Fichier**: `shopflow-front/src/app/interceptors/auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  return next(req);
};
```

**Verdict**: Intercepteur correctement implémenté. Il ajoute le header `Authorization: Bearer ${token}` si le token existe.

### Configuration de l'intercepteur

**Fichier**: `shopflow-front/src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

**Verdict**: Intercepteur correctement enregistré dans la configuration Angular.

### AddressService

**Fichier**: `shopflow-front/src/app/services/address.service.ts`

```typescript
createAddress(address: Address): Observable<Address> {
  return this.http.post<Address>(this.apiUrl, address);
}
```

**Verdict**: Service correctement implémenté. Envoie un JSON body (compatible avec le backend corrigé).

## Solution finale

### Pour résoudre le 403 Forbidden

**Étape 1: Se connecter**

L'utilisateur doit se connecter pour obtenir un token JWT valide:

1. Aller sur la page de connexion
2. Se connecter avec un compte valide (ex: `marammliki14@gmail.com`)
3. Le token JWT sera stocké dans `localStorage`
4. L'intercepteur ajoutera automatiquement le token aux requêtes suivantes

**Étape 2: Tester la création d'adresse**

Une fois connecté, la requête POST /api/addresses fonctionnera:

```typescript
// Le token sera automatiquement ajouté par l'intercepteur
this.addressService.createAddress({
  rue: "rue 23",
  ville: "Tinja",
  codePostal: "7032",
  pays: "Tunisie",
  principal: true
}).subscribe({
  next: (address) => console.log('Adresse créée:', address),
  error: (err) => console.error('Erreur:', err)
});
```

## Flux de la requête (après correction)

```
1. USER → Connexion → POST /api/auth/login
2. BACKEND → Génère JWT token
3. FRONTEND → Stocke token dans localStorage
4. USER → Crée adresse → POST /api/addresses + JSON body
5. authInterceptor → Ajoute header Authorization: Bearer ${token}
6. BACKEND → JwtAuthenticationFilter → Valide token
7. BACKEND → SecurityContext → Utilisateur authentifié
8. BACKEND → AddressController → @PreAuthorize("isAuthenticated()") → OK
9. BACKEND → AddressService → Crée adresse en base
10. BACKEND → Retourne AddressResponse (201 Created)
11. FRONTEND → Reçoit adresse créée
```

## Bonnes pratiques appliquées

### Backend

1. **DTO Request/Response**: Séparation claire entre entités JPA et objets de transfert
2. **Validation**: Utilisation de `@Valid` et annotations Jakarta Validation
3. **Sécurité**: Authentification JWT avec `@PreAuthorize`
4. **Logging**: Logs détaillés pour debugging
5. **HTTP Status**: Utilisation correcte de `201 Created` pour création
6. **CORS**: Configuration appropriée pour développement
7. **CSRF**: Désactivé pour API REST stateless

### Frontend

1. **Intercepteur HTTP**: Ajout automatique du token JWT
2. **Service dédié**: AddressService pour encapsuler les appels API
3. **TypeScript**: Interfaces typées pour les données
4. **Observable**: Utilisation de RxJS pour gestion asynchrone
5. **Gestion d'erreurs**: Callbacks error dans subscribe

## Statut

- Backend compilé: OK
- Backend redémarré: OK
- Correction appliquée: OK
- Format de données: Compatible
- Sécurité: Maintenue

## Action requise

**L'utilisateur doit se connecter** pour obtenir un token JWT valide avant de pouvoir créer une adresse.

Une fois connecté, la création d'adresse fonctionnera correctement avec le backend corrigé.
