import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { AddressService } from '../../services/address.service';
import { Cart } from '../../models/cart.model';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="checkout-container">
      <h1 class="page-title">💳 Finaliser la commande</h1>

      @if (loading()) {
        <div class="loading">
          <div class="spinner-large"></div>
          <p>Chargement...</p>
        </div>
      } @else if (cart() && cart()!.items && cart()!.items.length > 0) {
        <div class="checkout-content">
          <!-- Checkout Form -->
          <div class="checkout-form">
            <!-- Shipping Address -->
            <div class="form-section">
              <h2>📍 Adresse de livraison</h2>
              <form #addressForm="ngForm">
                <div class="form-row">
                  <div class="form-group">
                    <label>Rue *</label>
                    <input
                      type="text"
                      [(ngModel)]="shippingAddress.rue"
                      name="rue"
                      required
                      placeholder="123 Rue de la Paix"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Ville *</label>
                    <input
                      type="text"
                      [(ngModel)]="shippingAddress.ville"
                      name="ville"
                      required
                      placeholder="Paris"
                    />
                  </div>

                  <div class="form-group">
                    <label>Code postal *</label>
                    <input
                      type="text"
                      [(ngModel)]="shippingAddress.codePostal"
                      name="codePostal"
                      required
                      placeholder="75001"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Pays *</label>
                    <input
                      type="text"
                      [(ngModel)]="shippingAddress.pays"
                      name="pays"
                      required
                      placeholder="France"
                    />
                  </div>
                </div>
              </form>
            </div>

            <!-- Coupon Code -->
            <div class="form-section">
              <h2>🎟️ Code promo</h2>
              <div class="coupon-input">
                <input
                  type="text"
                  [(ngModel)]="couponCode"
                  placeholder="Entrez votre code promo"
                  class="coupon-field"
                />
                <button class="btn btn-secondary" (click)="applyCoupon()">
                  Appliquer
                </button>
              </div>
              @if (couponMessage()) {
                <div class="coupon-message" [class.success]="couponSuccess()">
                  {{ couponMessage() }}
                </div>
              }
            </div>

            <!-- Payment Method -->
            <div class="form-section">
              <h2>💳 Mode de paiement</h2>
              <div class="payment-methods">
                <label class="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    [(ngModel)]="paymentMethod"
                  />
                  <div class="payment-card">
                    <span class="payment-icon">💳</span>
                    <span>Carte bancaire</span>
                  </div>
                </label>

                <label class="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    [(ngModel)]="paymentMethod"
                  />
                  <div class="payment-card">
                    <span class="payment-icon">🅿️</span>
                    <span>PayPal</span>
                  </div>
                </label>

                <label class="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    [(ngModel)]="paymentMethod"
                  />
                  <div class="payment-card">
                    <span class="payment-icon">🏦</span>
                    <span>Virement bancaire</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="order-summary">
            <h2>Récapitulatif</h2>

            <div class="summary-items">
              @for (item of cart()!.items; track item.id) {
                <div class="summary-item">
                  <div class="item-details">
                    <span class="item-name">{{ item.productNom }}</span>
                    <span class="item-qty">x{{ item.quantite }}</span>
                  </div>
                  <span class="item-price">{{ item.sousTotal }}€</span>
                </div>
              }
            </div>

            <div class="summary-divider"></div>

            <div class="summary-line">
              <span>Sous-total</span>
              <span class="amount">{{ cart()!.montantTotal }}€</span>
            </div>

            <div class="summary-line">
              <span>Livraison</span>
              <span class="amount free">Gratuite</span>
            </div>

            @if (discount() > 0) {
              <div class="summary-line discount">
                <span>Réduction</span>
                <span class="amount">-{{ discount() }}€</span>
              </div>
            }

            <div class="summary-divider"></div>

            <div class="summary-line total">
              <span>Total</span>
              <span class="amount">{{ finalTotal() }}€</span>
            </div>

            <button
              class="btn btn-primary btn-block btn-lg"
              (click)="placeOrder()"
              [disabled]="placing() || !isFormValid()"
            >
              @if (placing()) {
                <span class="spinner"></span>
                Commande en cours...
              } @else {
                Confirmer la commande
              }
            </button>

            <div class="security-info">
              <p>🔒 Paiement 100% sécurisé</p>
              <p>✓ Vos données sont protégées</p>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h2>Votre panier est vide</h2>
          <p>Ajoutez des produits avant de passer commande</p>
          <a routerLink="/products" class="btn btn-primary btn-lg">
            Découvrir les produits
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-container {
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

    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 450px;
      gap: 30px;
    }

    /* Checkout Form */
    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .form-section {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .form-section h2 {
      font-size: 1.5rem;
      margin: 0 0 25px 0;
      color: #333;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-row:last-child {
      margin-bottom: 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .form-group input {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 15px;
      transition: all 0.3s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .coupon-input {
      display: flex;
      gap: 15px;
    }

    .coupon-field {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 15px;
    }

    .coupon-field:focus {
      outline: none;
      border-color: #667eea;
    }

    .coupon-message {
      margin-top: 15px;
      padding: 12px 16px;
      border-radius: 10px;
      background: #fff5f5;
      color: #ff4444;
      font-size: 14px;
    }

    .coupon-message.success {
      background: #f0fdf4;
      color: #22c55e;
    }

    .payment-methods {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .payment-option {
      cursor: pointer;
    }

    .payment-option input {
      display: none;
    }

    .payment-card {
      padding: 20px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      text-align: center;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .payment-option input:checked + .payment-card {
      border-color: #667eea;
      background: #f5f7ff;
    }

    .payment-card:hover {
      border-color: #667eea;
    }

    .payment-icon {
      font-size: 2rem;
    }

    /* Order Summary */
    .order-summary {
      background: white;
      padding: 30px;
      border-radius: 15px;
      height: fit-content;
      position: sticky;
      top: 100px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .order-summary h2 {
      font-size: 1.5rem;
      margin: 0 0 25px 0;
      color: #333;
    }

    .summary-items {
      margin-bottom: 20px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .item-name {
      color: #333;
      font-weight: 500;
    }

    .item-qty {
      color: #666;
      font-size: 13px;
    }

    .item-price {
      font-weight: 600;
      color: #667eea;
    }

    .summary-divider {
      height: 2px;
      background: #f0f0f0;
      margin: 20px 0;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-size: 1rem;
      color: #666;
    }

    .summary-line.discount {
      color: #22c55e;
    }

    .summary-line.total {
      font-size: 1.8rem;
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

    .btn-block {
      width: 100%;
      margin-top: 25px;
    }

    .btn-lg {
      padding: 18px 36px;
      font-size: 18px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #667eea;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
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

    .security-info {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 2px solid #f0f0f0;
      text-align: center;
    }

    .security-info p {
      margin: 8px 0;
      color: #666;
      font-size: 14px;
    }

    /* Loading & Empty States */
    .loading,
    .empty-state {
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

    .empty-icon {
      font-size: 100px;
      margin-bottom: 30px;
      opacity: 0.5;
    }

    .empty-state h2 {
      font-size: 2rem;
      margin: 0 0 15px 0;
      color: #333;
    }

    .empty-state p {
      color: #666;
      margin: 0 0 40px 0;
      font-size: 1.1rem;
    }

    /* Responsive */
    @media (max-width: 968px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .payment-methods {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cart = signal<Cart | null>(null);
  loading = signal(true);
  placing = signal(false);
  discount = signal(0);
  couponMessage = signal('');
  couponSuccess = signal(false);

  shippingAddress = {
    rue: '',
    ville: '',
    codePostal: '',
    pays: 'France'
  };

  couponCode = '';
  paymentMethod = 'card';

  finalTotal = signal(0);

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
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
        this.finalTotal.set(cart.montantTotal);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement panier:', err);
        this.loading.set(false);
      }
    });
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponMessage.set('Veuillez entrer un code promo');
      this.couponSuccess.set(false);
      return;
    }

    // Simulation de l'application du coupon
    // Dans une vraie application, cela ferait un appel API
    const validCoupons: Record<string, number> = {
      'BIENVENUE10': 10,
      'PROMO20': 20,
      'REDUC50': 50
    };

    const discountValue = validCoupons[this.couponCode.toUpperCase()];
    
    if (discountValue) {
      const cartTotal = this.cart()?.montantTotal || 0;
      const discountAmount = this.couponCode.toUpperCase() === 'REDUC50' 
        ? discountValue 
        : (cartTotal * discountValue) / 100;
      
      this.discount.set(discountAmount);
      this.finalTotal.set(Math.max(0, cartTotal - discountAmount));
      this.couponMessage.set(`✓ Code promo appliqué ! -${discountAmount.toFixed(2)}€`);
      this.couponSuccess.set(true);
    } else {
      this.couponMessage.set('Code promo invalide');
      this.couponSuccess.set(false);
      this.discount.set(0);
      this.finalTotal.set(this.cart()?.montantTotal || 0);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.shippingAddress.rue &&
      this.shippingAddress.ville &&
      this.shippingAddress.codePostal &&
      this.shippingAddress.pays &&
      this.paymentMethod
    );
  }

  placeOrder(): void {
    if (!this.isFormValid()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.placing.set(true);

    // Créer l'adresse d'abord
    const addressData = {
      rue: this.shippingAddress.rue,
      ville: this.shippingAddress.ville,
      codePostal: this.shippingAddress.codePostal,
      pays: this.shippingAddress.pays,
      principal: true
    };

    console.log('Création de l\'adresse:', addressData);

    this.addressService.createAddress(addressData).pipe(
      switchMap(address => {
        console.log('✅ Adresse créée:', address);
        // Maintenant créer la commande avec l'ID de l'adresse
        const orderRequest = {
          addressId: address.id!,
          codeCoupon: this.couponCode || undefined
        };
        return this.orderService.createOrder(orderRequest);
      })
    ).subscribe({
      next: (order) => {
        this.placing.set(false);
        alert('✓ Commande passée avec succès !');
        this.router.navigate(['/orders', order.id]);
      },
      error: (err) => {
        console.error('Erreur création commande:', err);
        this.placing.set(false);
        alert('Erreur lors de la création de la commande. Veuillez réessayer.');
      }
    });
  }
}
