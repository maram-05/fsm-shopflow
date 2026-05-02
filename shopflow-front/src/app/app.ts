import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Logo -->
        <a routerLink="/" class="nav-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"/>
          </svg>
          <span>ShopFlow</span>
        </a>

        <!-- Navigation Links -->
        <div class="nav-links">
          <a routerLink="/products" routerLinkActive="active" class="nav-link">Products</a>
          <a routerLink="/promotions" routerLinkActive="active" class="nav-link">Deals</a>
        </div>

        <!-- User Actions -->
        <div class="nav-actions">
          @if (!isAuthenticated()) {
            <!-- Not authenticated -->
            <a routerLink="/auth/login" class="btn btn-ghost btn-sm">Sign In</a>
            <a routerLink="/auth/register" class="btn btn-primary btn-sm">Get Started</a>
          } @else {
            <!-- Authenticated -->
            @if (currentUser()?.role === 'CUSTOMER') {
              <!-- Customer -->
              <a routerLink="/cart" class="cart-button" routerLinkActive="active">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"/>
                </svg>
                @if (cartItemCount() > 0) {
                  <span class="cart-badge">{{ cartItemCount() }}</span>
                }
              </a>
              <a routerLink="/orders" class="nav-link">Orders</a>
            }
            
            @if (currentUser()?.role === 'SELLER') {
              <!-- Seller -->
              <a routerLink="/seller" class="nav-link" routerLinkActive="active">Dashboard</a>
            }
            
            @if (currentUser()?.role === 'ADMIN') {
              <!-- Admin -->
              <a routerLink="/admin" class="nav-link" routerLinkActive="active">Admin</a>
            }

            <!-- User Menu -->
            <div class="user-menu" [class.open]="showUserMenu()">
              <button class="user-button" (click)="toggleUserMenu()">
                <div class="user-avatar">
                  {{ currentUser()?.prenom?.charAt(0) }}{{ currentUser()?.nom?.charAt(0) }}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>
              
              @if (showUserMenu()) {
                <div class="user-dropdown">
                  <div class="dropdown-header">
                    <div class="user-info">
                      <div class="user-name">{{ currentUser()?.prenom }} {{ currentUser()?.nom }}</div>
                      <div class="user-email">{{ currentUser()?.email }}</div>
                    </div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a routerLink="/profile" class="dropdown-item" (click)="closeUserMenu()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile Settings
                  </a>
                  <button class="dropdown-item logout" (click)="logout()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       MODERN NAVBAR
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    
    .navbar {
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-light);
      height: 64px;
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(8px);
      background: rgba(255, 255, 255, 0.95);
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--text-primary);
      text-decoration: none;
      font-size: var(--text-xl);
      font-weight: 700;
      transition: color var(--transition-base);
    }

    .nav-logo:hover {
      color: var(--primary);
    }

    .nav-logo svg {
      color: var(--primary);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-8);
    }

    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: var(--text-sm);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
      position: relative;
    }

    .nav-link:hover,
    .nav-link.active {
      color: var(--primary);
      background: var(--primary-50);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .cart-button {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-lg);
      color: var(--text-secondary);
      text-decoration: none;
      transition: all var(--transition-base);
    }

    .cart-button:hover,
    .cart-button.active {
      color: var(--primary);
      background: var(--primary-50);
    }

    .cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--danger);
      color: white;
      border-radius: var(--radius-full);
      width: 18px;
      height: 18px;
      font-size: var(--text-xs);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bg-primary);
    }

    /* User Menu */
    .user-menu {
      position: relative;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1);
      background: transparent;
      border: none;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .user-button:hover {
      background: var(--gray-100);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      background: var(--primary);
      color: white;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
    }

    .chevron {
      color: var(--text-quaternary);
      transition: transform var(--transition-base);
    }

    .user-menu.open .chevron {
      transform: rotate(180deg);
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      min-width: 240px;
      overflow: hidden;
      z-index: 1001;
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-header {
      padding: var(--space-4);
      background: var(--gray-50);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .user-name {
      font-weight: 600;
      font-size: var(--text-sm);
      color: var(--text-primary);
    }

    .user-email {
      font-size: var(--text-xs);
      color: var(--text-tertiary);
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-light);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      text-decoration: none;
      color: var(--text-secondary);
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: var(--text-sm);
      font-weight: 500;
      transition: all var(--transition-base);
    }

    .dropdown-item:hover {
      background: var(--gray-50);
      color: var(--text-primary);
    }

    .dropdown-item.logout {
      color: var(--danger);
      border-top: 1px solid var(--border-light);
    }

    .dropdown-item.logout:hover {
      background: var(--danger-light);
    }

    .main-content {
      min-height: calc(100vh - 64px);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       RESPONSIVE
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @media (max-width: 768px) {
      .navbar-container {
        padding: 0 var(--space-4);
      }
      
      .nav-links {
        display: none; /* TODO: Add mobile menu */
      }
      
      .nav-actions {
        gap: var(--space-2);
      }
      
      .nav-link {
        padding: var(--space-1) var(--space-2);
        font-size: var(--text-xs);
      }
    }
  `]
})
export class App {
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
        console.log('[App] Panier chargé:', cart);
      },
      error: (err) => {
        console.error('[App] Erreur chargement panier:', err);
      }
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu.set(false);
    this.router.navigate(['/']);
  }
}
