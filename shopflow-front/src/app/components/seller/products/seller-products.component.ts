import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
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
        <div class="page-header">
          <div class="header-content">
            <h1>Mes Produits</h1>
            <p>Gérez votre catalogue de produits</p>
          </div>
          <a routerLink="/seller/products/new" class="btn btn-primary">
            ➕ Ajouter un produit
          </a>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
          <div class="search-box">
            <input
              type="search"
              placeholder="Rechercher un produit..."
              [(ngModel)]="searchQuery"
              (input)="filterProducts()"
              class="search-input"
            />
          </div>
          <select [(ngModel)]="statusFilter" (change)="filterProducts()" class="status-filter">
            <option value="">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="out-of-stock">Rupture de stock</option>
          </select>
        </div>

        @if (loading()) {
          <div class="loading">
            <div class="spinner-large"></div>
            <p>Chargement des produits...</p>
          </div>
        } @else if (filteredProducts().length > 0) {
          <!-- Products Table -->
          <div class="products-table">
            <div class="table-header">
              <div class="col-product">Produit</div>
              <div class="col-price">Prix</div>
              <div class="col-stock">Stock</div>
              <div class="col-status">Statut</div>
              <div class="col-actions">Actions</div>
            </div>

            @for (product of filteredProducts(); track product.id) {
              <div class="table-row">
                <div class="col-product">
                  <div class="product-info">
                    <div class="product-image">
                      @if (product.images && product.images.length > 0) {
                        <img [src]="product.images[0]" [alt]="product.nom" />
                      } @else if (product.imageUrl) {
                        <img [src]="product.imageUrl" [alt]="product.nom" />
                      } @else {
                        <div class="placeholder">📦</div>
                      }
                    </div>
                    <div class="product-details">
                      <h3>{{ product.nom }}</h3>
                      <p>{{ product.description | slice:0:80 }}{{ product.description.length > 80 ? '...' : '' }}</p>
                      <span class="product-sku">SKU: {{ product.sku }}</span>
                    </div>
                  </div>
                </div>

                <div class="col-price">
                  @if (product.prixPromo && product.prixPromo < product.prix) {
                    <div class="price-promo">{{ product.prixPromo }}€</div>
                    <div class="price-original">{{ product.prix }}€</div>
                  } @else {
                    <div class="price-current">{{ product.prix }}€</div>
                  }
                </div>

                <div class="col-stock">
                  <div class="stock-info" [class]="getStockClass(product.stock)">
                    {{ product.stock || 0 }} unités
                  </div>
                </div>

                <div class="col-status">
                  <span class="status-badge" [class]="getStatusClass(product)">
                    {{ getStatusLabel(product) }}
                  </span>
                </div>

                <div class="col-actions">
                  <div class="action-buttons">
                    <button class="btn-icon" (click)="viewProduct(product.id)" title="Voir">
                      👁️
                    </button>
                    <button class="btn-icon" (click)="editProduct(product.id)" title="Modifier">
                      ✏️
                    </button>
                    <button class="btn-icon danger" (click)="deleteProduct(product.id)" title="Supprimer">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h2>Aucun produit trouvé</h2>
            <p>Commencez par ajouter votre premier produit à votre boutique</p>
            <a routerLink="/seller/products/new" class="btn btn-primary btn-lg">
              ➕ Ajouter un produit
            </a>
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
       SIDEBAR (Réutilisé)
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

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: var(--text);
    }

    .header-content p {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin: 0;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       FILTERS BAR
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .filters-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;
    }

    .search-box {
      flex: 1;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15);
    }

    .status-filter {
      padding: 12px 16px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      outline: none;
      background: white;
      min-width: 180px;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       PRODUCTS TABLE
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .products-table {
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr auto auto auto auto;
      gap: 16px;
      padding: 20px 24px;
      background: var(--bg);
      border-bottom: 2px solid var(--border);
      font-weight: 600;
      color: var(--text);
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr auto auto auto auto;
      gap: 16px;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      align-items: center;
      transition: background 0.2s ease;
    }

    .table-row:hover {
      background: rgba(108, 99, 255, 0.05);
    }

    .table-row:last-child {
      border-bottom: none;
    }

    /* Product Column */
    .product-info {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .product-image {
      width: 60px;
      height: 60px;
      background: var(--bg);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder {
      font-size: 1.5rem;
    }

    .product-details h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: var(--text);
    }

    .product-details p {
      color: var(--text-muted);
      margin: 0 0 4px 0;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .product-sku {
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* Price Column */
    .price-current {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary);
    }

    .price-promo {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--secondary);
    }

    .price-original {
      font-size: 0.9rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }

    /* Stock Column */
    .stock-info {
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.85rem;
    }

    .stock-info.in-stock {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .stock-info.low-stock {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
    }

    .stock-info.out-of-stock {
      background: rgba(255, 71, 87, 0.1);
      color: #ff4757;
    }

    /* Status Column */
    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .status-badge.inactive {
      background: rgba(156, 163, 175, 0.1);
      color: #9ca3af;
    }

    .status-badge.out-of-stock {
      background: rgba(255, 71, 87, 0.1);
      color: #ff4757;
    }

    /* Actions Column */
    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--radius-sm);
      background: rgba(108, 99, 255, 0.1);
      color: var(--primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .btn-icon:hover {
      background: var(--primary);
      color: white;
      transform: scale(1.1);
    }

    .btn-icon.danger {
      background: rgba(255, 71, 87, 0.1);
      color: #ff4757;
    }

    .btn-icon.danger:hover {
      background: #ff4757;
      color: white;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       EMPTY STATE & LOADING
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .loading,
    .empty-state {
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

    .empty-icon {
      font-size: 100px;
      margin-bottom: 30px;
      opacity: 0.5;
    }

    .empty-state h2 {
      font-size: 2rem;
      margin: 0 0 15px 0;
      color: var(--text);
    }

    .empty-state p {
      color: var(--text-muted);
      margin: 0 0 40px 0;
      font-size: 1.1rem;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       RESPONSIVE
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @media (max-width: 768px) {
      .seller-dashboard {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: none;
      }

      .main-content {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filters-bar {
        flex-direction: column;
        gap: 12px;
      }

      .products-table {
        overflow-x: auto;
      }

      .table-header,
      .table-row {
        grid-template-columns: 250px 80px 80px 100px 120px;
        min-width: 630px;
      }
    }
  `]
})
export class SellerProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  loading = signal(true);
  searchQuery = '';
  statusFilter = '';

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    
    // TODO: Implémenter l'API pour récupérer les produits du vendeur connecté
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.filteredProducts.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement produits:', err);
        this.loading.set(false);
      }
    });
  }

  filterProducts(): void {
    let filtered = [...this.products()];

    // Filtrer par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.nom.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      );
    }

    // Filtrer par statut
    if (this.statusFilter) {
      filtered = filtered.filter(p => {
        switch (this.statusFilter) {
          case 'active':
            return p.stock && p.stock > 0;
          case 'inactive':
            return !p.actif;
          case 'out-of-stock':
            return !p.stock || p.stock === 0;
          default:
            return true;
        }
      });
    }

    this.filteredProducts.set(filtered);
  }

  getStockClass(stock: number | undefined): string {
    if (!stock || stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  getStatusClass(product: Product): string {
    if (!product.stock || product.stock === 0) return 'out-of-stock';
    if (!product.actif) return 'inactive';
    return 'active';
  }

  getStatusLabel(product: Product): string {
    if (!product.stock || product.stock === 0) return 'Rupture';
    if (!product.actif) return 'Inactif';
    return 'Actif';
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  editProduct(productId: number): void {
    this.router.navigate(['/seller/products', productId, 'edit']);
  }

  deleteProduct(productId: number): void {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      return;
    }

    // TODO: Implémenter l'API de suppression
    console.log('Suppression du produit:', productId);
    alert('Fonctionnalité de suppression à implémenter');
  }
}