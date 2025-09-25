# Modern Library Dashboard - Angular

Une application Angular moderne pour la gestion de bibliothèque, transformée à partir du projet React original.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec Supabase
- **Gestion des livres** : Ajout, modification, suppression, recherche
- **Gestion des utilisateurs** : Administration des comptes membres
- **Système de prêts** : Suivi des emprunts et retours
- **Tableau de bord** : Vue d'ensemble avec statistiques en temps réel
- **Rapports** : Analyse des données de la bibliothèque
- **Notifications** : Alertes pour les retards et événements importants
- **Design responsive** avec Tailwind CSS
- **Interface moderne** et intuitive

## 🛠️ Technologies utilisées

- **Angular 17** - Framework principal
- **TypeScript** - Langage de programmation
- **Tailwind CSS** - Framework CSS utilitaire
- **Supabase** - Backend-as-a-Service (authentification + base de données)
- **Lucide Angular** - Icônes
- **RxJS** - Programmation réactive

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Compte Supabase (pour la base de données et l'authentification)

## 🔧 Installation

1. **Clonez le projet**
   ```bash
   git clone <repository-url>
   cd angular-library-dashboard
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Supabase**

   Modifiez les fichiers de configuration dans `src/environments/` :

   **environment.ts** et **environment.prod.ts** :
   ```typescript
   export const environment = {
     production: false, // true pour production
     supabase: {
       url: 'VOTRE_SUPABASE_URL',
       anonKey: 'VOTRE_SUPABASE_ANON_KEY'
     },
     api: {
       baseUrl: 'VOTRE_API_BASE_URL'
     }
   };
   ```

4. **Configuration Tailwind CSS**

   Tailwind est déjà configuré. Les styles sont dans `src/styles.scss`.

## 🚀 Lancement du projet

### Mode développement
```bash
npm start
# ou
ng serve
```

L'application sera accessible sur `http://localhost:4200`

### Build de production
```bash
npm run build
# ou
ng build --configuration production
```

## 📁 Structure du projet

```
src/
├── app/
│   ├── components/          # Composants Angular
│   │   ├── dashboard/       # Tableau de bord principal
│   │   └── login/          # Page de connexion
│   ├── models/             # Interfaces TypeScript
│   │   ├── user.model.ts   # Types utilisateur
│   │   ├── book.model.ts   # Types livre
│   │   ├── loan.model.ts   # Types prêt
│   │   └── api-response.model.ts # Types API
│   ├── services/           # Services Angular
│   │   ├── supabase.service.ts   # Service d'authentification
│   │   └── api.service.ts        # Service API
│   ├── guards/             # Guards de routage
│   │   └── auth.guard.ts   # Protection des routes
│   ├── app.component.ts    # Composant racine
│   ├── app.config.ts       # Configuration de l'app
│   └── app.routes.ts       # Configuration des routes
├── environments/           # Variables d'environnement
├── styles.scss            # Styles globaux avec Tailwind
└── main.ts                # Point d'entrée de l'application
```

## 🔑 Configuration de l'authentification

### Compte de démonstration
- **Username**: admin
- **Mot de passe**: admin123


## 📊 Fonctionnalités principales

### Dashboard
- Vue d'ensemble avec statistiques clés
- Activité récente
- Prêts à échéance
- Alertes et notifications

### Gestion des livres
- Liste avec recherche et filtres
- Ajout de nouveaux livres
- Modification des informations
- Suivi des exemplaires disponibles

### Gestion des utilisateurs
- Liste des membres
- Informations de contact
- Historique des prêts
- Statut d'adhésion

### Système de prêts
- Création de nouveaux prêts
- Suivi des retours
- Gestion des retards
- Calcul automatique des amendes

## 🎨 Personnalisation du thème

Le thème utilise les variables CSS définies dans `src/styles.scss`. Vous pouvez personnaliser :

- Couleurs primaires et secondaires
- Rayons de bordure
- Espacement
- Typographie

## 🚦 Scripts disponibles

- `npm start` - Lance le serveur de développement
- `npm run build` - Build de production
- `npm test` - Lance les tests unitaires
- `npm run lint` - Vérification du code avec ESLint

## 🔄 Différences avec la version React

Cette version Angular reprend exactement le même design et les mêmes fonctionnalités que la version React originale, mais avec :

- **Architecture Angular** : Services, composants, guards
- **Programmation réactive** avec RxJS
- **Injection de dépendances** Angular
- **Standalone components** (Angular 17+)
- **TypeScript strict** activé

## 🐛 Dépannage

### Erreurs courantes

1. **Erreur de connexion Supabase**
   - Vérifiez vos clés d'API dans les environnements
   - Assurez-vous que les politiques RLS sont correctement configurées

2. **Erreurs de build Tailwind**
   - Vérifiez que PostCSS est correctement configuré
   - Redémarrez le serveur de développement

3. **Erreurs TypeScript**
   - Vérifiez les imports et les types
   - Assurez-vous que toutes les dépendances sont installées

## 📝 TODO / Améliorations futures

- [ ] Implémentation complète des onglets Dashboard
- [ ] Tests unitaires et e2e
- [ ] Internationalisation (i18n)
- [ ] Mode sombre
- [ ] Notifications push
- [ ] Export des données (PDF, Excel)
- [ ] Système de réservation
- [ ] API REST complète
- [ ] PWA (Progressive Web App)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Projet React original disponible sur [Figma](https://www.figma.com/design/cX5ihQGwJc3FLWfYSrYEV7/Modern-Library-Login-Dashboard)
- [Supabase](https://supabase.com) pour l'infrastructure backend
- [Tailwind CSS](https://tailwindcss.com) pour le système de design
- [Lucide](https://lucide.dev) pour les icônes