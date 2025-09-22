# Guide de Test - Ajout de Livre

## ✅ Structure des Données Envoyées

Le formulaire d'ajout de livre envoie maintenant cette structure via `POST /api/livres` :

```json
{
  "titre": "Le Petit Prince",
  "isbn": "978-2-07-040857-4",
  "status": "AVAILABLE",
  "datePublication": "1943-04-06T00:00:00",
  "nombrePages": 96,
  "copiesTotal": 5,
  "copiesAvailable": 5,
  "resume": "L'histoire d'un petit prince qui voyage de planète en planète à la recherche de l'amitié et du sens de la vie.",
  "categorieId": 1,
  "auteurIds": [1, 2]
}
```

## 🔧 Champs du Formulaire

### Champs Obligatoires (*) :
- **Titre*** : Titre du livre
- **ISBN*** : Code ISBN (avec bouton de génération automatique)
- **Catégorie*** : Sélection dans la liste des catégories
- **Auteurs*** : Sélection multiple des auteurs
- **Date de publication*** : Date au format ISO
- **Nombre de pages*** : Nombre entier positif
- **Nombre total d'exemplaires*** : Entre 1 et 100
- **Exemplaires disponibles*** : Entre 0 et le total
- **Résumé*** : Description du livre

### Champs Automatiques :
- **Statut** : AVAILABLE par défaut (modifiable)

## 🧪 Tests à Effectuer

### 1. **Test de Validation** :
- [ ] Champs obligatoires → Message d'erreur si vides
- [ ] copiesAvailable > copiesTotal → Ajustement automatique
- [ ] ISBN valide → Format vérifié
- [ ] Date valide → Format ISO requis

### 2. **Test d'Ajout** :
1. Aller sur Dashboard → Onglet "Livres"
2. Cliquer "Ajouter un livre"
3. Remplir le formulaire avec données de test
4. Vérifier les logs dans la console (F12)
5. Confirmer l'ajout et la mise à jour de la liste

### 3. **Données de Test** :
```
Titre: "Le Petit Prince"
ISBN: "978-2-07-040857-4" (ou générer)
Statut: "AVAILABLE"
Date: "1943-04-06"
Pages: 96
Total: 5
Disponibles: 5
Catégorie: Sélectionner une existante
Auteurs: Sélectionner un ou plusieurs
Résumé: "L'histoire d'un petit prince..."
```

## 🔍 Debug et Logs

Le composant génère ces logs :
- `📝 Adding book with data:` → Données envoyées
- `✅ Book added successfully:` → Réponse de l'API
- `❌ Error adding book:` → Erreurs éventuelles

## 🎯 Points de Vérification

1. **Frontend** → Formulaire adapté à la nouvelle structure
2. **API Call** → POST /api/livres avec bon format
3. **Validation** → Contraintes respectées
4. **Response** → Livre ajouté et liste mise à jour
5. **UX** → Messages de succès/erreur appropriés

## 🚀 Status

- ✅ **FormData Model** : Updated to new structure
- ✅ **Form Fields** : Adapted for copiesTotal/copiesAvailable
- ✅ **Validation** : Constraints implemented
- ✅ **API Integration** : POST /api/livres configured
- ✅ **Debug Logs** : Console logging active

**Le formulaire d'ajout est maintenant 100% compatible avec votre nouvelle API !**