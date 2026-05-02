import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="seller-dashboard">
      <!-- Sidebar -->
      <nav class="sidebar">
        <div class="sidebar-header">
          <h2>🏪 Ma Boutique</h2>
        </div>
        <ul class="sidebar-menu">
          <li>
            <a routerLink="/seller" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              📊 Tableau de bord
            </a>
          </li>
          <li>
            <a routerLink="/seller/products" routerLinkActive="active">
              📦 Mes produits
            </a>
          </li>
          <li>
            <a routerLink="/seller/orders" routerLinkActive="active">
              🛒 Commandes
            </a>
          </li>
          <li>
            <a routerLink="/seller/profile" routerLinkActive="active">
              ⚙️ Profil boutique
            </a>
          </li>
        </ul>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <div class="dashboard-header">
          <h1>Tableau de bord</h1>
          <p>Gérez votre boutique et suivez vos performances</p>
        </div>

        @if (loading()) {
          <div class="loading">
            <div class="spinner-large"></div>
            <p>Chargement des statistiques...</p>
          </div>
        } @else {
          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📦</div>
              <div class="stat-content">
                <h3>{{ stats().totalProducts }}</h3>
                <p>Produits en ligne</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">🛒</div>
              <div class="stat-content">
                <h3>{{ stats().totalOrders }}</h3>
                <p>Commandes totales</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <h3>{{ stats().totalRevenue }}€</h3>
                <p>Chiffre d'affaires</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">⏳</div>
              <div class="stat-content">
                <h3>{{ stats().pendingOrders }}</h3>
                <p>Commandes en attente</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h2>Actions rapides</h2>
            <div class="actions-grid">
              <a routerLink="/seller/products/new" class="action-card">
                <div class="action-icon">➕</div>
                <h3>Ajouter un produit</h3>
                <p>Créer un nouveau produit dans votre boutique</p>
              </a>

              <a routerLink="/seller/orders" class="action-card">
                <div class="action-icon">📋</div>
                <h3>Gérer les commandes</h3>
                <p>Voir et traiter les commandes en cours</p>
              </a>

              <a routerLink="/seller/products" class="action-card">
                <div class="action-icon">📊</div>
                <h3>Gérer l'inventaire</h3>
                <p>Mettre à jour les stocks et prix</p>
              </a>

              <a routerLink="/seller/profile" class="action-card">
                <div class="action-icon">⚙️</div>
                <h3>Paramètres boutique</h3>
                <p>Configurer votre profil vendeur</p>
              </a>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="recent-activity">
            <h2>Activité récente</h2>
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon">🛒</div>
                <div class="activity-content">
                  <h4>Nouvelle commande reçue</h4>
                  <p>Commande #12345 - 89.99€</p>
                  <span class="activity-time">Il y a 2 heures</span>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-icon">📦</div>
                <div class="activity-content">
                  <h4>Produit ajouté</h4>
                  <p>Nouveau produit "Smartphone XYZ" publié</p>
                  <span class="activity-time">Il y a 1 jour</span>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-icon">⭐</div>
                <div class="activity-content">
                  <h4>Nouvel avis client</h4>
                  <p>Avis 5 étoiles sur "Laptop ABC"</p>
                  <span class="activity-time">Il y a 2 jours</span>
                </div>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .seller-dashboard {
      display: grid;
      grid-template-columns: 280px 1fr;
      min-height: calc(100vh - 70px);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       SIDEBAR
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .sidebar {
      background: white;
      border-right: 2px solid var(--border);
      padding: 0;
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 2px solid var(--border);
    }

    .sidebar-header h2 {
      margin: 0;
      color: var(--primary);
      font-size: 1.4rem;
      font-weight: 700;
    }

    .sidebar-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-menu li {
      border-bottom: 1px solid var(--border);
    }

    .sidebar-menu a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .sidebar-menu a:hover,
    .sidebar-menu a.active {
      background: rgba(108, 99, 255, 0.1);
      color: var(--primary);
      border-right: 3px solid var(--primary);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       MAIN CONTENT
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .main-content {
      padding: 32px;
      background: var(--bg);
      overflow-y: auto;
    }

    .dashboard-header {
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: var(--text);
    }

    .dashboard-header p {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin: 0;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       STATS GRID
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(108, 99, 255, 0.1);
      border-radius: 50%;
    }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 4px 0;
      color: var(--primary);
    }

    .stat-content p {
      color: var(--text-muted);
      margin: 0;
      font-size: 0.9rem;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       QUICK ACTIONS
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .quick-actions {
      margin-bottom: 48px;
    }

    .quick-actions h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: var(--text);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .action-card {
      background: white;
      padding: 24px;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      border: 2px solid transparent;
    }

    .action-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
      box-shadow: 0 8px 32px rgba(108, 99, 255, 0.15);
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }

    .action-card h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--text);
    }

    .action-card p {
      color: var(--text-muted);
      margin: 0;
      line-height: 1.5;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       RECENT ACTIVITY
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .recent-activity h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: var(--text);
    }

    .activity-list {
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(108, 99, 255, 0.1);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .activity-content h4 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: var(--text);
    }

    .activity-content p {
      color: var(--text-muted);
      margin: 0 0 4px 0;
      font-size: 0.9rem;
    }

    .activity-time {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       LOADING
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .loading {
      text-align: center;
      padding: 80px 20px;
    }

    .spinner-large {
      width: 60px;
      height: 60px;
      border: 4px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       RESPONSIVE
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @media (max-width: 768px) {
      .seller-dashboard {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: none; /* TODO: Add mobile menu */
      }

      .main-content {
        padding: 16px;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .actions-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class SellerDashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  constructor(
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading.set(true);
    
    // Simuler le chargement des statistiques
    // TODO: Implémenter les vraies API calls quand les services backend seront prêts
    setTimeout(() => {
      this.stats.set({
        totalProducts: 24,
        totalOrders: 156,
        totalRevenue: 12450,
        pendingOrders: 8
      });
      this.loading.set(false);
    }, 1000);
  }
}