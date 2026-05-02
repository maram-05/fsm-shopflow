import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="product-detail-container">
      @if (loading()) {
        <div class="loading">
          <div class="spinner-large"></div>
          <p>Chargement du produit...</p>
        </div>
      } @else if (product()) {
        <div class="product-detail">
          <!-- Breadcrumb -->
          <nav class="breadcrumb">
            <a routerLink="/">Accueil</a>
            <span>/</span>
            <a routerLink="/products">Produits</a>
            <span>/</span>
            <span>{{ product()!.nom }}</span>
          </nav>

          <div class="product-content">
            <!-- Product Image -->
            <div class="product-image-section">
              <div class="main-image">
                @if (product()!.imageUrl) {
                  <img [src]="product()!.imageUrl" [alt]="product()!.nom" />
                } @else {
                  <div class="placeholder-image">📦</div>
                }
              </div>
              @if (product()?.pourcentagePromotion && (product()?.pourcentagePromotion ?? 0) > 0) {
                <div class="discount-badge">
                  -{{ product()!.pourcentagePromotion }}%
                </div>
              }
            </div>

            <!-- Product Info -->
            <div class="product-info-section">
              <h1 class="product-title">{{ product()!.nom }}</h1>

              <div class="product-rating">
                <span class="stars">⭐ {{ product()!.noteAverage || 0 | number:'1.1-1' }}</span>
                <span class="reviews">({{ product()!.nombreAvis || 0 }} avis)</span>
              </div>

              <div class="product-price">
                @if (product()?.prixPromotion && (product()?.prixPromotion ?? 0) < (product()?.prix ?? 0)) {
                  <div class="price-promo">{{ product()!.prixPromotion }}€</div>
                  <div class="price-original">{{ product()!.prix }}€</div>
                  <div class="savings">
                    Économisez {{ product()!.prix - product()!.prixPromotion! | number:'1.2-2' }}€
                  </div>
                } @else {
                  <div class="price-current">{{ product()!.prix }}€</div>
                }
              </div>

              <div class="product-stock">
                @if (product()!.stock && product()!.stock > 0) {
                  <span class="in-stock">✓ En stock ({{ product()!.stock }} disponibles)</span>
                } @else {
                  <span class="out-of-stock">✗ Rupture de stock</span>
                }
              </div>

              <div class="product-description">
                <h3>Description</h3>
                <p>{{ product()!.description }}</p>
              </div>

              <!-- Quantity Selector -->
              <div class="quantity-section">
                <label>Quantité:</label>
                <div class="quantity-selector">
                  <button
                    class="qty-btn"
                    (click)="decreaseQuantity()"
                    [disabled]="quantity() <= 1"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    [(ngModel)]="quantityValue"
                    (ngModelChange)="updateQuantity($event)"
                    min="1"
                    [max]="product()!.stock || 1"
                    class="qty-input"
                  />
                  <button
                    class="qty-btn"
                    (click)="increaseQuantity()"
                    [disabled]="quantity() >= (product()!.stock || 1)"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <button
                  class="btn btn-primary btn-lg"
                  (click)="addToCart()"
                  [disabled]="!product()!.stock || product()!.stock === 0 || addingToCart()"
                >
                  @if (addingToCart()) {
                    <span class="spinner"></span>
                    Ajout en cours...
                  } @else {
                    🛒 Ajouter au panier
                  }
                </button>
                <button class="btn btn-secondary btn-lg" (click)="buyNow()">
                  ⚡ Acheter maintenant
                </button>
              </div>

              <!-- Product Meta -->
              <div class="product-meta">
                <div class="meta-item">
                  <span class="meta-label">Vendeur:</span>
                  <span class="meta-value">{{ product()!.vendeurNom || 'ShopFlow' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Catégorie:</span>
                  <span class="meta-value">{{ product()!.categorieNom }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">SKU:</span>
                  <span class="meta-value">{{ product()!.sku }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div class="reviews-section">
            <h2>Avis clients</h2>
            @if (product()?.nombreAvis && (product()?.nombreAvis ?? 0) > 0) {
              <div class="reviews-summary">
                <div class="rating-large">
                  <div class="rating-number">{{ product()!.noteAverage || 0 | number:'1.1-1' }}</div>
                  <div class="rating-stars">⭐⭐⭐⭐⭐</div>
                  <div class="rating-count">{{ product()!.nombreAvis }} avis</div>
                </div>
              </div>
              <p class="reviews-placeholder">Les avis détaillés seront affichés ici.</p>
            } @else {
              <div class="no-reviews">
                <p>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="error-state">
          <div class="error-icon">❌</div>
          <h2>Produit introuvable</h2>
          <p>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
          <a routerLink="/products" class="btn btn-primary">
            Retour aux produits
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 30px;
      min-height: calc(100vh - 80px);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
      font-size: 14px;
      color: #666;
    }

    .breadcrumb a {
      color: #667eea;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      margin-bottom: 60px;
    }

    /* Product Image Section */
    .product-image-section {
      position: relative;
    }

    .main-image {
      width: 100%;
      height: 600px;
      background: #f5f5f5;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image {
      font-size: 150px;
    }

    .discount-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 15px 25px;
      border-radius: 30px;
      font-weight: 700;
      font-size: 1.5rem;
    }

    /* Product Info Section */
    .product-info-section {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .product-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      color: #333;
      line-height: 1.2;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 1.1rem;
    }

    .stars {
      color: #ffa500;
      font-weight: 600;
    }

    .reviews {
      color: #666;
    }

    .product-price {
      padding: 20px 0;
      border-top: 2px solid #f0f0f0;
      border-bottom: 2px solid #f0f0f0;
    }

    .price-current {
      font-size: 3rem;
      font-weight: 700;
      color: #667eea;
    }

    .price-promo {
      font-size: 3rem;
      font-weight: 700;
      color: #ff4444;
      margin-bottom: 10px;
    }

    .price-original {
      font-size: 1.5rem;
      text-decoration: line-through;
      color: #999;
      margin-bottom: 10px;
    }

    .savings {
      display: inline-block;
      background: #22c55e;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    .product-stock {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .in-stock {
      color: #22c55e;
    }

    .out-of-stock {
      color: #ff4444;
    }

    .product-description h3 {
      font-size: 1.3rem;
      margin: 0 0 15px 0;
      color: #333;
    }

    .product-description p {
      color: #666;
      line-height: 1.8;
      font-size: 1.05rem;
    }

    .quantity-section {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .quantity-section label {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 0;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    }

    .qty-btn {
      width: 45px;
      height: 45px;
      border: none;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 1.5rem;
      font-weight: 700;
      transition: all 0.2s;
    }

    .qty-btn:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }

    .qty-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .qty-input {
      width: 70px;
      height: 45px;
      border: none;
      text-align: center;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      margin-top: 10px;
    }

    .btn {
      padding: 15px 30px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .btn-lg {
      padding: 18px 40px;
      font-size: 18px;
      flex: 1;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .product-meta {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
    }

    .meta-label {
      color: #666;
      font-weight: 500;
    }

    .meta-value {
      color: #333;
      font-weight: 600;
    }

    /* Reviews Section */
    .reviews-section {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .reviews-section h2 {
      font-size: 2rem;
      margin: 0 0 30px 0;
      color: #333;
    }

    .reviews-summary {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
    }

    .rating-large {
      text-align: center;
    }

    .rating-number {
      font-size: 4rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 10px;
    }

    .rating-stars {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .rating-count {
      color: #666;
      font-size: 1.1rem;
    }

    .reviews-placeholder,
    .no-reviews {
      text-align: center;
      color: #666;
      padding: 40px;
    }

    /* Loading & Error States */
    .loading,
    .error-state {
      text-align: center;
      padding: 100px 20px;
    }

    .spinner-large {
      width: 60px;
      height: 60px;
      border: 4px solid #f0f0f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }

    .error-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }

    .error-state h2 {
      font-size: 2rem;
      margin: 0 0 15px 0;
      color: #333;
    }

    .error-state p {
      color: #666;
      margin: 0 0 30px 0;
      font-size: 1.1rem;
    }

    /* Responsive */
    @media (max-width: 968px) {
      .product-content {
        grid-template-columns: 1fr;
        gap: 30px;
      }

      .main-image {
        height: 400px;
      }

      .product-title {
        font-size: 2rem;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  addingToCart = signal(false);
  quantity = signal(1);
  quantityValue = 1;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number): void {
    this.loading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        // Normaliser les données de l'API
        const normalizedProduct = {
          ...product,
          imageUrl: product.images?.[0] || product.imageUrl,
          noteAverage: product.noteMoyenne || product.noteAverage || 0,
          pourcentagePromotion: product.pourcentageRemise || product.pourcentagePromotion || 0,
          vendeurNom: product.sellerNom || product.vendeurNom || 'ShopFlow',
          prixPromotion: product.prixPromo || product.prixPromotion
        };
        this.product.set(normalizedProduct);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement produit:', err);
        this.product.set(null);
        this.loading.set(false);
      }
    });
  }

  updateQuantity(value: number): void {
    const max = this.product()?.stock || 1;
    if (value >= 1 && value <= max) {
      this.quantity.set(value);
      this.quantityValue = value;
    }
  }

  increaseQuantity(): void {
    const max = this.product()?.stock || 1;
    if (this.quantity() < max) {
      this.quantity.update(q => q + 1);
      this.quantityValue = this.quantity();
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
      this.quantityValue = this.quantity();
    }
  }

  addToCart(): void {
    if (!this.product()) return;

    this.addingToCart.set(true);
    this.cartService.addItem(this.product()!.id, this.quantity()).subscribe({
      next: () => {
        this.addingToCart.set(false);
        alert('Produit ajouté au panier !');
      },
      error: (err) => {
        console.error('Erreur ajout au panier:', err);
        this.addingToCart.set(false);
        alert('Erreur lors de l\'ajout au panier');
      }
    });
  }

  buyNow(): void {
    this.addToCart();
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 500);
  }
}
