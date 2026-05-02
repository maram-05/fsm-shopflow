export interface User {
  id: number;
  email: string;
  prenom: string;
  nom: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
  actif: boolean;
  dateCreation?: Date;
}

// Les interfaces d'authentification sont maintenant dans auth.model.ts
