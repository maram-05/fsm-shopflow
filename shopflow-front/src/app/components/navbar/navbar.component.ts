import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <a routerLink="/" class="logo">
            <span class="logo-icon">🛍️</span>
            <span class="logo-text">ShopFlow</span>
          </a>
        </div>

        <div class="nav-search">
          <input
            type="search"
            placeholder="Rechercher des produits..."
            class="search-input"
            (keyup.enter)="onSearch($event)"
          />
          <button class="search-btn">🔍</button>
        </div>

        <div class="nav-links">
          @if (!isAuthenticated()) {
            <a routerLink="/login" class="nav-link">
              <span class="icon">👤</span>
              <span>Connexion</span>
            </a>
            <a routerLink="/register" class="nav-link btn-primary">
              Inscription
            </a>
          } @else {
            <a routerLink="/products" routerLinkActive="active" class="nav-link">
              <span class="icon">🏪</span>
              <span>Produits</span>
            </a>
            
            <a routerLink="/cart" routerLinkActive="active" class="nav-link cart-link">
              <span class="icon">🛒</span>
              <span>Panier</span>
              @if (cartItemCount() > 0) {
                <span class="badge">{{ cartItemCount() }}</span>
              }
            </a>

            <a routerLink="/orders" routerLinkActive="active" class="nav-link">
              <span class="icon">📦</span>
              <span>Commandes</span>
            </a>

            <div class="user-menu">
              <button class="user-btn" (click)="toggleUserMenu()">
                <span class="icon">👤</span>
                <span>{{ currentUser()?.prenom }}</span>
                <span class="arrow">▼</span>
              </button>

              @if (showUserMenu()) {
                <div class="user-dropdown">
                  <div class="user-info">
                    <div class="user-name">{{ currentUser()?.prenom }} {{ currentUser()?.nom }}</div>
                    <div class="user-email">{{ currentUser()?.email }}</div>
                    <div class="user-role">{{ getRoleLabel() }}</div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a routerLink="/profile" class="dropdown-item">
                    <span class="icon">⚙️</span>
                    Mon profil
                  </a>
                  @if (currentUser()?.role === 'SELLER' || currentUser()?.role === 'ADMIN') {
                    <a routerLink="/dashboard" class="dropdown-item">
                      <span class="icon">📊</span>
                      Dashboard
                    </a>
                  }
                  <div class="dropdown-divider"></div>
                  <button (click)="logout()" class="dropdown-item logout">
                    <span class="icon">🚪</span>
                    Déconnexion
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 15px 30px;
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .nav-brand .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .nav-search {
      flex: 1;
      max-width: 600px;
      display: flex;
      gap: 10px;
    }

    .search-input {
      flex: 1;
      padding: 10px 20px;
      border: 2px solid #e0e0e0;
      border-radius: 25px;
      font-size: 15px;
      transition: all 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-btn {
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.3s;
    }

    .search-btn:hover {
      background: #5568d3;
      transform: scale(1.05);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      text-decoration: none;
      color: #333;
      border-radius: 10px;
      transition: all 0.3s;
      font-weight: 500;
    }

    .nav-link:hover {
      background: #f5f5f5;
      color: #667eea;
    }

    .nav-link.active {
      background: #667eea;
      color: white;
    }

    .nav-link .icon {
      font-size: 1.2rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .cart-link {
      position: relative;
    }

    .badge {
      position: absolute;
      top: 5px;
      right: 5px;
      background: #ff4444;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }

    .user-menu {
      position: relative;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }

    .user-btn:hover {
      border-color: #667eea;
      color: #667eea;
    }

    .arrow {
      font-size: 10px;
      transition: transform 0.3s;
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      min-width: 250px;
      overflow: hidden;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .user-info {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .user-name {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 5px;
    }

    .user-email {
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 5px;
    }

    .user-role {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .dropdown-divider {
      height: 1px;
      background: #e0e0e0;
      margin: 5px 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      text-decoration: none;
      color: #333;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: 15px;
    }

    .dropdown-item:hover {
      background: #f5f5f5;
      color: #667eea;
    }

    .dropdown-item.logout {
      color: #ff4444;
    }

    .dropdown-item.logout:hover {
      background: #fff5f5;
    }

    @media (max-width: 768px) {
      .nav-container {
        flex-wrap: wrap;
        padding: 15px;
      }

      .nav-search {
        order: 3;
        width: 100%;
        max-width: 100%;
      }

      .nav-links {
        gap: 10px;
      }

      .nav-link span:not(.icon):not(.badge) {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  showUserMenu = signal(false);
  
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    // Charger le panier si l'utilisateur est connecté
    if (this.authService.isAuthenticated()) {
      this.loadCart();
    }
  }

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());
  cartItemCount = computed(() => {
    const cart = this.cartService.cart();
    return cart?.items?.reduce((sum, item) => sum + item.quantite, 0) || 0;
  });

  /**
   * Charge le panier de l'utilisateur connecté
   */
  private loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        console.log('[Navbar] Panier chargé:', cart);
      },
      error: (err) => {
        console.error('[Navbar] Erreur chargement panier:', err);
      }
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  getRoleLabel(): string {
    const role = this.currentUser()?.role;
    const labels: Record<string, string> = {
      'CUSTOMER': '👤 Client',
      'SELLER': '🏪 Vendeur',
      'ADMIN': '👨‍💼 Administrateur'
    };
    return labels[role || 'CUSTOMER'] || 'Client';
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const keyword = input.value.trim();
    if (keyword) {
      this.router.navigate(['/products'], { queryParams: { search: keyword } });
    }
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu.set(false);
    this.router.navigate(['/login']);
  }
}
