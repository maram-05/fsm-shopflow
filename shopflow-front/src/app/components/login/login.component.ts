import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo">
          <h1>🛍️ ShopFlow</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        @if (error()) {
          <div class="alert alert-error">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="credentials.email"
              required
              email
              placeholder="votre@email.com"
            />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="credentials.motDePasse"
              required
              minlength="6"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="!loginForm.valid || loading()"
          >
            @if (loading()) {
              <span class="spinner"></span>
              Connexion...
            } @else {
              Se connecter
            }
          </button>
        </form>

        <div class="divider">
          <span>ou</span>
        </div>

        <div class="register-link">
          <p>Pas encore de compte ?</p>
          <a routerLink="/register" class="btn btn-secondary btn-block">
            Créer un compte
          </a>
        </div>

        <div class="demo-accounts">
          <p class="demo-title">Comptes de démonstration :</p>
          <button (click)="loginAsDemo('customer')" class="btn btn-demo">
            👤 Client
          </button>
          <button (click)="loginAsDemo('seller')" class="btn btn-demo">
            🏪 Vendeur
          </button>
          <button (click)="loginAsDemo('admin')" class="btn btn-demo">
            👨‍💼 Admin
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .logo {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo h1 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      color: #667eea;
    }

    .logo p {
      color: #666;
      margin: 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-block {
      width: 100%;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #667eea;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .btn-demo {
      background: #fff;
      border: 2px solid #e0e0e0;
      color: #333;
      padding: 8px 16px;
      font-size: 14px;
      margin: 5px;
    }

    .btn-demo:hover {
      border-color: #667eea;
      color: #667eea;
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

    .alert {
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .alert-error {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .divider {
      text-align: center;
      margin: 30px 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }

    .divider span {
      background: white;
      padding: 0 15px;
      position: relative;
      color: #999;
    }

    .register-link {
      text-align: center;
    }

    .register-link p {
      color: #666;
      margin-bottom: 10px;
    }

    .demo-accounts {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
    }

    .demo-title {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
    }
  `]
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    motDePasse: ''
  };

  loading = signal(false);
  error = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.error.set('Email ou mot de passe incorrect');
        this.loading.set(false);
      }
    });
  }

  loginAsDemo(type: 'customer' | 'seller' | 'admin'): void {
    const demoAccounts = {
      customer: { email: 'customer1@shopflow.com', motDePasse: 'customer123' },
      seller: { email: 'seller1@shopflow.com', motDePasse: 'seller123' },
      admin: { email: 'admin@shopflow.com', motDePasse: 'admin123' }
    };

    this.credentials = demoAccounts[type];
    this.onSubmit();
  }
}
