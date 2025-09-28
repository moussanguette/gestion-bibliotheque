import { Directive, Input, OnInit, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() set appHasPermission(permission: string | string[]) {
    this.permission = permission;
    this.updateView();
  }

  private permission: string | string[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscription = this.authService.currentUser$.subscribe(() => {
      this.updateView();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateView() {
    if (this.hasPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private hasPermission(): boolean {
    if (!this.permission) return false;

    if (typeof this.permission === 'string') {
      return this.checkSinglePermission(this.permission);
    }

    if (Array.isArray(this.permission)) {
      return this.permission.some(perm => this.checkSinglePermission(perm));
    }

    return false;
  }

  private checkSinglePermission(permission: string): boolean {
    const permissions = this.permissionService.getPermissions();

    switch (permission) {
      case 'ADMIN':
        return permissions.isAdmin;
      case 'BIBLIOTHECAIRE':
        return permissions.isBibliothecaire;
      case 'LECTEUR':
        return permissions.isLecteur;
      // Livres
      case 'canViewBooks':
        return permissions.canViewBooks;
      case 'canSearchBooks':
        return permissions.canSearchBooks;
      case 'canManageBooks':
        return permissions.canManageBooks;
      case 'canDeleteBooks':
        return permissions.canDeleteBooks;

      // Utilisateurs
      case 'canViewUsers':
        return permissions.canViewUsers;
      case 'canManageUsers':
        return permissions.canManageUsers;
      case 'canDeleteUsers':
        return permissions.canDeleteUsers;
      case 'canDeleteAdminUsers':
        return permissions.canDeleteAdminUsers;
      case 'canCreateUsers':
        return permissions.canCreateUsers;

      // Emprunts
      case 'canViewAllEmprunts':
        return permissions.canViewAllEmprunts;
      case 'canManageAllEmprunts':
        return permissions.canManageAllEmprunts;
      case 'canViewOwnEmprunts':
        return permissions.canViewOwnEmprunts;
      case 'canManageOwnEmprunts':
        return permissions.canManageOwnEmprunts;

      // Rapports
      case 'canViewAllReports':
        return permissions.canViewAllReports;
      case 'canViewOwnStats':
        return permissions.canViewOwnStats;
      case 'canViewGraphics':
        return permissions.canViewGraphics;

      // Général
      case 'canAccessDashboard':
        return permissions.canAccessDashboard;
      case 'canManageCategories':
        return permissions.canManageCategories;
      case 'canViewOwnProfile':
        return permissions.canViewOwnProfile;

      // Accès écrans
      case 'canAccessUserManagement':
        return permissions.canAccessUserManagement;
      case 'canAccessBookManagement':
        return permissions.canAccessBookManagement;
      case 'canAccessBookCatalog':
        return permissions.canAccessBookCatalog;
      case 'canAccessAllReports':
        return permissions.canAccessAllReports;
      case 'canAccessPersonalReports':
        return permissions.canAccessPersonalReports;
      default:
        return false;
    }
  }
}