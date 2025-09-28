# Système de Permissions - BiblioManager

## Vue d'ensemble

Le système de permissions de BiblioManager contrôle l'accès aux différents écrans et fonctionnalités selon le rôle de l'utilisateur. Il est basé sur trois rôles principaux : **ADMIN**, **BIBLIOTHECAIRE** et **LECTEUR**.

## Architecture des Permissions

### 🔐 Guards (Gardiens de Route)

Les guards contrôlent l'accès aux routes avant leur chargement :

- **AuthGuard** (`src/app/guards/auth.guard.ts`) - Vérifie l'authentification
- **RoleGuard** (`src/app/guards/role.guard.ts`) - Contrôle basé sur des rôles spécifiques
- **AdminGuard** (`src/app/guards/admin.guard.ts`) - Accès ADMIN uniquement
- **BibliothecaireGuard** (`src/app/guards/bibliothecaire.guard.ts`) - Accès ADMIN + BIBLIOTHECAIRE
- **LecteurGuard** (`src/app/guards/lecteur.guard.ts`) - Tous les rôles authentifiés

### 🎯 Service de Permissions

Le **PermissionService** (`src/app/services/permission.service.ts`) centralise la logique des permissions :

```typescript
// Vérifications de rôles
isAdmin(): boolean
isBibliothecaire(): boolean
isLecteur(): boolean

// Permissions composées
canManageBooks(): boolean
canManageUsers(): boolean
canDeleteAdmin(): boolean
canViewAllReports(): boolean
canManageAllEmprunts(): boolean
```

### 🎨 Directive de Permissions

La directive **HasPermissionDirective** (`src/app/directives/has-permission.directive.ts`) permet de masquer/afficher des éléments dans les templates :

```html
<!-- Afficher seulement pour les ADMIN -->
<button *appHasPermission="'ADMIN'">Administration</button>

<!-- Afficher pour ADMIN et BIBLIOTHECAIRE -->
<div *appHasPermission="'canManageBooks'">Gestion des livres</div>

<!-- Afficher pour plusieurs rôles -->
<section *appHasPermission="['ADMIN', 'BIBLIOTHECAIRE']">...</section>
```

## Hiérarchie des Rôles

### 👑 ADMIN - Accès Complet
- **Peut tout faire** dans le système
- Supprimer n'importe quel utilisateur (y compris d'autres admins)
- Accès à tous les rapports et statistiques
- Gestion complète des livres, utilisateurs, emprunts

### 📚 BIBLIOTHECAIRE - Accès Étendu
- Gestion complète des livres, catégories, auteurs
- Création et gestion des comptes utilisateurs
- Gestion des emprunts (création, modification, retour, suppression)
- Accès aux rapports et statistiques
- **NE PEUT PAS** supprimer les utilisateurs ADMIN ⚠️
- Peut créer de nouveaux comptes via l'inscription

### 👤 LECTEUR - Accès Limité
- Voir les livres disponibles (consultation du catalogue)
- Emprunter des livres (création de nouveaux emprunts)
- Voir ses propres emprunts (historique personnel uniquement)
- Voir son propre rapport (statistiques personnelles)
- Retourner ses livres (uniquement ses propres emprunts)

## Configuration des Routes

Le fichier `src/app/app.routes.ts` utilise les guards pour protéger les routes :

```typescript
// Exemple de configuration
{
  path: 'books',
  component: BookManagerComponent,
  canActivate: [BibliothecaireGuard] // ADMIN + BIBLIOTHECAIRE seulement
},
{
  path: 'reports',
  component: RapportComponent,
  canActivate: [LecteurGuard] // Tous les utilisateurs authentifiés
}
```

## Utilisation dans les Composants

### Injection du Service
```typescript
constructor(
  public permissionService: PermissionService
) {}
```

### Vérification des Permissions
```typescript
// Dans le composant
get canEditUser(): boolean {
  return this.permissionService.canManageUsers();
}

// Dans le template
<button *ngIf="permissionService.isAdmin()" (click)="deleteUser()">
  Supprimer
</button>
```

### Navigation Conditionnelle
```typescript
get availableTabs() {
  return this.tabs.filter(tab =>
    !tab.permission ||
    this.permissionService.getPermissions()[tab.permission]
  );
}
```

## Interface Utilisateur Adaptative

### Badge de Rôle
L'interface affiche un badge coloré indiquant le rôle de l'utilisateur :
- 🔴 Rouge : ADMIN
- 🔵 Bleu : BIBLIOTHECAIRE
- 🟢 Vert : LECTEUR

### Tabs Dynamiques
Les onglets du dashboard s'adaptent automatiquement selon les permissions :
- **Vue d'ensemble** : Tous les utilisateurs
- **Livres** : ADMIN + BIBLIOTHECAIRE uniquement
- **Utilisateurs** : ADMIN + BIBLIOTHECAIRE uniquement
- **Emprunts** : Tous (mais contenu filtré selon le rôle)
- **Rapports** : Tous (mais contenu filtré selon le rôle)

### Messages d'Accès Restreint
Les utilisateurs sans permissions voient un message informatif au lieu du contenu restreint.

## Gestion des Erreurs

### Page Non Autorisée
Une page `/unauthorized` est affichée quand l'utilisateur tente d'accéder à une route non permise.

### Redirection Automatique
Les guards redirigent automatiquement :
- Vers `/login` si non authentifié
- Vers `/unauthorized` si permissions insuffisantes

## Sécurité

### Points Clés
✅ **Validation côté serveur** : Les permissions sont également validées côté backend
✅ **Isolation des données** : Les LECTEUR ne voient que leurs propres données
✅ **Protection hiérarchique** : Les BIBLIOTHECAIRE ne peuvent pas supprimer les ADMIN
✅ **Tokens sécurisés** : Authentification JWT avec expiration

### Bonnes Pratiques
- Toujours vérifier les permissions côté serveur
- Ne jamais faire confiance uniquement aux validations frontend
- Utiliser HTTPS en production
- Expiration automatique des sessions

## Tests et Développement

### Tests des Guards
```bash
# Tester la compilation
ng build

# Démarrer en mode développement
ng serve --port 4200
```

### Simulation des Rôles
Pour tester les différents rôles, connectez-vous avec des comptes ayant différents niveaux de permissions.

## Maintenance

### Ajouter de Nouvelles Permissions
1. Mettre à jour `PermissionService.getPermissions()`
2. Ajouter la logique métier dans les méthodes appropriées
3. Mettre à jour `HasPermissionDirective.checkSinglePermission()`
4. Tester avec tous les rôles

### Ajouter de Nouveaux Rôles
1. Mettre à jour les interfaces de modèles
2. Ajouter les méthodes dans `PermissionService`
3. Créer un nouveau guard si nécessaire
4. Mettre à jour les routes et composants

Ce système offre une gestion granulaire et flexible des permissions, s'adaptant aux besoins évolutifs de votre bibliothèque.