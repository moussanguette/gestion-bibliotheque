export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthCredentials {
  email: string; // Utilisé comme username dans l'API
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  name: string;
}

export interface LibraryUser {
  email: string;
  username: string;
  password?: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  role: 'ADMIN' | 'BIBLIOTHECAIRE' | 'LECTEUR';
  isActive: boolean;
  membershipType: 'Admin' | 'Premium' | 'Standard';
  booksLoaned: number;
  memberSince: string;
  lastActivity: string;
}