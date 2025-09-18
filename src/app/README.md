# Structure de l'Application Angular - Gestion Bibliothèque

## Architecture Modulaire

L'application suit une architecture modulaire avec une organisation claire des composants dans des dossiers spécialisés.

### Structure des Dossiers

```
src/app/
├── components/           # Tous les composants UI
│   ├── admin/           # Interface d'administration
│   ├── ajout-livre/     # Formulaire d'ajout de livre
│   ├── detail-livre/    # Détails d'un livre
│   ├── header/          # En-tête de l'application
│   ├── home/            # Page d'accueil
│   ├── login/           # Connexion utilisateur
│   ├── profil/          # Profil utilisateur
│   ├── register/        # Inscription utilisateur
│   ├── reset-password/  # Réinitialisation mot de passe
│   ├── sidebar/         # Navigation latérale
│   ├── components.module.ts  # Module des composants
│   └── index.ts         # Barrel exports
├── services/            # Services métier
│   ├── api.service.ts   # Service API principal
│   ├── auth.service.ts  # Service d'authentification
│   ├── livre.service.ts # Service de gestion des livres
│   └── user.service.ts  # Service de gestion des utilisateurs
├── guards/              # Guards de route
│   └── auth.guard.ts    # Protection des routes authentifiées
├── interceptors/        # Intercepteurs HTTP
│   └── auth.interceptor.ts # Injection du token d'auth
├── app.routes.ts        # Configuration des routes
└── app.ts               # Composant racine
```

### Conventions de Nommage

- **Composants**: `[nom].component.ts`, `[nom].component.html`, `[nom].component.css`
- **Services**: `[nom].service.ts`
- **Guards**: `[nom].guard.ts`
- **Interceptors**: `[nom].interceptor.ts`

### Routes Configurées

| Route | Composant | Protection |
|-------|-----------|------------|
| `/` | HomeComponent | ✅ AuthGuard |
| `/home` | HomeComponent | ✅ AuthGuard |
| `/login` | LoginComponent | ❌ Public |
| `/register` | RegisterComponent | ❌ Public |
| `/reset-password` | ResetPasswordComponent | ❌ Public |
| `/admin` | AdminComponent | ✅ AuthGuard |
| `/ajouter-livre` | AjoutLivreComponent | ✅ AuthGuard |
| `/detail-livre/:id` | DetailLivreComponent | ✅ AuthGuard |
| `/profil` | ProfilComponent | ✅ AuthGuard |

### Import Simplifié

Grâce au barrel export (`components/index.ts`), les imports sont simplifiés :

```typescript
// Au lieu de multiples imports
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';

// Import groupé
import { HomeComponent, LoginComponent } from './components';
```

### Authentification

- **AuthGuard**: Protège les routes nécessitant une authentification
- **AuthInterceptor**: Ajoute automatiquement le token JWT aux requêtes
- **AuthService**: Gère l'état d'authentification et le stockage des tokens