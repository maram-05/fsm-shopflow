import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User, UpdateProfileRequest, ChangePasswordRequest, AddressRequest, AddressResponse } from '../../models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <h1 class="page-title">👤 Mon Profil</h1>

      @if (loading()) {
        <div class="loading">
          <div class="spinner-large"></div>
          <p>Chargement du profil...</p>
        </div>
      } @else {
        <div class="profile-content">
          <!-- Profile Info -->
          <div class="profile-section">
            <div class="section-header">
              <h2>Informations personnelles</h2>
              <button class="btn btn-outline" (click)="toggleEditProfile()">
                {{ editingProfile() ? 'Annuler' : 'Modifier' }}
              </button>
            </div>

            @if (!editingProfile()) {
              <div class="profile-info">
                <div class="info-item">
                  <label>Prénom</label>
                  <span>{{ currentUser()?.prenom }}</span>
                </div>
                <div class="info-item">
                  <label>Nom</label>
                  <span>{{ currentUser()?.nom }}</span>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <span>{{ currentUser()?.email }}</span>
                </div>
                <div class="info-item">
                  <label>Rôle</label>
                  <span class="role-badge" [class]="getRoleClass(currentUser()?.role)">
                    {{ getRoleLabel(currentUser()?.role) }}
                  </span>
                </div>
              </div>
            } @else {
              <form (ngSubmit)="updateProfile()" class="profile-form">
                <div class="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    [(ngModel)]="profileForm.prenom"
                    name="prenom"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    [(ngModel)]="profileForm.nom"
                    name="nom"
                    required
                  />
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" [disabled]="updatingProfile()">
                    @if (updatingProfile()) {
                      <span class="spinner"></span>
                      Mise à jour...
                    } @else {
                      Sauvegarder
                    }
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="cancelEditProfile()">
                    Annuler
                  </button>
                </div>
              </form>
            }
          </div>

          <!-- Change Password -->
          <div class="profile-section">
            <div class="section-header">
              <h2>Changer le mot de passe</h2>
              <button class="btn btn-outline" (click)="toggleChangePassword()">
                {{ changingPassword() ? 'Annuler' : 'Modifier' }}
              </button>
            </div>

            @if (changingPassword()) {
              <form (ngSubmit)="changePassword()" class="password-form">
                <div class="form-group">
                  <label>Mot de passe actuel</label>
                  <input
                    type="password"
                    [(ngModel)]="passwordForm.ancienMotDePasse"
                    name="currentPassword"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Nouveau mot de passe</label>
                  <input
                    type="password"
                    [(ngModel)]="passwordForm.nouveauMotDePasse"
                    name="newPassword"
                    required
                    minlength="6"
                  />
                </div>
                <div class="form-group">
                  <label>Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    [(ngModel)]="confirmPassword"
                    name="confirmPassword"
                    required
                  />
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" [disabled]="updatingPassword()">
                    @if (updatingPassword()) {
                      <span class="spinner"></span>
                      Mise à jour...
                    } @else {
                      Changer le mot de passe
                    }
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="cancelChangePassword()">
                    Annuler
                  </button>
                </div>
              </form>
            }
          </div>

          <!-- Addresses -->
          <div class="profile-section">
            <div class="section-header">
              <h2>Mes adresses</h2>
              <button class="btn btn-primary" (click)="toggleAddAddress()">
                ➕ Ajouter une adresse
              </button>
            </div>

            @if (addingAddress()) {
              <form (ngSubmit)="addAddress()" class="address-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Rue</label>
                    <input
                      type="text"
                      [(ngModel)]="addressForm.rue"
                      name="rue"
                      required
                    />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Ville</label>
                    <input
                      type="text"
                      [(ngModel)]="addressForm.ville"
                      name="ville"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label>Code postal</label>
                    <input
                      type="text"
                      [(ngModel)]="addressForm.codePostal"
                      name="codePostal"
                      required
                    />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Pays</label>
                    <input
                      type="text"
                      [(ngModel)]="addressForm.pays"
                      name="pays"
                      value="France"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        [(ngModel)]="addressForm.principal"
                        name="principal"
                      />
                      Adresse principale
                    </label>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" [disabled]="savingAddress()">
                    @if (savingAddress()) {
                      <span class="spinner"></span>
                      Ajout...
                    } @else {
                      Ajouter l'adresse
                    }
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="cancelAddAddress()">
                    Annuler
                  </button>
                </div>
              </form>
            }

            @if (addresses().length > 0) {
              <div class="addresses-list">
                @for (address of addresses(); track address.id) {
                  <div class="address-card" [class.primary]="address.principal">
                    @if (address.principal) {
                      <div class="primary-badge">Principale</div>
                    }
                    <div class="address-content">
                      <p class="address-street">{{ address.rue }}</p>
                      <p class="address-city">{{ address.ville }}, {{ address.codePostal }}</p>
                      <p class="address-country">{{ address.pays }}</p>
                    </div>
                    <div class="address-actions">
                      <button class="btn-icon" (click)="editAddress(address)" title="Modifier">
                        ✏️
                      </button>
                      <button class="btn-icon danger" (click)="deleteAddress(address.id)" title="Supprimer">
                        🗑️
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-addresses">
                <p>Aucune adresse enregistrée</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
      min-height: calc(100vh - 80px);
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 40px 0;
      color: var(--text);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       PROFILE SECTIONS
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .profile-section {
      background: white;
      padding: 32px;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--border);
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      color: var(--text);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       PROFILE INFO
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .profile-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-item label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item span {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--text);
    }

    .role-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .role-badge.customer {
      background: rgba(108, 99, 255, 0.1);
      color: var(--primary);
    }

    .role-badge.seller {
      background: rgba(34, 197, 94, 0.1);
      color: var(--success);
    }

    .role-badge.admin {
      background: rgba(255, 101, 132, 0.1);
      color: var(--secondary);
    }

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       FORMS
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .profile-form,
    .password-form,
    .address-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      margin-top: 24px;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin: 0;
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

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       ADDRESSES
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    .addresses-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .address-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      position: relative;
      transition: all 0.2s ease;
    }

    .address-card:hover {
      border-color: var(--primary);
    }

    .address-card.primary {
      border-color: var(--success);
      background: rgba(34, 197, 94, 0.05);
    }

    .primary-badge {
      position: absolute;
      top: -8px;
      left: 16px;
      background: var(--success);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .address-content {
      flex: 1;
    }

    .address-street {
      font-weight: 600;
      margin: 0 0 4px 0;
      color: var(--text);
    }

    .address-city,
    .address-country {
      color: var(--text-muted);
      margin: 0;
      font-size: 0.9rem;
    }

    .address-actions {
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

    .empty-addresses {
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
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

    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       RESPONSIVE
       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
      }

      .page-title {
        font-size: 2rem;
      }

      .profile-section {
        padding: 20px;
      }

      .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .profile-info {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .address-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .address-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  loading = signal(true);
  editingProfile = signal(false);
  changingPassword = signal(false);
  addingAddress = signal(false);
  updatingProfile = signal(false);
  updatingPassword = signal(false);
  savingAddress = signal(false);

  addresses = signal<AddressResponse[]>([]);

  profileForm: UpdateProfileRequest = {
    prenom: '',
    nom: ''
  };

  passwordForm: ChangePasswordRequest = {
    ancienMotDePasse: '',
    nouveauMotDePasse: ''
  };

  addressForm: AddressRequest = {
    rue: '',
    ville: '',
    codePostal: '',
    pays: 'France',
    principal: false
  };

  confirmPassword = '';

  constructor(private authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    
    // Initialiser les formulaires avec les données actuelles
    const user = this.currentUser();
    if (user) {
      this.profileForm = {
        prenom: user.prenom,
        nom: user.nom
      };
    }

    // TODO: Charger les adresses depuis l'API
    setTimeout(() => {
      this.addresses.set([
        {
          id: 1,
          rue: '123 Rue de la Paix',
          ville: 'Paris',
          codePostal: '75001',
          pays: 'France',
          principal: true
        }
      ]);
      this.loading.set(false);
    }, 500);
  }

  getRoleClass(role: string | undefined): string {
    switch (role) {
      case 'CUSTOMER': return 'customer';
      case 'SELLER': return 'seller';
      case 'ADMIN': return 'admin';
      default: return 'customer';
    }
  }

  getRoleLabel(role: string | undefined): string {
    switch (role) {
      case 'CUSTOMER': return 'Client';
      case 'SELLER': return 'Vendeur';
      case 'ADMIN': return 'Administrateur';
      default: return 'Client';
    }
  }

  toggleEditProfile(): void {
    this.editingProfile.update(v => !v);
    if (this.editingProfile()) {
      const user = this.currentUser();
      if (user) {
        this.profileForm = {
          prenom: user.prenom,
          nom: user.nom
        };
      }
    }
  }

  cancelEditProfile(): void {
    this.editingProfile.set(false);
  }

  updateProfile(): void {
    this.updatingProfile.set(true);
    
    // TODO: Implémenter l'API de mise à jour du profil
    setTimeout(() => {
      alert('Profil mis à jour avec succès !');
      this.updatingProfile.set(false);
      this.editingProfile.set(false);
    }, 1000);
  }

  toggleChangePassword(): void {
    this.changingPassword.update(v => !v);
    if (this.changingPassword()) {
      this.passwordForm = {
        ancienMotDePasse: '',
        nouveauMotDePasse: ''
      };
      this.confirmPassword = '';
    }
  }

  cancelChangePassword(): void {
    this.changingPassword.set(false);
  }

  changePassword(): void {
    if (this.passwordForm.nouveauMotDePasse !== this.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    this.updatingPassword.set(true);
    
    // TODO: Implémenter l'API de changement de mot de passe
    setTimeout(() => {
      alert('Mot de passe changé avec succès !');
      this.updatingPassword.set(false);
      this.changingPassword.set(false);
    }, 1000);
  }

  toggleAddAddress(): void {
    this.addingAddress.update(v => !v);
    if (this.addingAddress()) {
      this.addressForm = {
        rue: '',
        ville: '',
        codePostal: '',
        pays: 'France',
        principal: false
      };
    }
  }

  cancelAddAddress(): void {
    this.addingAddress.set(false);
  }

  addAddress(): void {
    this.savingAddress.set(true);
    
    // TODO: Implémenter l'API d'ajout d'adresse
    setTimeout(() => {
      const newAddress: AddressResponse = {
        id: Date.now(),
        ...this.addressForm
      };
      this.addresses.update(addresses => [...addresses, newAddress]);
      alert('Adresse ajoutée avec succès !');
      this.savingAddress.set(false);
      this.addingAddress.set(false);
    }, 1000);
  }

  editAddress(address: AddressResponse): void {
    // TODO: Implémenter l'édition d'adresse
    console.log('Éditer adresse:', address);
    alert('Fonctionnalité d\'édition à implémenter');
  }

  deleteAddress(addressId: number): void {
    if (!confirm('Voulez-vous vraiment supprimer cette adresse ?')) {
      return;
    }

    // TODO: Implémenter l'API de suppression d'adresse
    this.addresses.update(addresses => addresses.filter(a => a.id !== addressId));
    alert('Adresse supprimée avec succès !');
  }
}