import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-list-container">
      <!-- Filters Sidebar -->
      <aside class="filters-sidebar">
        <h3>Filtres</h3>

        <div class="filter-section">
          <h4>Catégories</h4>
          <div class="category-list">
            <label class="category-item">
              <input
                type="radio"
                name="category"
                [value]="null"
                [(ngModel)]="selectedCategoryId"
                (change)="applyFilters()"
              />
              <span>Toutes les catégories</span>
            </label>
            @for (category of categories(); track category.id) {
              <label class="category-item">
                <input
                  type="radio"
                  name="category"
                  [value]="category.id"
                  [(ngModel)]="selectedCategoryId"
                  (change)="applyFilters()"
                />
                <span>{{ category.nom }}</span>
              </label>
            }
          </div>
        </div>

        <div class="filter-section">
          <h4>Prix</h4>
          <div class="price-inputs">
            <input
              type="number"
              placeholder="Min"
              [(ngModel)]="minPrice"
              (change)="applyFilters()"
              class="price-input"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              [(ngModel)]="maxPrice"
              (change)="applyFilters()"
              class="price-input"
            />
          </div>
        </div>

        <div class="filter-section">
          <label class="checkbox-item">
            <input
              type="checkbox"
              [(ngModel)]="onlyPromotions"
              (change)="applyFilters()"
            />
            <span>🔥 Promotions uniquement</span>
          </label>
        </div>

        <button class="btn btn-secondary btn-block" (click)="resetFilters()">
          Réinitialiser
        </button>
      </aside>

      <!-- Products Grid -->
      <main class="products-main">
        <div class="products-header">
          <h2>
            @if (searchKeyword()) {
              Résultats pour "{{ searchKeyword() }}"
            } @else if (selectedCategoryId) {
              {{ getCategoryName() }}
            } @else {
              Tous les produits
            }
          </h2>
          <div class="products-count">
            {{ filteredProducts().length }} produit(s)
          </div>
        </div>

        <div class="sort-bar">
          <label>
            Trier par:
            <select [(ngModel)]="sortBy" (change)="applySort()" class="sort-select">
              <option value="default">Par défaut</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
              <option value="rating">Meilleures notes</option>
            </select>
          </label>
        </div>

        @if (loading()) {
          <div class="loading">
            <div class="spinner-large"></div>
            <p>Chargement des produits...</p>
          </div>
        } @else if (filteredProducts().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>Aucun produit trouvé</h3>
            <p>Essayez de modifier vos filtres</p>
          </div>
        } @else {
          <div class="products-grid">
            @for (product of filteredProducts(); track product.id) {
              <div class="product-card">
                @if (product.pourcentagePromotion && product.pourcentagePromotion > 0) {
                  <div class="discount-badge">-{{ product.pourcentagePromotion }}%</div>
                }
                
                <div class="product-image" (click)="viewProduct(product.id)">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="product.nom" />
                  } @else {
                    <div class="placeholder-image">📦</div>
                  }
                </div>

                <div class="product-info">
                  <h3 class="product-name" (click)="viewProduct(product.id)">
                    {{ product.nom }}
                  </h3>
                  <p class="product-description">{{ product.description }}</p>

                  <div class="product-meta">
                    <div class="product-rating">
                      ⭐ {{ product.noteAverage || 0 | number:'1.1-1' }}
                      <span class="review-count">({{ product.nombreAvis || 0 }})</span>
                    </div>
                    @if (product.stock && product.stock > 0) {
                      <div class="product-stock">
                        ✓ En stock
                      </div>
                    } @else {
                      <div class="product-stock out-of-stock">
                        ✗ Rupture
                      </div>
                    }
                  </div>

                  <div class="product-footer">
                    <div class="product-price">
                      @if (product.prixPromotion && product.prixPromotion < product.prix) {
                        <span class="price-original">{{ product.prix }}€</span>
                        <span class="price-promo">{{ product.prixPromotion }}€</span>
                      } @else {
                        <span class="price-current">{{ product.prix }}€</span>
                      }
                    </div>

                    <button
                      class="btn btn-primary btn-sm"
                      (click)="addToCart(product)"
                      [disabled]="!product.stock || product.stock === 0"
                    >
                      🛒 Ajouter
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .product-list-container {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 30px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 30px;
      min-height: calc(100vh - 80px);
    }

    /* Filters Sidebar */
    .filters-sidebar {
      background: white;
      padding: 25px;
      border-radius: 15px;
      height: fit-content;
      position: sticky;
      top: 100px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .filters-sidebar h3 {
      margin: 0 0 25px 0;
      font-size: 1.5rem;
      color: #333;
    }

    .filter-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .filter-section:last-of-type {
      border-bottom: none;
    }

    .filter-section h4 {
      margin: 0 0 15px 0;
      font-size: 1rem;
      color: #666;
      font-weight: 600;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .category-item,
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .category-item:hover,
    .checkbox-item:hover {
      background: #f5f5f5;
    }

    .category-item input,
    .checkbox-item input {
      cursor: pointer;
    }

    .price-inputs {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .price-input {
      flex: 1;
      padding: 8px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
    }

    .price-input:focus {
      outline: none;
      border-color: #667eea;
    }

    /* Products Main */
    .products-main {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .products-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .products-header h2 {
      margin: 0;
      font-size: 2rem;
      color: #333;
    }

    .products-count {
      color: #666;
      font-size: 14px;
    }

    .sort-bar {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }

    .sort-select {
      margin-left: 10px;
      padding: 8px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }

    .sort-select:focus {
      outline: none;
      border-color: #667eea;
    }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
    }

    .product-card {
      background: white;
      border: 2px solid #f0f0f0;
      border-radius: 15px;
      overflow: hidden;
      transition: all 0.3s;
      position: relative;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }

    .discount-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      background: #ff4444;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 13px;
      z-index: 10;
    }

    .product-image {
      height: 220px;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .product-image:hover img {
      transform: scale(1.1);
    }

    .placeholder-image {
      font-size: 70px;
    }

    .product-info {
      padding: 20px;
    }

    .product-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 10px 0;
      color: #333;
      cursor: pointer;
      transition: color 0.2s;
    }

    .product-name:hover {
      color: #667eea;
    }

    .product-description {
      color: #666;
      font-size: 13px;
      margin: 0 0 15px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-size: 13px;
    }

    .product-rating {
      color: #666;
    }

    .review-count {
      color: #999;
    }

    .product-stock {
      color: #22c55e;
      font-weight: 600;
    }

    .product-stock.out-of-stock {
      color: #ff4444;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .product-price {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .price-original {
      text-decoration: line-through;
      color: #999;
      font-size: 13px;
    }

    .price-promo {
      color: #ff4444;
      font-size: 1.4rem;
      font-weight: 700;
    }

    .price-current {
      color: #667eea;
      font-size: 1.4rem;
      font-weight: 700;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-block {
      width: 100%;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
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

    /* Loading & Empty States */
    .loading,
    .empty-state {
      text-align: center;
      padding: 80px 20px;
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

    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      margin: 0 0 10px 0;
      color: #333;
    }

    .empty-state p {
      color: #666;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 968px) {
      .product-list-container {
        grid-template-columns: 1fr;
      }

      .filters-sidebar {
        position: static;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  // Filters
  selectedCategoryId: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  onlyPromotions = false;
  searchKeyword = signal<string>('');
  sortBy = 'default';

  filteredProducts = computed(() => {
    let result = [...this.products()];

    // Filter by category
    if (this.selectedCategoryId) {
      result = result.filter(p => p.categorieId === this.selectedCategoryId);
    }

    // Filter by price
    if (this.minPrice !== null) {
      result = result.filter(p => {
        const price = p.prixPromotion || p.prix;
        return price >= this.minPrice!;
      });
    }
    if (this.maxPrice !== null) {
      result = result.filter(p => {
        const price = p.prixPromotion || p.prix;
        return price <= this.maxPrice!;
      });
    }

    // Filter by promotions
    if (this.onlyPromotions) {
      result = result.filter(p => p.pourcentagePromotion && p.pourcentagePromotion > 0);
    }

    // Sort
    switch (this.sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.prixPromotion || a.prix) - (b.prixPromotion || b.prix));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.prixPromotion || b.prix) - (a.prixPromotion || a.prix));
        break;
      case 'name':
        result.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'rating':
        result.sort((a, b) => (b.noteAverage || 0) - (a.noteAverage || 0));
        break;
    }

    return result;
  });

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    // Check for query params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategoryId = +params['category'];
      }
      if (params['search']) {
        this.searchKeyword.set(params['search']);
        this.searchProducts(params['search']);
      } else {
        this.loadProducts();
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => console.error('Erreur chargement catégories:', err)
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement produits:', err);
        this.loading.set(false);
      }
    });
  }

  searchProducts(keyword: string): void {
    this.loading.set(true);
    this.productService.searchProducts(keyword).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur recherche produits:', err);
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    // Filters are applied automatically via computed signal
  }

  applySort(): void {
    // Sort is applied automatically via computed signal
  }

  resetFilters(): void {
    this.selectedCategoryId = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.onlyPromotions = false;
    this.sortBy = 'default';
  }

  getCategoryName(): string {
    const category = this.categories().find(c => c.id === this.selectedCategoryId);
    return category?.nom || 'Catégorie';
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product.id, 1).subscribe({
      next: () => {
        // Success feedback could be added here
        console.log('Produit ajouté au panier');
      },
      error: (err) => {
        console.error('Erreur ajout au panier:', err);
        alert('Erreur lors de l\'ajout au panier');
      }
    });
  }
}
