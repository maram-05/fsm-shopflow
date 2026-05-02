import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <!-- Modern Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              The modern way to
              <span class="gradient-text">shop online</span>
            </h1>
            <p class="hero-subtitle">
              Discover thousands of quality products from trusted sellers. 
              Fast delivery, secure payments, and exceptional service.
            </p>
            <div class="hero-actions">
              <a routerLink="/products" class="btn btn-primary btn-xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                Explore Products
              </a>
              <a routerLink="/register" class="btn btn-outline btn-xl">
                Start Selling
              </a>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-grid">
              <div class="hero-card hero-card-1">
                <div class="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                    <path d="M13 12h3a2 2 0 0 1 2 2v1"/>
                    <path d="M13 12h-3a2 2 0 0 0-2 2v1"/>
                  </svg>
                </div>
                <h4>Secure Payments</h4>
              </div>
              <div class="hero-card hero-card-2">
                <div class="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h4>Trusted Sellers</h4>
              </div>
              <div class="hero-card hero-card-3">
                <div class="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h4>Fast Delivery</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="section categories-section">
        <div class="section-header">
          <h2>Shop by Category</h2>
          <p>Find exactly what you're looking for</p>
        </div>
        <div class="categories-grid">
          @for (category of categories(); track category.id) {
            <div class="category-card" (click)="navigateToCategory(category.id)">
              <div class="category-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              </div>
              <div class="category-content">
                <h3>{{ category.nom }}</h3>
                <p>{{ category.description || 'Discover our selection' }}</p>
              </div>
              <div class="category-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Featured Products -->
      <section class="section featured-section">
        <div class="section-header">
          <h2>Featured Products</h2>
          <p>Handpicked items just for you</p>
        </div>
        <div class="products-grid">
          @for (product of promotions(); track product.id) {
            <div class="product-card" (click)="navigateToProduct(product.id)">
              @if (product.pourcentageRemise && product.pourcentageRemise > 0) {
                <div class="product-badge">{{ product.pourcentageRemise }}% OFF</div>
              }
              <div class="product-image">
                @if (product.images && product.images.length > 0) {
                  <img [src]="product.images[0]" [alt]="product.nom" />
                } @else if (product.imageUrl) {
                  <img [src]="product.imageUrl" [alt]="product.nom" />
                } @else {
                  <div class="product-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                  </div>
                }
              </div>
              <div class="product-content">
                <h3 class="product-name">{{ product.nom }}</h3>
                <p class="product-description">{{ product.description | slice:0:60 }}{{ product.description.length > 60 ? '...' : '' }}</p>
                <div class="product-footer">
                  <div class="product-price">
                    @if (product.prixPromo && product.prixPromo < product.prix) {
                      <span class="price-current">€{{ product.prixPromo }}</span>
                      <span class="price-original">€{{ product.prix }}</span>
                    } @else {
                      <span class="price-current">€{{ product.prix }}</span>
                    }
                  </div>
                  @if (product.noteMoyenne || product.noteAverage) {
                    <div class="product-rating">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span>{{ product.noteMoyenne || product.noteAverage || 0 | number:'1.1-1' }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Features Section -->
      <section class="section features-section">
        <div class="section-header">
          <h2>Why Choose ShopFlow</h2>
          <p>Everything you need for a perfect shopping experience</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3>Fast Delivery</h3>
            <p>Get your orders delivered within 24-48 hours across the country</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                <path d="M13 12h3a2 2 0 0 1 2 2v1"/>
                <path d="M13 12h-3a2 2 0 0 0-2 2v1"/>
              </svg>
            </div>
            <h3>Secure Payments</h3>
            <p>Your transactions are protected with bank-level security</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
            <h3>Easy Returns</h3>
            <p>30-day hassle-free returns on all purchases</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>24/7 Support</h3>
            <p>Our customer service team is always here to help</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       MODERN HOME STYLES
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .home-container {
      min-height: 100vh;
    }

    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: var(--space-20) 0;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/><circle cx="10" cy="50" r="1" fill="white" opacity="0.1"/><circle cx="90" cy="30" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-6);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-16);
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .hero-text {
      color: white;
    }

    .hero-title {
      font-size: var(--text-5xl);
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: var(--space-6);
      letter-spacing: -0.02em;
    }

    .gradient-text {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: var(--text-xl);
      line-height: 1.6;
      margin-bottom: var(--space-8);
      opacity: 0.9;
      font-weight: 400;
    }

    .hero-actions {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      max-width: 300px;
    }

    .hero-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      text-align: center;
      color: white;
      transition: all var(--transition-base);
    }

    .hero-card:hover {
      transform: translateY(-4px);
      background: rgba(255, 255, 255, 0.15);
    }

    .hero-card-1 {
      grid-column: 1 / -1;
    }

    .card-icon {
      margin-bottom: var(--space-3);
      opacity: 0.8;
    }

    .hero-card h4 {
      font-size: var(--text-sm);
      font-weight: 500;
      margin: 0;
    }

    /* Section Styles */
    .section {
      padding: var(--space-20) 0;
      max-width: 1200px;
      margin: 0 auto;
      padding-left: var(--space-6);
      padding-right: var(--space-6);
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--space-16);
    }

    .section-header h2 {
      margin-bottom: var(--space-4);
    }

    .section-header p {
      font-size: var(--text-lg);
      max-width: 600px;
      margin: 0 auto;
    }

    /* Categories Grid */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-6);
    }

    .category-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: var(--shadow-sm);
    }

    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary);
    }

    .category-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      background: var(--primary-50);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .category-content {
      flex: 1;
    }

    .category-content h3 {
      margin-bottom: var(--space-1);
      font-size: var(--text-lg);
    }

    .category-content p {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      margin: 0;
    }

    .category-arrow {
      color: var(--text-quaternary);
      transition: all var(--transition-base);
    }

    .category-card:hover .category-arrow {
      color: var(--primary);
      transform: translateX(4px);
    }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-6);
    }

    .product-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: var(--shadow-sm);
      position: relative;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
      border-color: var(--border-medium);
    }

    .product-badge {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      background: var(--danger);
      color: white;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: 600;
      z-index: 10;
    }

    .product-image {
      height: 200px;
      background: var(--gray-50);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-placeholder {
      color: var(--text-quaternary);
    }

    .product-content {
      padding: var(--space-5);
    }

    .product-name {
      font-size: var(--text-lg);
      font-weight: 600;
      margin-bottom: var(--space-2);
      line-height: 1.3;
    }

    .product-description {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      margin-bottom: var(--space-4);
      line-height: 1.5;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .price-current {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--primary);
    }

    .price-original {
      font-size: var(--text-sm);
      color: var(--text-quaternary);
      text-decoration: line-through;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-sm);
      color: var(--warning);
    }

    .product-rating span {
      color: var(--text-tertiary);
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--space-8);
    }

    .feature-card {
      text-align: center;
      padding: var(--space-8) var(--space-6);
    }

    .feature-icon {
      margin: 0 auto var(--space-6);
      width: 64px;
      height: 64px;
      background: var(--primary-50);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .feature-card h3 {
      margin-bottom: var(--space-3);
      font-size: var(--text-xl);
    }

    .feature-card p {
      font-size: var(--text-base);
      line-height: 1.6;
      max-width: 300px;
      margin: 0 auto;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: var(--space-12);
        text-align: center;
      }

      .hero-title {
        font-size: var(--text-4xl);
      }

      .hero-subtitle {
        font-size: var(--text-lg);
      }

      .hero-actions {
        justify-content: center;
      }

      .section {
        padding: var(--space-16) 0;
        padding-left: var(--space-4);
        padding-right: var(--space-4);
      }

      .categories-grid,
      .products-grid {
        grid-template-columns: 1fr;
      }

      .features-grid {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  categories = signal<Category[]>([]);
  promotions = signal<Product[]>([]);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('HomeComponent: Initialisation...');
    this.loadCategories();
    this.loadPromotions();
  }

  loadCategories(): void {
    console.log('HomeComponent: Chargement des catégories...');
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        console.log('HomeComponent: Catégories reçues:', categories);
        // Prendre seulement les catégories principales (sans parent)
        this.categories.set(categories.filter(c => !c.parentId).slice(0, 6));
      },
      error: (err) => {
        console.error('Erreur chargement catégories:', err);
      }
    });
  }

  loadPromotions(): void {
    console.log('HomeComponent: Chargement des promotions...');
    this.productService.getPromotions().subscribe({
      next: (products) => {
        console.log('HomeComponent: Produits reçus:', products);
        this.promotions.set(products.slice(0, 8));
      },
      error: (err) => {
        console.error('Erreur chargement promotions:', err);
      }
    });
  }

  getCategoryIcon(name: string): string {
    // Removed emoji icons - using SVG icons in template instead
    return '';
  }

  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/products'], { queryParams: { category: categoryId } });
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
}
