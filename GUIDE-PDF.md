# Guide d'utilisation des fichiers PDF des décrets

## Vue d'ensemble

Le système permet maintenant d'importer et de télécharger les fichiers PDF des décrets officiels. Cette fonctionnalité assure que chaque décret publié dispose de son document PDF officiel signé, accessible aux citoyens pour consultation et téléchargement.

## Fonctionnalités implémentées

### 1. Import des fichiers PDF

#### Lors de la création d'un décret
- **Page d'import** : `/ansi-admin/import`
- **Champs requis** :
  - Fichier Excel (liste des affectations)
  - **Fichier PDF** (décret officiel signé)
  - Numéro du décret
  - Titre du décret
  - Description (optionnelle)

#### Validation des fichiers
- **Excel** : Extensions acceptées `.xlsx`, `.xls`
- **PDF** : Extension acceptée `.pdf`
- **Stockage** : Les fichiers sont sauvegardés dans `public/uploads/`
  - Excel : `public/uploads/excel/`
  - PDF : `public/uploads/pdf/`

#### Nommage des fichiers
- Format : `{timestamp}_{nom_original}`
- Exemple : `1703875200000_decret_2024_001.pdf`

### 2. Téléchargement des fichiers PDF

#### Interface d'administration
- **Page de gestion** : `/ansi-admin/decrets`
- **Bouton de téléchargement** : Disponible pour chaque décret
- **États du bouton** :
  - ✅ Actif (vert) : Fichier PDF disponible
  - ❌ Désactivé (gris) : Aucun fichier PDF associé

#### Interface publique
- **Page de consultation** : `/consultation`
- **Boutons de téléchargement** :
  - Dans les résultats de recherche
  - Dans le tableau complet des affectations
  - Versions desktop et mobile

#### API de téléchargement
- **Endpoint** : `GET /api/decrets/[id]/download`
- **Sécurité** : Seuls les décrets publiés peuvent être téléchargés
- **Format de réponse** : Fichier PDF avec nom `{numero_decret}.pdf`

### 3. Gestion des erreurs

#### Cas d'erreur gérés
- Fichier PDF manquant
- Décret non publié
- Fichier introuvable sur le serveur
- Erreurs de lecture de fichier

#### Messages d'erreur
- `"Aucun fichier PDF associé à ce décret"`
- `"Seuls les décrets publiés peuvent être téléchargés"`
- `"Fichier PDF introuvable sur le serveur"`

## Structure technique

### Base de données
```sql
-- Champ dans la table decrets
fichierPdf VARCHAR(255) -- Chemin vers le fichier PDF
```

### API Routes
```
POST /api/decrets/import          -- Import avec fichiers
GET  /api/decrets/[id]/download   -- Téléchargement PDF
GET  /api/decrets                 -- Liste avec champs PDF
```

### Services
```typescript
// DecretService.createDecret()
// Paramètres ajoutés :
- fichierExcel?: string
- fichierPdf?: string
```

## Utilisation pratique

### Pour les administrateurs

1. **Créer un nouveau décret** :
   - Aller sur `/ansi-admin/import`
   - Sélectionner le fichier Excel des affectations
   - **Sélectionner le fichier PDF du décret signé**
   - Remplir les informations du décret
   - Cliquer sur "Importer"

2. **Publier un décret** :
   - Aller sur `/ansi-admin/decrets`
   - Cliquer sur "Publier" pour un décret en brouillon
   - Le PDF devient alors téléchargeable publiquement

3. **Télécharger un PDF** :
   - Sur la liste des décrets, cliquer sur l'icône de téléchargement
   - Le fichier se télécharge automatiquement

### Pour le public

1. **Rechercher une affectation** :
   - Aller sur `/consultation`
   - Rechercher par nom, prénom ou institution
   - Cliquer sur "Télécharger le décret officiel"

2. **Parcourir toutes les affectations** :
   - Sur la même page, consulter le tableau complet
   - Cliquer sur l'icône PDF pour télécharger

## Sécurité et bonnes pratiques

### Contrôles d'accès
- ✅ Seuls les décrets publiés sont téléchargeables publiquement
- ✅ Validation des types de fichiers à l'import
- ✅ Vérification de l'existence des fichiers

### Stockage des fichiers
- 📁 Dossier : `public/uploads/pdf/`
- 🔒 Accès : Via API seulement (pas d'accès direct)
- 📝 Nommage : Horodatage pour éviter les conflits

### Performance
- ⚡ Téléchargement direct depuis le système de fichiers
- 📊 Pas de mise en cache (fichiers officiels)
- 🎯 Nom de fichier personnalisé pour l'utilisateur

## Dépannage

### Problèmes courants

1. **"Fichier PDF introuvable"**
   - Vérifier que le fichier existe dans `public/uploads/pdf/`
   - Vérifier les permissions du dossier

2. **"Seuls les décrets publiés peuvent être téléchargés"**
   - Le décret doit avoir le statut `PUBLIE`
   - Publier le décret depuis l'interface d'administration

3. **Bouton de téléchargement désactivé**
   - Aucun fichier PDF n'est associé au décret
   - Réimporter le décret avec un fichier PDF

### Logs utiles
```bash
# Vérifier les erreurs de téléchargement
console.error('Erreur lors de la lecture du fichier PDF:', fileError);

# Vérifier les erreurs d'import
console.error('Erreur lors de l\'import:', error);
```

## Évolutions futures possibles

- 🔄 Mise à jour des fichiers PDF existants
- 📱 Prévisualisation des PDF dans l'interface
- 🗂️ Gestion des versions de fichiers
- ☁️ Intégration avec un service de stockage cloud
- 📊 Statistiques de téléchargement
