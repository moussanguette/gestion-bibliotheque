import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminGuard } from './guards/admin.guard';
import { BibliothecaireGuard } from './guards/bibliothecaire.guard';
import { LecteurGuard } from './guards/lecteur.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Dashboard - Accessible à tous les utilisateurs authentifiés
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [LecteurGuard]
  },

  // Catalogue des livres - Accessible à tous les utilisateurs authentifiés
  {
    path: 'books',
    loadComponent: () => import('./components/book-manager/book-manager.component').then(m => m.BookManagerComponent),
    canActivate: [LecteurGuard]
  },
  {
    path: 'add-book',
    loadComponent: () => import('./components/add-book-form/add-book-form.component').then(m => m.AddBookFormComponent),
    canActivate: [BibliothecaireGuard]
  },

  // Gestion des utilisateurs - ADMIN et BIBLIOTHECAIRE uniquement
  {
    path: 'users',
    loadComponent: () => import('./components/user-manager/user-manager.component').then(m => m.UserManagerComponent),
    canActivate: [BibliothecaireGuard]
  },
  {
    path: 'add-user',
    loadComponent: () => import('./components/user-add/user-add.component').then(m => m.UserAddComponent),
    canActivate: [BibliothecaireGuard]
  },

  // Gestion des emprunts - ADMIN et BIBLIOTHECAIRE peuvent tout gérer, LECTEUR peut voir ses emprunts
  {
    path: 'emprunts',
    loadComponent: () => import('./components/emprunt-manager/emprunt-manager.component').then(m => m.EmpruntManagerComponent),
    canActivate: [LecteurGuard]
  },

  // Rapports - ADMIN et BIBLIOTHECAIRE voient tout, LECTEUR voit ses stats personnelles
  {
    path: 'reports',
    loadComponent: () => import('./components/rapports/rapport.component').then(m => m.RapportComponent),
    canActivate: [LecteurGuard]
  },

  // Routes avec contrôle de rôles spécifiques
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      // Ici vous pouvez ajouter des routes spécifiques à l'admin
    ]
  },

  {
    path: '**',
    redirectTo: '/dashboard'
  }
];