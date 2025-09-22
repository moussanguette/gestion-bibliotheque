# Debug Guide - Auteurs et Catégories

## 🔍 Problème Identifié

Les selects d'auteurs et catégories dans le formulaire d'ajout de livre n'affichent pas de données.

## ✅ Corrections Appliquées

### 1. **Passage des props au composant** :
```html
<!-- AVANT (manquant) -->
<app-add-book-form [isVisible]="showAddForm"></app-add-book-form>

<!-- APRÈS (corrigé) -->
<app-add-book-form
  [isVisible]="showAddForm"
  [authors]="authors"
  [categories]="categories">
</app-add-book-form>
```

### 2. **Logs ajoutés pour debug** :
- **BookManager** : `loadAuthors()` et `loadCategories()`
- **AddBookForm** : `ngOnInit()` pour voir les données reçues
- **Dashboard** : Test des endpoints API

### 3. **Endpoints vérifiés** :
- `GET /api/auteurs` → `getAuthorsSimple()`
- `GET /api/categories` → `getCategoriesSimple()`

## 🧪 Tests à Effectuer

### 1. **Console du Navigateur (F12)** :

Lors du chargement du dashboard, vérifiez ces logs :

```
🧪 Testing API connection...
✅ Authors API Response: [...]
📊 Authors count: X
✅ Categories API Response: [...]
📊 Categories count: Y
```

### 2. **Onglet Livres** :

Lors du clic sur l'onglet "Livres", vérifiez :

```
🔍 Loading authors...
✅ Authors loaded: [...]
📊 Authors count: X
🔍 Loading categories...
✅ Categories loaded: [...]
📊 Categories count: Y
```

### 3. **Ouverture du Formulaire** :

Lors du clic "Ajouter un livre", vérifiez :

```
📝 AddBookForm initialized
👥 Authors received: [...]
🏷️ Categories received: [...]
```

## 🚨 Diagnostics Possibles

### Si les endpoints échouent :
- ❌ `Authors API Error:` → Vérifier `/api/auteurs`
- ❌ `Categories API Error:` → Vérifier `/api/categories`

### Si les données ne sont pas passées :
- Les logs `AddBookForm initialized` montrent des tableaux vides
- Problème de binding dans le template

### Si les selects restent vides :
- Données reçues mais pas affichées
- Problème dans le template HTML du formulaire

## 🔧 Vérifications Backend

Assurez-vous que ces endpoints existent et retournent des données :

### `/api/auteurs` doit retourner :
```json
[
  {
    "id": 1,
    "nom": "Hugo",
    "prenom": "Victor"
  },
  {
    "id": 2,
    "nom": "Orwell",
    "prenom": "George"
  }
]
```

### `/api/categories` doit retourner :
```json
[
  {
    "id": 1,
    "nom": "Fiction"
  },
  {
    "id": 2,
    "nom": "Science-fiction"
  }
]
```

## 🎯 Étapes de Test

1. **Lancez l'application**
2. **Ouvrez la console (F12)**
3. **Connectez-vous au Dashboard**
4. **Vérifiez les logs de test API**
5. **Cliquez sur l'onglet "Livres"**
6. **Vérifiez les logs de chargement**
7. **Cliquez "Ajouter un livre"**
8. **Vérifiez les logs du formulaire**
9. **Inspectez les selects dans le formulaire**

Les logs vous indiqueront exactement où le problème se situe !