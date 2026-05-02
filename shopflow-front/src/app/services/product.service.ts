import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {
    console.log('[ProductService] Service initialisé avec URL:', this.apiUrl);
  }

  /**
   * Récupère tous les produits actifs
   */
  getAllProducts(): Observable<Product[]> {
    console.log('[ProductService] Appel API: GET', this.apiUrl);
    
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap(products => {
        console.log('[ProductService] Produits reçus:', products.length);
        console.log('[ProductService] Premier produit:', products[0]);
      }),
      map(products => this.normalizeProducts(products)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère un produit par son ID
   */
  getProductById(id: number): Observable<Product> {
    console.log('[ProductService] Appel API: GET', `${this.apiUrl}/${id}`);
    
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      tap(product => console.log('[ProductService] Produit reçu:', product)),
      map(product => this.normalizeProduct(product)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les produits en promotion
   */
  getPromotionalProducts(): Observable<Product[]> {
    console.log('[ProductService] Appel API: GET', `${this.apiUrl}/promotions`);
    
    return this.http.get<Product[]>(`${this.apiUrl}/promotions`).pipe(
      tap(products => console.log('[ProductService] Promotions reçues:', products.length)),
      map(products => this.normalizeProducts(products)),
      catchError(this.handleError)
    );
  }

  /**
   * Alias pour getPromotionalProducts
   */
  getPromotions(): Observable<Product[]> {
    return this.getPromotionalProducts();
  }

  /**
   * Recherche des produits par mot-clé
   */
  searchProducts(keyword: string): Observable<Product[]> {
    console.log('[ProductService] Recherche:', keyword);
    
    return this.http.get<Product[]>(`${this.apiUrl}/search`, {
      params: { keyword }
    }).pipe(
      tap(products => console.log('[ProductService] Résultats recherche:', products.length)),
      map(products => this.normalizeProducts(products)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les produits d'une catégorie
   */
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    console.log('[ProductService] Produits de la catégorie:', categoryId);
    
    return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`).pipe(
      tap(products => console.log('[ProductService] Produits catégorie reçus:', products.length)),
      map(products => this.normalizeProducts(products)),
      catchError(this.handleError)
    );
  }

  /**
   * Normalise un tableau de produits pour gérer les différences entre API et frontend
   */
  private normalizeProducts(products: Product[]): Product[] {
    return products.map(product => this.normalizeProduct(product));
  }

  /**
   * Normalise un produit pour gérer les différences entre API et frontend
   */
  private normalizeProduct(product: Product): Product {
    return {
      ...product,
      // Gérer les images (array vs string)
      imageUrl: product.images?.[0] || product.imageUrl,
      // Gérer les notes (noteMoyenne vs noteAverage)
      noteAverage: product.noteMoyenne || product.noteAverage || 0,
      // Gérer les pourcentages de remise
      pourcentagePromotion: product.pourcentageRemise || product.pourcentagePromotion || 0,
      // Gérer les noms de vendeur
      vendeurNom: product.sellerNom || product.vendeurNom || 'ShopFlow',
      // Gérer les prix promo
      prixPromotion: product.prixPromo || product.prixPromotion
    };
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
      console.error('[ProductService] Erreur client:', error.error.message);
    } else {
      // Erreur côté serveur
      errorMessage = `Erreur serveur: ${error.status} - ${error.message}`;
      console.error('[ProductService] Erreur serveur:', {
        status: error.status,
        message: error.message,
        url: error.url
      });

      // Messages spécifiques selon le code d'erreur
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur';
          break;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
