import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Connexion</h1>
          <p>Connectez-vous à votre compte ShopFlow</p>
        </div>

        @if (error()) {
          <div class="alert alert-error">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group" [class.error]="emailError()">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="loginData.email"
              #email="ngModel"
              required
              email
              placeholder="votre@email.com"
            />
            @if (emailError()) {
              <div class="error-message">{{ emailError() }}</div>
            }
          </div>

          <div class="form-group" [class.error]="passwordError()">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="loginData.motDePasse"
              #password="ngModel"
              required
              placeholder="••••••••"
            />
            @if (passwordError()) {
              <div class="error-message">{{ passwordError() }}</div>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            [disabled]="loading() || loginForm.invalid"
          >
            @if (loading()) {
              Connexion en cours...
            } @else {
              Se connecter
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Pas encore de compte ?
            <a routerLink="/auth/register">Créer un compte</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      padding: 24px;
    }

    .auth-card {
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 48px;
      width: 100%;
      max-width: 440px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-header h1 {
      color: var(--primary);
      font-size: 2rem;
      margin-bottom: 8px;
    }

    .auth-header p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .btn {
      margin-top: 8px;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
    }

    .auth-footer p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .auth-footer a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .auth-card {
        padding: 32px 24px;
      }
      
      .auth-header h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    motDePasse: ''
  };

  loading = signal(false);
  error = signal('');
  emailError = signal('');
  passwordError = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.validateForm()) {
      this.loading.set(true);
      this.error.set('');

      this.authService.login(this.loginData).subscribe({
        next: (response) => {
          this.loading.set(false);
          // Redirection selon le rôle
          const user = this.authService.currentUser();
          if (user?.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (user?.role === 'SELLER') {
            this.router.navigate(['/seller']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Login error:', err);
          
          if (err.status === 401) {
            this.error.set('Email ou mot de passe incorrect');
          } else if (err.status === 0) {
            this.error.set('Impossible de se connecter au serveur. Vérifiez votre connexion.');
          } else {
            this.error.set(err.error?.message || 'Erreur de connexion');
          }
        }
      });
    }
  }

  private validateForm(): boolean {
    let isValid = true;

    // Reset errors
    this.emailError.set('');
    this.passwordError.set('');

    // Validation email
    if (!this.loginData.email) {
      this.emailError.set('L\'email est obligatoire');
      isValid = false;
    } else if (!this.isValidEmail(this.loginData.email)) {
      this.emailError.set('Format d\'email invalide');
      isValid = false;
    }

    // Validation mot de passe
    if (!this.loginData.motDePasse) {
      this.passwordError.set('Le mot de passe est obligatoire');
      isValid = false;
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}