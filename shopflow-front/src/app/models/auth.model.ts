export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role: 'CUSTOMER' | 'SELLER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  actif: boolean;
}

export interface UpdateProfileRequest {
  prenom: string;
  nom: string;
}

export interface ChangePasswordRequest {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

export interface AddressRequest {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}

export interface AddressResponse {
  id: number;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}