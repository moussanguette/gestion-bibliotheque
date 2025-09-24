# Guide d'intégration API - Angular Library Dashboard

## 🔌 Configuration API

L'application Angular est maintenant configurée pour utiliser votre API backend sur `http://localhost:8080/api`.

## 🔐 Authentification

### Format de connexion requis

**Endpoint**: `POST /api/auth/signin`

**Body JSON**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Réponse attendue**:
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "user_metadata": {
      "name": "string"
    }
  },
  "token": "jwt_token_string"
}
```

### Compte de démonstration
- **Username**: `admin`
- **Password**: `password123`

## 📚 Endpoints implémentés

### **Livres** (`/api/livres`)
- `GET /api/livres` - Liste tous les livres
- `GET /api/livres/{id}` - Récupère un livre par ID
- `GET /api/livres/disponibles` - Livres disponibles
- `GET /api/livres/empruntes` - Livres empruntés
- `POST /api/livres` - Créer un nouveau livre
- `PUT /api/livres/{id}` - Modifier un livre
- `DELETE /api/livres/{id}` - Supprimer un livre

### **Emprunts** (`/api/emprunts`)
- `GET /api/emprunts` - Tous les emprunts
- `GET /api/emprunts/actifs` - Emprunts actifs
- `GET /api/emprunts/retard` - Emprunts en retard
- `GET /api/emprunts/bientot-echeance` - Bientôt dus
- `POST /api/emprunts` - Créer un emprunt
- `PUT /api/emprunts/{id}/retourner` - Retourner un livre

### **Utilisateurs** (`/api/users`)
- `GET /api/users` - Tous les utilisateurs
- `GET /api/users/{id}` - Utilisateur par ID
- `POST /api/users` - Créer utilisateur
- `PUT /api/users/{id}` - Modifier utilisateur

### **Auteurs** (`/api/auteurs`)
- `GET /api/auteurs` - Tous les auteurs
- `POST /api/auteurs` - Créer auteur
- `PUT /api/auteurs/{id}` - Modifier auteur

### **Notifications** (`/api/notifications`)
- `GET /api/notifications/user/{userId}/unread` - Non lues
- `PUT /api/notifications/{id}/read` - Marquer comme lu

## 🛡️ Authentification JWT

L'application envoie automatiquement le token JWT dans le header :
```
Authorization: Bearer <jwt_token>
```

## 📋 Format des données

### Livre (Book)
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publishYear: number;
  publisher?: string;
  description?: string;
  copiesTotal: number;
  copiesAvailable: number;
  status: 'available' | 'partially_borrowed' | 'all_borrowed';
  addedDate: Date;
}
```

### Emprunt
```typescript
interface Emprunt {
  id: string;
  bookId: string;
  userId: string;
  bookTitle?: string;
  userName?: string;
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'active' | 'returned' | 'overdue';
  renewalCount: number;
  maxRenewals: number;
  fine?: number;
}
```

## 🔄 Gestion des erreurs

L'application Angular :
- Affiche les données mockées si l'API n'est pas disponible
- Gère automatiquement les erreurs de réseau
- Affiche des messages d'erreur utilisateur-friendly
- Log les erreurs dans la console pour le debug

## 🚀 Pour démarrer

1. **Backend** : Lancez votre API sur `http://localhost:8080`
2. **Frontend** : `npm start` (port 4200)
3. **Connexion** : Utilisez `admin` / `password123`

L'application basculera automatiquement vers votre API dès qu'elle détectera qu'elle est disponible !

## 🐛 Debug

Pour vérifier les appels API :
- Ouvrez les DevTools (F12)
- Onglet Network pour voir les requêtes HTTP
- Console pour voir les logs d'erreur

L'application fonctionne en mode "fallback" avec des données mockées par défaut, donc elle démarrera même sans votre API backend.