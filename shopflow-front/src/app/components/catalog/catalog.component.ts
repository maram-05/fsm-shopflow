import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Barre de recherche -->
      <div class="search-bar">
        <input
          type="search"
          placeholder="Rechercher des produits..."
          [(ngModel)]="searchQuery"
          (keyup.enter)="onSearch()"
          class="search-input"
        />
        <button class="btn btn-primary" (click)="onSearch()">
          Rechercher
        </button>
      </div>

      <!-- Filtres par catégorie -->
      @if (categories().length > 0) {
        <div class="categories-filter">
          <button
            class="category-btn"
            [class.active]="selectedCategoryId === null"
            (click)="filterByCategory(null)"
          >
            Toutes les catégories
          </button>
          @for (category of categories(); track category.id) {
            <button
              class="category-btn"
              [class.active]="selectedCategoryId === category.id"
              (click)="filterByCategory(category.id)"
            >
              {{ category.nom }}
            </button>
          }
        </div>
      }

      <!-- État de chargement avec spinner -->
      @if (loading()) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p class="loading-text">Chargement des produits...</p>
          <p class="loading-subtext">Veuillez patienter</p>
        </div>
      }

      <!-- État d'erreur -->
      @else if (error()) {
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Erreur de chargement</h3>
          <p>{{ errorMessage() }}</p>
          <button class="btn btn-primary" (click)="loadProducts()">
            Réessayer
          </button>
        </div>
      }

      <!-- État vide -->
      @else if (filteredProducts().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>Aucun produit trouvé</h3>
          <p>Essayez de modifier vos critères de recherche</p>
          @if (searchQuery || selectedCategoryId) {
            <button class="btn btn-outline" (click)="resetFilters()">
              Réinitialiser les filtres
            </button>
          }
        </div>
      }

      <!-- Grille de produits -->
      @else {
        <div class="products-grid">
          @for (product of filteredProducts(); track product.id) {
            <div class="product-card">
              @if (product.pourcentageRemise && product.pourcentageRemise > 0) {
                <div class="badge-promo">-{{ product.pourcentageRemise | number:'1.0-0' }}%</div>
              }
              
              <div class="product-img" (click)="viewProduct(product.id)">
                @if (product.images && product.images.length > 0) {
                  <img [src]="product.images[0]" [alt]="product.nom" />
                } @else if (product.imageUrl) {
                  <img [src]="product.imageUrl" [alt]="product.nom" />
                } @else {
                  <div class="placeholder-img">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                  </div>
                }
              </div>

              <div class="product-info">
                <div class="seller-name">{{ product.sellerNom || product.vendeurNom }}</div>
                
                <h3>
                  <a [routerLink]="['/products', product.id]">{{ product.nom }}</a>
                </h3>
                
                <p class="product-description">{{ product.description }}</p>

                @if (product.noteMoyenne || product.noteAverage) {
                  <div class="stars">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {{ product.noteMoyenne || product.noteAverage || 0 | number:'1.1-1' }}
                    <span class="note-value">({{ product.nombreAvis || 0 }} avis)</span>
                  </div>
                }

                <div class="price-block">
                  @if (product.prixPromo && product.prixPromo < product.prix) {
                    <span class="price-old">{{ product.prix }}€</span>
                    <span class="price-promo">{{ product.prixPromo }}€</span>
                  } @else {
                    <span class="price">{{ product.prix }}€</span>
                  }
                </div>

                <button
                  class="btn-add-cart"
                  (click)="addToCart(product)"
                  [disabled]="!product.stock || product.stock === 0"
                >
                  @if (!product.stock || product.stock === 0) {
                    Rupture de stock
                  } @else {
                    Ajouter au panier
                  }
                </button>

                <a [routerLink]="['/products', product.id]" class="btn-view">
                  Voir les détails
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button
              class="btn btn-outline"
              [disabled]="currentPage() === 0"
              (click)="goToPage(currentPage() - 1)"
            >
              Précédent
            </button>
            
            <span>Page {{ currentPage() + 1 }} sur {{ totalPages() }}</span>
            
            <button
              class="btn btn-outline"
              [disabled]="currentPage() === totalPages() - 1"
              (click)="goToPage(currentPage() + 1)"
            >
              Suivant
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       BARRE DE RECHERCHE
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    
    .search-bar {
      background: white;
      padding: 20px 24px;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
    }

    .search-input {
      flex: 1;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       FILTRES CATÉGORIES
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .categories-filter {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .category-btn {
      padding: 8px 16px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius-sm);
      background: white;
      color: var(--text);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .category-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .category-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       ÉTATS (LOADING, ERROR, EMPTY)
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid #f3f4f6;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 24px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 8px 0;
    }

    .loading-subtext {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin: 0;
    }

    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .error-icon,
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 24px;
      opacity: 0.5;
    }

    .error-state h3,
    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 12px 0;
    }

    .error-state p,
    .empty-state p {
      font-size: 1rem;
      color: var(--text-muted);
      margin: 0 0 24px 0;
      max-width: 400px;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       GRILLE PRODUITS
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .product-card {
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 40px rgba(108, 99, 255, 0.15);
    }

    .badge-promo {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--secondary);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      z-index: 10;
    }

    .product-img {
      width: 100%;
      height: 220px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      background: #f9fafb;
    }

    .product-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-img img {
      transform: scale(1.05);
    }

    .placeholder-img {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      color: var(--text-muted);
    }

    .product-info {
      padding: 16px;
    }

    .seller-name {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .product-info h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 6px 0;
      line-height: 1.3;
    }

    .product-info h3 a {
      color: var(--text);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .product-info h3 a:hover {
      color: var(--primary);
    }

    .product-description {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
      margin: 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stars {
      color: #FFB830;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 8px 0;
    }

    .note-value {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .price-block {
      margin: 10px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .price {
      color: var(--primary);
      font-size: 1.15rem;
      font-weight: 700;
    }

    .price-old {
      color: var(--text-muted);
      text-decoration: line-through;
      font-size: 0.9rem;
    }

    .price-promo {
      color: var(--secondary);
      font-size: 1.15rem;
      font-weight: 700;
    }

    .btn-add-cart {
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      padding: 10px;
      width: 100%;
      margin-top: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-add-cart:hover:not(:disabled) {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    .btn-add-cart:disabled {
      background: var(--text-muted);
      cursor: not-allowed;
    }

    .btn-view {
      display: block;
      text-align: center;
      width: 100%;
      margin-top: 8px;
      padding: 8px;
      color: var(--primary);
      text-decoration: none;
      border: 1.5px solid var(--primary);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-view:hover {
      background: var(--primary);
      color: white;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       PAGINATION
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 48px;
    }

    .pagination button {
      padding: 8px 20px;
    }

    .pagination span {
      color: var(--text-muted);
      font-weight: 500;
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       RESPONSIVE
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @media (max-width: 768px) {
      .search-bar {
        flex-direction: column;
        padding: 16px;
      }
      
      .categories-filter {
        gap: 8px;
      }
      
      .category-btn {
        font-size: 0.8rem;
        padding: 6px 12px;
      }
      
      .products-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .pagination {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class CatalogComponent implements OnInit {
  // État des données
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  
  // État de chargement et d'erreur
  loading = signal(true);
  error = signal(false);
  errorMessage = signal('');
  
  // Filtres et recherche
  searchQuery = '';
  selectedCategoryId: number | null = null;
  
  // Pagination
  currentPage = signal(0);
  pageSize = 12;
  totalPages = signal(0);

  // ✅ ÉTAPE 1: Produits filtrés (sans pagination) - LECTURE SEULE
  private filteredProductsWithoutPagination = computed(() => {
    let result = [...this.products()];

    // Filtrer par catégorie
    if (this.selectedCategoryId) {
      result = result.filter(p => p.categorieId === this.selectedCategoryId);
    }

    return result;
  });

  // ✅ ÉTAPE 2: Produits filtrés avec pagination - LECTURE SEULE
  filteredProducts = computed(() => {
    const result = this.filteredProductsWithoutPagination();
    
    // Pagination
    const start = this.currentPage() * this.pageSize;
    const end = start + this.pageSize;
    
    return result.slice(start, end);
  });

  // ✅ ÉTAPE 3: Calculer totalPages séparément - LECTURE SEULE
  private calculatedTotalPages = computed(() => {
    const result = this.filteredProductsWithoutPagination();
    return Math.ceil(result.length / this.pageSize);
  });

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('[CatalogComponent] Composant initialisé');
    
    // ✅ ÉTAPE 4: Utiliser effect() pour synchroniser totalPages
    effect(() => {
      const newTotalPages = this.calculatedTotalPages();
      this.totalPages.set(newTotalPages);
      console.log('[CatalogComponent] Total pages mis à jour:', newTotalPages);
    });
  }

  ngOnInit(): void {
    console.log('[CatalogComponent] ngOnInit - Démarrage du chargement');
    
    // Charger les catégories (non bloquant)
    this.loadCategories();
    
    // Charger les produits
    this.loadProducts();
    
    // Gérer les paramètres de recherche depuis l'URL
    this.route.queryParams.subscribe(params => {
      console.log('[CatalogComponent] Paramètres URL:', params);
      
      if (params['search']) {
        this.searchQuery = params['search'];
        this.onSearch();
      }
      if (params['category']) {
        this.selectedCategoryId = +params['category'];
      }
    });
  }

  /**
   * Charge les catégories (non bloquant)
   */
  loadCategories(): void {
    console.log('[CatalogComponent] Chargement des catégories...');
    
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        // Prendre seulement les catégories principales (sans parent)
        const mainCategories = categories.filter(c => !c.parentId);
        this.categories.set(mainCategories);
        console.log('[CatalogComponent] Catégories chargées:', mainCategories.length);
      },
      error: (err) => {
        console.error('[CatalogComponent] Erreur chargement catégories:', err);
        // Ne pas bloquer l'affichage si les catégories échouent
        this.categories.set([]);
      }
    });
  }

  /**
   * Charge tous les produits
   */
  loadProducts(): void {
    console.log('[CatalogComponent] Chargement des produits...');
    
    // Réinitialiser l'état
    this.loading.set(true);
    this.error.set(false);
    this.errorMessage.set('');
    
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('[CatalogComponent] Produits reçus:', products.length);
        console.log('[CatalogComponent] Premier produit:', products[0]);
        
        this.products.set(products);
        this.loading.set(false);
        this.error.set(false);
      },
      error: (err) => {
        console.error('[CatalogComponent] Erreur chargement produits:', err);
        
        this.loading.set(false);
        this.error.set(true);
        this.errorMessage.set(err.message || 'Erreur lors du chargement des produits');
      }
    });
  }

  /**
   * Recherche de produits par mot-clé
   */
  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('[CatalogComponent] Recherche:', this.searchQuery);
      
      this.loading.set(true);
      this.error.set(false);
      
      this.productService.searchProducts(this.searchQuery).subscribe({
        next: (products) => {
          console.log('[CatalogComponent] Résultats recherche:', products.length);
          
          this.products.set(products);
          this.currentPage.set(0);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[CatalogComponent] Erreur recherche:', err);
          
          this.loading.set(false);
          this.error.set(true);
          this.errorMessage.set('Erreur lors de la recherche');
        }
      });
    } else {
      // Si la recherche est vide, recharger tous les produits
      this.loadProducts();
    }
  }

  /**
   * Filtre les produits par catégorie
   */
  filterByCategory(categoryId: number | null): void {
    console.log('[CatalogComponent] Filtre catégorie:', categoryId);
    
    this.selectedCategoryId = categoryId;
    this.currentPage.set(0);
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    console.log('[CatalogComponent] Réinitialisation des filtres');
    
    this.searchQuery = '';
    this.selectedCategoryId = null;
    this.currentPage.set(0);
    this.loadProducts();
  }

  /**
   * Navigation vers une page spécifique
   */
  goToPage(page: number): void {
    console.log('[CatalogComponent] Navigation page:', page);
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Navigation vers la page de détail d'un produit
   */
  viewProduct(productId: number): void {
    console.log('[CatalogComponent] Navigation vers produit:', productId);
    this.router.navigate(['/products', productId]);
  }

  /**
   * Ajoute un produit au panier
   */
  addToCart(product: Product): void {
    console.log('[CatalogComponent] Ajout au panier:', product.nom);
    
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[CatalogComponent] Utilisateur non connecté');
      alert('Veuillez vous connecter pour ajouter des produits au panier');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addItem(product.id, 1).subscribe({
      next: () => {
        console.log('[CatalogComponent] Produit ajouté au panier avec succès');
        alert(`${product.nom} a été ajouté au panier`);
      },
      error: (err) => {
        console.error('[CatalogComponent] Erreur ajout au panier:', err);
        
        if (err.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.');
          this.router.navigate(['/auth/login']);
        } else {
          alert('Erreur lors de l\'ajout au panier');
        }
      }
    });
  }
}