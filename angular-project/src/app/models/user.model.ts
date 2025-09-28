export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  username: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  role?: 'ROLE_ADMIN' | 'ROLE_BIBLIOTHECAIRE' | 'ROLE_LECTEUR';
  membershipType?: 'Admin' | 'Premium' | 'Standard';
  booksEmpruntes?: number;
  memberSince?: string;
  lastActivity?: string;
}

export interface LibraryUser {
  id?: number; // Ajout de l'ID numérique potentiel retourné par l'API
  email: string;
  username: string;
  password?: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  role: 'ROLE_ADMIN' | 'ROLE_BIBLIOTHECAIRE' | 'ROLE_LECTEUR';
  isActive: boolean;
  membershipType: 'Admin' | 'Premium' | 'Standard';
  booksEmpruntes: number;
  memberSince: string;
  lastActivity: string;
}