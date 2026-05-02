// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Restaurer la session au chargement
    this.restoreSession();
  }

  private restoreSession(): void {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
        console.log('✅ Session restaurée');
      } catch(e) {
        console.error('Erreur parsing user:', e);
        this.clearStorage();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 Tentative de login:', credentials.email);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap({
          next: (response: AuthResponse) => {
            console.log('📦 Réponse login reçue:', response);
            
            // Stockage FORCÉ du token
            if (response.accessToken) {
              localStorage.setItem('accessToken', response.accessToken);
              console.log('✅ Token stocké - Début:', response.accessToken.substring(0, 30) + '...');
            } else {
              console.error('❌ PAS de accessToken dans la réponse!');
            }
            
            // Stockage du refresh token
            if (response.refreshToken) {
              localStorage.setItem('refreshToken', response.refreshToken);
            }
            
            // Stockage de l'utilisateur
            if (response.user) {
              localStorage.setItem('user', JSON.stringify(response.user));
              this.currentUserSubject.next(response.user);
              console.log('✅ Utilisateur stocké:', response.user.email, 'Rôle:', response.user.role);
            }
            
            // Vérification finale
            const savedToken = localStorage.getItem('accessToken');
            console.log('🔍 Vérification finale - Token présent:', !!savedToken);
          },
          error: (err: any) => {
            console.error('❌ Erreur API login:', err);
          }
        })
      );
  }

  // Méthode pour récupérer l'utilisateur courant
  currentUser(): any {
    return this.currentUserSubject.value;
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((response: AuthResponse) => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
          }
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    this.clearStorage();
  }

  private clearStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    console.log('🔓 Storage vidé');
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.currentUserSubject.value;
    return !!token && !!user;
  }

  getUserRole(): string {
    const user = this.currentUserSubject.value;
    return user?.role || '';
  }
}