import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  constructor(private authService: AuthService) {}

  private getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  private hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  // Vérifications de rôles spécifiques selon la hiérarchie backend
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isBibliothecaire(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.isAdmin();
  }

  isLecteur(): boolean {
    return this.hasRole('LECTEUR') || this.isBibliothecaire() || this.isAdmin();
  }

  // === PERMISSIONS LIVRES ===
  canViewBooks(): boolean {
    return this.isLecteur(); // Tous peuvent voir les livres
  }

  canSearchBooks(): boolean {
    return this.isLecteur(); // Tous peuvent rechercher
  }

  canManageBooks(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.hasRole('ADMIN');
  }

  canDeleteBooks(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.hasRole('ADMIN');
  }

  // === PERMISSIONS UTILISATEURS ===
  canViewUsers(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.hasRole('ADMIN');
  }

  canManageUsers(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.hasRole('ADMIN');
  }

  canDeleteUsers(): boolean {
    return this.hasRole('ADMIN'); // Seul ADMIN peut supprimer
  }

  canDeleteAdminUsers(): boolean {
    return this.hasRole('ADMIN'); // Seul ADMIN peut supprimer d'autres ADMIN
  }

  // === PERMISSIONS EMPRUNTS ===
  canViewAllEmprunts(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.hasRole('ADMIN');
  }

  canManageAllEmprunts(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.hasRole('ADMIN');
  }

  canViewOwnEmprunts(): boolean {
    return this.isLecteur(); // Tous peuvent voir leurs propres emprunts
  }

  canManageOwnEmprunts(): boolean {
    return this.isLecteur(); // Tous peuvent gérer leurs propres emprunts
  }

  // === PERMISSIONS RAPPORTS ===
  canViewAllReports(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.hasRole('ADMIN');
  }

  canViewOwnStats(): boolean {
    return this.isLecteur(); // Tous peuvent voir leurs stats personnelles
  }

  canViewGraphics(): boolean {
    return this.isLecteur(); // Tous peuvent voir les graphiques
  }

  // === PERMISSIONS GÉNÉRALES ===
  canAccessDashboard(): boolean {
    return this.isLecteur(); // Tous peuvent accéder au dashboard
  }

  canManageCategories(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.hasRole('ADMIN');
  }

  canCreateUsers(): boolean {
    return this.hasRole('BIBLIOTHECAIRE') || this.hasRole('ADMIN');
  }

  canViewOwnProfile(): boolean {
    return this.isLecteur(); // Tous peuvent voir leur profil
  }

  // === PERMISSIONS D'ACCÈS AUX ÉCRANS ===
  canAccessUserManagement(): boolean {
    return this.canManageUsers();
  }

  canAccessBookManagement(): boolean {
    return this.canManageBooks();
  }

  canAccessBookCatalog(): boolean {
    return this.canViewBooks(); // Lecteurs peuvent voir le catalogue
  }

  canAccessAllReports(): boolean {
    return this.canViewAllReports();
  }

  canAccessPersonalReports(): boolean {
    return this.canViewOwnStats();
  }

  // Méthode pour obtenir les permissions sous forme d'objet
  getPermissions() {
    return {
      // Rôles
      isAdmin: this.isAdmin(),
      isBibliothecaire: this.isBibliothecaire(),
      isLecteur: this.isLecteur(),

      // Livres
      canViewBooks: this.canViewBooks(),
      canSearchBooks: this.canSearchBooks(),
      canManageBooks: this.canManageBooks(),
      canDeleteBooks: this.canDeleteBooks(),

      // Utilisateurs
      canViewUsers: this.canViewUsers(),
      canManageUsers: this.canManageUsers(),
      canDeleteUsers: this.canDeleteUsers(),
      canDeleteAdminUsers: this.canDeleteAdminUsers(),
      canCreateUsers: this.canCreateUsers(),

      // Emprunts
      canViewAllEmprunts: this.canViewAllEmprunts(),
      canManageAllEmprunts: this.canManageAllEmprunts(),
      canViewOwnEmprunts: this.canViewOwnEmprunts(),
      canManageOwnEmprunts: this.canManageOwnEmprunts(),

      // Rapports
      canViewAllReports: this.canViewAllReports(),
      canViewOwnStats: this.canViewOwnStats(),
      canViewGraphics: this.canViewGraphics(),

      // Général
      canAccessDashboard: this.canAccessDashboard(),
      canManageCategories: this.canManageCategories(),
      canViewOwnProfile: this.canViewOwnProfile(),

      // Accès écrans
      canAccessUserManagement: this.canAccessUserManagement(),
      canAccessBookManagement: this.canAccessBookManagement(),
      canAccessBookCatalog: this.canAccessBookCatalog(),
      canAccessAllReports: this.canAccessAllReports(),
      canAccessPersonalReports: this.canAccessPersonalReports()
    };
  }

  // Méthode pour vérifier plusieurs rôles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user?.roles) return false;

    return roles.some(role => user.roles.includes(role));
  }

  // Méthode pour vérifier tous les rôles
  hasAllRoles(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user?.roles) return false;

    return roles.every(role => user.roles.includes(role));
  }
}