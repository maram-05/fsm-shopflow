import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Inscription</h1>
          <p>Créez votre compte ShopFlow</p>
        </div>

        @if (error()) {
          <div class="alert alert-error">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <!-- Prénom et Nom -->
          <div class="form-row">
            <div class="form-group" [class.error]="prenomError()">
              <label for="prenom">Prénom</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                [(ngModel)]="registerData.prenom"
                #prenom="ngModel"
                required
                placeholder="Jean"
              />
              @if (prenomError()) {
                <div class="error-message">{{ prenomError() }}</div>
              }
            </div>

            <div class="form-group" [class.error]="nomError()">
              <label for="nom">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                [(ngModel)]="registerData.nom"
                #nom="ngModel"
                required
                placeholder="Dupont"
              />
              @if (nomError()) {
                <div class="error-message">{{ nomError() }}</div>
              }
            </div>
          </div>

          <!-- Email -->
          <div class="form-group" [class.error]="emailError()">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="registerData.email"
              #email="ngModel"
              required
              email
              placeholder="jean.dupont@email.com"
            />
            @if (emailError()) {
              <div class="error-message">{{ emailError() }}</div>
            }
          </div>

          <!-- Mot de passe -->
          <div class="form-group" [class.error]="passwordError()">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="registerData.motDePasse"
              #password="ngModel"
              required
              placeholder="••••••••"
            />
            @if (passwordError()) {
              <div class="error-message">{{ passwordError() }}</div>
            }
            <div class="password-hint">
              Minimum 8 caractères avec majuscule, minuscule et chiffre
            </div>
          </div>

          <!-- Rôle -->
          <div class="form-group">
            <label for="role">Type de compte</label>
            <select
              id="role"
              name="role"
              [(ngModel)]="registerData.role"
              #role="ngModel"
              required
            >
              <option value="CUSTOMER">Client</option>
              <option value="SELLER">Vendeur</option>
            </select>
          </div>

          <!-- Nom de boutique (si vendeur) -->
          @if (registerData.role === 'SELLER') {
            <div class="form-group" [class.error]="boutiqueError()">
              <label for="boutique">Nom de la boutique *</label>
              <input
                type="text"
                id="boutique"
                name="boutique"
                [(ngModel)]="nomBoutique"
                placeholder="Ma Super Boutique"
              />
              @if (boutiqueError()) {
                <div class="error-message">{{ boutiqueError() }}</div>
              }
            </div>
          }

          <button
            type="submit"
            class="btn btn-primary w-full"
            [disabled]="loading() || registerForm.invalid"
          >
            @if (loading()) {
              Création en cours...
            } @else {
              Créer mon compte
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Déjà un compte ?
            <a routerLink="/auth/login">Se connecter</a>
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
      max-width: 480px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .password-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
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
      
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
    }
  `]
})
export class RegisterComponent {
  registerData: RegisterRequest = {
    email: '',
    motDePasse: '',
    prenom: '',
    nom: '',
    role: 'CUSTOMER'
  };

  nomBoutique = '';

  loading = signal(false);
  error = signal('');
  emailError = signal('');
  passwordError = signal('');
  prenomError = signal('');
  nomError = signal('');
  boutiqueError = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.validateForm()) {
      this.loading.set(true);
      this.error.set('');

      this.authService.register(this.registerData).subscribe({
        next: (response) => {
          this.loading.set(false);
          // Redirection vers la page de connexion avec message de succès
          this.router.navigate(['/auth/login'], {
            queryParams: { message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' }
          });
        },
        error: (err) => {
          this.loading.set(false);
          if (err.error?.fieldErrors) {
            // Erreurs de validation spécifiques
            const fieldErrors = err.error.fieldErrors;
            this.emailError.set(fieldErrors.email || '');
            this.passwordError.set(fieldErrors.motDePasse || '');
            this.prenomError.set(fieldErrors.prenom || '');
            this.nomError.set(fieldErrors.nom || '');
          } else {
            this.error.set(err.error?.message || 'Erreur lors de la création du compte');
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
    this.prenomError.set('');
    this.nomError.set('');
    this.boutiqueError.set('');

    // Validation prénom
    if (!this.registerData.prenom?.trim()) {
      this.prenomError.set('Le prénom est obligatoire');
      isValid = false;
    } else if (this.registerData.prenom.length < 2) {
      this.prenomError.set('Le prénom doit contenir au moins 2 caractères');
      isValid = false;
    }

    // Validation nom
    if (!this.registerData.nom?.trim()) {
      this.nomError.set('Le nom est obligatoire');
      isValid = false;
    } else if (this.registerData.nom.length < 2) {
      this.nomError.set('Le nom doit contenir au moins 2 caractères');
      isValid = false;
    }

    // Validation email
    if (!this.registerData.email) {
      this.emailError.set('L\'email est obligatoire');
      isValid = false;
    } else if (!this.isValidEmail(this.registerData.email)) {
      this.emailError.set('Format d\'email invalide');
      isValid = false;
    }

    // Validation mot de passe
    if (!this.registerData.motDePasse) {
      this.passwordError.set('Le mot de passe est obligatoire');
      isValid = false;
    } else if (!this.isValidPassword(this.registerData.motDePasse)) {
      this.passwordError.set('Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule et un chiffre');
      isValid = false;
    }

    // Validation nom de boutique (si vendeur)
    if (this.registerData.role === 'SELLER') {
      if (!this.nomBoutique?.trim()) {
        this.boutiqueError.set('Le nom de la boutique est obligatoire pour les vendeurs');
        isValid = false;
      }
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
}