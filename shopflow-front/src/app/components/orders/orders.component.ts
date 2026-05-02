// orders.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-container">
      <h2>Mes Commandes</h2>
      
      @if (loading()) {
        <div class="loading">Chargement des commandes...</div>
      }
      
      @if (error()) {
        <div class="error">
          <p>❌ {{ error() }}</p>
          <button (click)="loadOrders()" class="btn-retry">Réessayer</button>
        </div>
      }
      
      @if (!loading() && !error() && orders().length === 0) {
        <div class="no-orders">
          <p>📦 Aucune commande pour le moment</p>
        </div>
      }
      
      <div class="orders-list">
        @for (order of orders(); track order.id) {
          <div class="order-card">
            <div class="order-header">
              <span class="order-number">Commande #{{ order.numeroCommande || order.id }}</span>
              <span class="order-status" [ngClass]="order.statut">
                {{ order.statut }}
              </span>
            </div>
            <div class="order-body">
              <p>Date: {{ order.dateCommande | date:'dd/MM/yyyy' }}</p>
              <p>Total: {{ order.totalTTC | currency:'EUR' }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .order-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 15px;
      padding: 15px;
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .order-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .PENDING { background: orange; color: white; }
    .PAID { background: green; color: white; }
    .SHIPPED { background: blue; color: white; }
    .DELIVERED { background: #28a745; color: white; }
    .CANCELLED { background: red; color: white; }
    .loading, .error, .no-orders {
      text-align: center;
      padding: 40px;
    }
    .btn-retry {
      padding: 8px 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  loading = signal(false);
  error = signal('');

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
  this.loading.set(true);
  this.error.set('');
  
  console.log('🔄 Chargement des commandes...');
  console.log('🔑 Token présent?', !!this.authService.getToken());
  
  // 👇 AJOUTE responseType: 'text' pour voir la réponse brute
  this.http.get('http://localhost:8080/api/orders', { responseType: 'text' })
    .subscribe({
      next: (response: string) => {
        console.log('📦 RÉPONSE BRUTE:', response.substring(0, 500));
        
        // Essaie de parser si c'est du JSON
        try {
          const json = JSON.parse(response);
          console.log('✅ C\'est du JSON valide!', json);
          this.orders.set(json);
          this.loading.set(false);
        } catch(e) {
          console.error('❌ Ce n\'est pas du JSON - C\'est du HTML');
          console.log('Début de la réponse:', response.substring(0, 200));
          this.error.set('Le serveur a retourné une page d\'erreur au lieu des commandes');
          this.loading.set(false);
        }
      },
      error: (err: any) => {
        console.error('❌ Erreur:', err);
        this.error.set('Erreur: ' + err.message);
        this.loading.set(false);
      }
    });
}
}