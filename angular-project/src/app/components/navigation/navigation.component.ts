import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PermissionService } from '../../services/permission.service';
import { AuthService } from '../../services/auth.service';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { User } from '../../models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
  description?: string;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, HasPermissionDirective],
  template: `
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo et titre -->
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h1 class="ml-2 text-xl font-bold text-gray-900">BiblioManager</h1>
            </div>
          </div>

          <!-- Navigation items -->
          <div class="hidden md:flex items-center space-x-4">
            <a
              *ngFor="let item of availableNavItems"
              [routerLink]="item.route"
              routerLinkActive="text-blue-600 bg-blue-50"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2"
              [title]="item.description"
            >
              <div [innerHTML]="item.icon" class="w-4 h-4"></div>
              <span>{{ item.label }}</span>
            </a>
          </div>

          <!-- User menu -->
          <div class="flex items-center space-x-4">
            <!-- Role badge -->
            <span class="px-2 py-1 text-xs rounded-full font-medium"
                  [ngClass]="{
                    'bg-red-100 text-red-800': permissionService.isAdmin(),
                    'bg-blue-100 text-blue-800': permissionService.isBibliothecaire() && !permissionService.isAdmin(),
                    'bg-green-100 text-green-800': permissionService.isLecteur() && !permissionService.isBibliothecaire() && !permissionService.isAdmin()
                  }">
              {{ getUserRoleLabel() }}
            </span>

            <!-- User info -->
            <div class="text-sm text-gray-700">
              {{ user?.username || 'Utilisateur' }}
            </div>

            <!-- Logout button -->
            <button
              (click)="handleLogout()"
              class="px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors duration-200 flex items-center space-x-1"
              title="Se déconnecter"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu (optional) -->
      <div class="md:hidden border-t" *ngIf="showMobileMenu">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a
            *ngFor="let item of availableNavItems"
            [routerLink]="item.route"
            routerLinkActive="text-blue-600 bg-blue-50"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          >
            {{ item.label }}
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .router-link-active {
      color: #2563eb;
      background-color: #eff6ff;
    }
  `]
})
export class NavigationComponent implements OnInit {
  user: User | null = null;
  showMobileMenu = false;

  navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"></path></svg>',
      route: '/dashboard',
      description: 'Vue d\'ensemble de la bibliothèque'
    },
    {
      label: 'Livres',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
      route: '/books',
      permission: 'canViewBooks',
      description: 'Catalogue des livres'
    },
    {
      label: 'Utilisateurs',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>',
      route: '/users',
      permission: 'canManageUsers',
      description: 'Gestion des comptes utilisateurs'
    },
    {
      label: 'Emprunts',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>',
      route: '/emprunts',
      description: 'Gestion des prêts de livres'
    },
    {
      label: 'Rapports',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
      route: '/reports',
      description: 'Rapports et statistiques'
    }
  ];

  constructor(
    public permissionService: PermissionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
  }

  get availableNavItems(): NavItem[] {
    const permissions = this.permissionService.getPermissions();
    return this.navItems.filter(item =>
      !item.permission || permissions[item.permission as keyof typeof permissions]
    );
  }

  getUserRoleLabel(): string {
    if (this.permissionService.isAdmin()) return 'ADMIN';
    if (this.permissionService.isBibliothecaire()) return 'BIBLIOTHECAIRE';
    return 'LECTEUR';
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  async handleLogout() {
    const result = await this.authService.signOut();
    if (!result.error) {
      this.router.navigate(['/login']);
    }
  }
}