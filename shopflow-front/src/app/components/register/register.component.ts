import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="logo">
          <h1>🛍️ ShopFlow</h1>
          <p>Créez votre compte</p>
        </div>

        @if (error()) {
          <div class="alert alert-error">
            {{ error() }}
          </div>
        }

        @if (success()) {
          <div class="alert alert-success">
            {{ success() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                [(ngModel)]="userData.prenom"
                required
                placeholder="Jean"
              />
            </div>

            <div class="form-group">
              <label for="nom">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                [(ngModel)]="userData.nom"
                required
                placeholder="Dupont"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="userData.email"
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
              [(ngModel)]="userData.motDePasse"
              required
              minlength="6"
              placeholder="••••••••"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              required
              minlength="6"
              placeholder="••••••••"
            />
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                [(ngModel)]="isSeller"
                name="isSeller"
              />
              <span>Je souhaite devenir vendeur</span>
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="!registerForm.valid || loading()"
          >
            @if (loading()) {
              <span class="spinner"></span>
              Inscription...
            } @else {
              Créer mon compte
            }
          </button>
        </form>

        <div class="login-link">
          <p>Vous avez déjà un compte ?</p>
          <a routerLink="/login" class="btn btn-secondary btn-block">
            Se connecter
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 550px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
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

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="tel"],
    .form-group input[type="password"] {
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

    .checkbox-group label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .checkbox-group input[type="checkbox"] {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      cursor: pointer;
    }

    .checkbox-group span {
      color: #333;
      font-weight: normal;
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

    .alert-success {
      background: #efe;
      color: #3c3;
      border: 1px solid #cfc;
    }

    .login-link {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
    }

    .login-link p {
      color: #666;
      margin-bottom: 10px;
    }
  `]
})
export class RegisterComponent {
  userData: RegisterRequest = {
    email: '',
    motDePasse: '',
    nom: '',
    prenom: '',
    role: 'CUSTOMER'
  };

  confirmPassword = '';
  isSeller = false;
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validation du mot de passe
    if (this.userData.motDePasse !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    // Définir le rôle
    this.userData.role = this.isSeller ? 'SELLER' : 'CUSTOMER';

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.register(this.userData).subscribe({
      next: () => {
        this.success.set('Inscription réussie ! Redirection...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Une erreur est survenue lors de l\'inscription');
        this.loading.set(false);
      }
    });
  }
}
