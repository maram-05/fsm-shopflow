import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-dashboard">
      <!-- Sidebar -->
      <nav class="sidebar">
        <div class="sidebar-header">
          <h2>⚡ Administration</h2>
        </div>
        <ul class="sidebar-menu">
          <li>
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              📊 Tableau de bord
            </a>
          </li>
          <li>
            <a routerLink="/admin/users" routerLinkActive="active">
              👥 Utilisateurs
            </a>
          </li>
          <li>
            <a routerLink="/admin/products" routerLinkActive="active">
              📦 Produits
            </a>
          </li>
          <li>
            <a routerLink="/admin/orders" routerLinkActive="active">
              🛒 Commandes
            </a>
          </li>
          <li>
            <a routerLink="/admin/categories" routerLinkActive="active">
              🏷️ Catégories
            </a>
          </li>
          <li>
            <a routerLink="/admin/coupons" routerLinkActive="active">
              🎫 Coupons
            </a>
          </li>
        </ul>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <div class="dashboard-header">
          <h1>Tableau de bord administrateur</h1>
          <p>Vue d'ensemble de la plateforme ShopFlow</p>
        </div>

        @if (loading()) {
          <div class="loading">
            <div class="spinner-large"></div>
            <p>Chargement des statistiques...</p>
          </div>
        } @else {
          <!-- Main Stats -->
          <div class="stats-grid">
            <div class="stat-card primary">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <h3>{{ stats().totalUsers }}</h3>
                <p>Utilisateurs totaux</p>
                <span class="stat-change positive">+{{ stats().newUsersToday }} aujourd'hui</span>
              </div>
            </div>

            <div class="stat-card success">
              <div class="stat-icon">📦</div>
              <div class="stat-content">
                <h3>{{ stats().totalProducts }}</h3>
                <p>Produits en ligne</p>
                <span class="stat-change">Catalogue actif</span>
              </div>
            </div>

            <div class="stat-card warning">
              <div class="stat-icon">🛒</div>
              <div class="stat-content">
                <h3>{{ stats().totalOrders }}</h3>
                <p>Commandes totales</p>
                <span class="stat-change positive">+{{ stats().ordersToday }} aujourd'hui</span>
              </div>
            </div>

            <div class="stat-card secondary">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <h3>{{ stats().totalRevenue | number:'1.0-0' }}€</h3>
                <p>Chiffre d'affaires</p>
                <span class="stat-change positive">+{{ stats().revenueToday | number:'1.0-0' }}€ aujourd'hui</span>
              </div>
            </div>
          </div>

          <!-- Today's Overview -->
          <div class="today-overview">
            <h2>Aperçu du jour</h2>
            <div class="overview-grid">
              <div class="overview-card">
                <div class="overview-header">
                  <h3>Nouveaux utilisateurs</h3>
                  <span class="overview-number">{{ stats().newUsersToday }}</span>
                </div>
                <div class="overview-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="(stats().newUsersToday / 50) * 100"></div>
                  </div>
                  <span class="progress-text">Objectif: 50/jour</span>
                </div>
              </div>

              <div class="overview-card">
                <div class="overview-header">
                  <h3>Commandes du jour</h3>
                  <span class="overview-number">{{ stats().ordersToday }}</span>
                </div>
                <div class="overview-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="(stats().ordersToday / 100) * 100"></div>
                  </div>
                  <span class="progress-text">Objectif: 100/jour</span>
                </div>
              </div>

              <div class="overview-card">
                <div class="overview-header">
                  <h3>Commandes en attente</h3>
                  <span class="overview-number alert">{{ stats().pendingOrders }}</span>
                </div>
                <div class="overview-actions">
                  <a routerLink="/admin/orders" class="btn btn-sm btn-primary">
                    Traiter les commandes
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h2>Actions rapides</h2>
            <div class="actions-grid">
              <a routerLink="/admin/users" class="action-card">
                <div class="action-icon">👥</div>
                <h3>Gérer les utilisateurs</h3>
                <p>Modérer les comptes et gérer les rôles</p>
              </a>

              <a routerLink="/admin/products" class="action-card">
                <div class="action-icon">📦</div>
                <h3>Modérer les produits</h3>
                <p>Valider et gérer le catalogue</p>
              </a>

              <a routerLink="/admin/categories" class="action-card">
                <div class="action-icon">🏷️</div>
                <h3>Gérer les catégories</h3>
                <p>Organiser la structure du catalogue</p>
              </a>

              <a routerLink="/admin/coupons" class="action-card">
                <div class="action-icon">🎫</div>
                <h3>Créer des coupons</h3>
                <p>Gérer les promotions et réductions</p>
              </a>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="recent-activity">
            <h2>Activité récente</h2>
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon user">👤</div>
                <div class="activity-content">
                  <h4>Nouvel utilisateur inscrit</h4>
                  <p>Marie Dubois s'est inscrite comme vendeuse</p>
                  <span class="activity-time">Il y a 15 minutes</span>
                </div>
                <div class="activity-action">
                  <button class="btn btn-sm btn-outline">Valider</button>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-icon product">📦</div>
                <div class="activity-content">
                  <h4>Produit signalé</h4>
                  <p>Le produit "Smartphone XYZ" a été signalé par un utilisateur</p>
                  <span class="activity-time">Il y a 1 heure</span>
                </div>
                <div class="activity-action">
                  <button class="btn btn-sm btn-warning">Examiner</button>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-icon order">🛒</div>
                <div class="activity-content">
                  <h4>Commande litigieuse</h4>
                  <p>Commande #12345 - Demande de remboursement</p>
                  <span class="activity-time">Il y a 2 heures</span>
                </div>
                <div class="activity-action">
                  <button class="btn btn-sm btn-danger">Traiter</button>
                </div>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      display: grid;
      grid-template-columns: 280px 1fr;
      min-height: calc(100vh - 70px);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       SIDEBAR
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .sidebar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0;
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .sidebar-header h2 {
      margin: 0;
      color: white;
      font-size: 1.4rem;
      font-weight: 700;
    }

    .sidebar-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-menu li {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-menu a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .sidebar-menu a:hover,
    .sidebar-menu a.active {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border-right: 3px solid white;
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
      border-left: 4px solid var(--primary);
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-card.primary { border-left-color: var(--primary); }
    .stat-card.success { border-left-color: var(--success); }
    .stat-card.warning { border-left-color: var(--warning); }
    .stat-card.secondary { border-left-color: var(--secondary); }

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
      color: var(--text);
    }

    .stat-content p {
      color: var(--text-muted);
      margin: 0 0 8px 0;
      font-size: 0.9rem;
    }

    .stat-change {
      font-size: 0.8rem;
      padding: 2px 8px;
      border-radius: 12px;
      background: var(--bg);
      color: var(--text-muted);
    }

    .stat-change.positive {
      background: rgba(34, 197, 94, 0.1);
      color: var(--success);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       TODAY'S OVERVIEW
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .today-overview {
      margin-bottom: 48px;
    }

    .today-overview h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: var(--text);
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .overview-card {
      background: white;
      padding: 24px;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .overview-header h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: var(--text);
    }

    .overview-number {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--primary);
    }

    .overview-number.alert {
      color: var(--danger);
    }

    .overview-progress {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .progress-bar {
      height: 8px;
      background: var(--bg);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .overview-actions {
      margin-top: 16px;
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
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;
      font-size: 1.2rem;
    }

    .activity-icon.user { background: rgba(108, 99, 255, 0.1); }
    .activity-icon.product { background: rgba(34, 197, 94, 0.1); }
    .activity-icon.order { background: rgba(255, 184, 48, 0.1); }

    .activity-content {
      flex: 1;
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

    .activity-action {
      flex-shrink: 0;
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
      .admin-dashboard {
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

      .overview-grid,
      .actions-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .activity-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .activity-action {
        width: 100%;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  loading = signal(true);
  stats = signal<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0
  });

  constructor() {}

  ngOnInit(): void {
    this.loadAdminStats();
  }

  loadAdminStats(): void {
    this.loading.set(true);
    
    // Simuler le chargement des statistiques admin
    // TODO: Implémenter les vraies API calls quand les services backend seront prêts
    setTimeout(() => {
      this.stats.set({
        totalUsers: 1247,
        totalProducts: 3456,
        totalOrders: 8923,
        totalRevenue: 245670,
        newUsersToday: 23,
        ordersToday: 67,
        revenueToday: 3420,
        pendingOrders: 12
      });
      this.loading.set(false);
    }, 1000);
  }
}