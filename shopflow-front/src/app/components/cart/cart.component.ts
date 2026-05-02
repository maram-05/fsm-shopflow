import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-container">
      <h1 class="page-title">🛒 Mon Panier</h1>

      @if (loading()) {
        <div class="loading">
          <div class="spinner-large"></div>
          <p>Chargement du panier...</p>
        </div>
      } @else if (cart() && cart()!.items && cart()!.items.length > 0) {
        <div class="cart-content">
          <!-- Cart Items -->
          <div class="cart-items">
            @for (item of cart()!.items; track item.id) {
              <div class="cart-item">
                <div class="item-image" (click)="viewProduct(item.productId)">
                  @if (item.productImageUrl) {
                    <img [src]="item.productImageUrl" [alt]="item.productNom" />
                  } @else {
                    <div class="placeholder">📦</div>
                  }
                </div>

                <div class="item-info">
                  <h3 class="item-name" (click)="viewProduct(item.productId)">
                    {{ item.productNom }}
                  </h3>
                  <p class="item-price">{{ item.prixUnitaire }}€ / unité</p>
                  @if (item.stock && item.stock > 0) {
                    <p class="item-stock">✓ En stock</p>
                  } @else {
                    <p class="item-stock out-of-stock">✗ Rupture de stock</p>
                  }
                </div>

                <div class="item-quantity">
                  <button
                    class="qty-btn"
                    (click)="updateQuantity(item.id, item.quantite - 1)"
                    [disabled]="item.quantite <= 1"
                  >
                    -
                  </button>
                  <span class="qty-value">{{ item.quantite }}</span>
                  <button
                    class="qty-btn"
                    (click)="updateQuantity(item.id, item.quantite + 1)"
                    [disabled]="item.quantite >= (item.stock || 1)"
                  >
                    +
                  </button>
                </div>

                <div class="item-total">
                  <p class="total-price">{{ item.sousTotal }}€</p>
                </div>

                <button class="item-remove" (click)="removeItem(item.id)">
                  🗑️
                </button>
              </div>
            }
          </div>

          <!-- Cart Summary -->
          <div class="cart-summary">
            <h2>Résumé de la commande</h2>

            <div class="summary-line">
              <span>Sous-total ({{ totalItems() }} articles)</span>
              <span class="amount">{{ cart()!.montantTotal }}€</span>
            </div>

            <div class="summary-line">
              <span>Livraison</span>
              <span class="amount free">Gratuite</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-line total">
              <span>Total</span>
              <span class="amount">{{ cart()!.montantTotal }}€</span>
            </div>

            <button class="btn btn-primary btn-block btn-lg" (click)="proceedToCheckout()">
              Passer la commande
            </button>

            <button class="btn btn-secondary btn-block" (click)="continueShopping()">
              Continuer mes achats
            </button>

            <div class="security-badges">
              <div class="badge">🔒 Paiement sécurisé</div>
              <div class="badge">🚚 Livraison rapide</div>
              <div class="badge">↩️ Retour gratuit</div>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h2>Votre panier est vide</h2>
          <p>Découvrez nos produits et ajoutez-les à votre panier</p>
          <a routerLink="/products" class="btn btn-primary btn-lg">
            Découvrir les produits
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 30px;
      min-height: calc(100vh - 80px);
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 40px 0;
      color: #333;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 30px;
    }

    /* Cart Items */
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .cart-item {
      background: white;
      padding: 25px;
      border-radius: 15px;
      display: grid;
      grid-template-columns: 120px 1fr auto auto auto;
      gap: 25px;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
    }

    .cart-item:hover {
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }

    .item-image {
      width: 120px;
      height: 120px;
      background: #f5f5f5;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder {
      font-size: 50px;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item-name {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0;
      color: #333;
      cursor: pointer;
      transition: color 0.2s;
    }

    .item-name:hover {
      color: #667eea;
    }

    .item-price {
      color: #666;
      margin: 0;
      font-size: 1rem;
    }

    .item-stock {
      color: #22c55e;
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .item-stock.out-of-stock {
      color: #ff4444;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 0;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    }

    .qty-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 1.3rem;
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

    .qty-value {
      width: 50px;
      text-align: center;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .item-total {
      text-align: right;
      min-width: 100px;
    }

    .total-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
      margin: 0;
    }

    .item-remove {
      width: 45px;
      height: 45px;
      border: none;
      background: #fff5f5;
      color: #ff4444;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1.3rem;
      transition: all 0.2s;
    }

    .item-remove:hover {
      background: #ff4444;
      color: white;
      transform: scale(1.1);
    }

    /* Cart Summary */
    .cart-summary {
      background: white;
      padding: 30px;
      border-radius: 15px;
      height: fit-content;
      position: sticky;
      top: 100px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .cart-summary h2 {
      font-size: 1.5rem;
      margin: 0 0 25px 0;
      color: #333;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-size: 1rem;
      color: #666;
    }

    .summary-line.total {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin-top: 15px;
    }

    .amount {
      font-weight: 600;
      color: #333;
    }

    .amount.free {
      color: #22c55e;
    }

    .summary-divider {
      height: 2px;
      background: #f0f0f0;
      margin: 20px 0;
    }

    .btn {
      padding: 15px 30px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-block {
      width: 100%;
      margin-bottom: 15px;
    }

    .btn-lg {
      padding: 18px 36px;
      font-size: 18px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #667eea;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .security-badges {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 2px solid #f0f0f0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .badge {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #666;
    }

    /* Empty Cart */
    .empty-cart {
      text-align: center;
      padding: 100px 20px;
    }

    .empty-icon {
      font-size: 100px;
      margin-bottom: 30px;
      opacity: 0.5;
    }

    .empty-cart h2 {
      font-size: 2rem;
      margin: 0 0 15px 0;
      color: #333;
    }

    .empty-cart p {
      color: #666;
      margin: 0 0 40px 0;
      font-size: 1.1rem;
    }

    /* Loading */
    .loading {
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 968px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-summary {
        position: static;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        gap: 15px;
      }

      .item-quantity,
      .item-total {
        grid-column: 2;
      }

      .item-remove {
        grid-column: 2;
        justify-self: end;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cart = signal<Cart | null>(null);
  loading = signal(true);

  totalItems = computed(() => {
    return this.cart()?.items?.reduce((sum, item) => sum + item.quantite, 0) || 0;
  });

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement panier:', err);
        this.loading.set(false);
      }
    });
  }

  updateQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity < 1) return;

    this.cartService.updateItemQuantity(itemId, newQuantity).subscribe({
      next: (cart) => {
        this.cart.set(cart);
      },
      error: (err) => {
        console.error('Erreur mise à jour quantité:', err);
        alert('Erreur lors de la mise à jour de la quantité');
      }
    });
  }

  removeItem(itemId: number): void {
    if (!confirm('Voulez-vous vraiment retirer cet article du panier ?')) {
      return;
    }

    this.cartService.removeItem(itemId).subscribe({
      next: (cart) => {
        this.cart.set(cart);
      },
      error: (err) => {
        console.error('Erreur suppression article:', err);
        alert('Erreur lors de la suppression de l\'article');
      }
    });
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
