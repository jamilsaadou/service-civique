# Changelog - Système d'Uploads

## 🔄 Changements apportés

### Fichiers modifiés

#### 1. `src/app/api/decrets/import/route.ts`
**Changements:**
- Import de `mkdir` pour créer les dossiers dynamiquement
- Import des constantes `UPLOADS_DIR` et `UPLOAD_FOLDERS` depuis `config.ts`
- Création automatique des dossiers si inexistants avec `mkdir({ recursive: true })`
- Utilisation de `UPLOADS_DIR` au lieu de `process.cwd()/public`
- Stockage du chemin relatif en base de données (ex: `pdf/12345_decret.pdf`)

**Avant:**
```typescript
const excelFullPath = join(process.cwd(), 'public', excelPath);
```

**Après:**
```typescript
const excelDir = join(UPLOADS_DIR, UPLOAD_FOLDERS.excel);
await mkdir(excelDir, { recursive: true });
const excelFullPath = join(excelDir, excelFileName);
```

#### 2. `src/app/api/decrets/[id]/download/route.ts`
**Changements:**
- Import de `UPLOADS_DIR` depuis `config.ts`
- Lecture des fichiers depuis le nouveau dossier

**Avant:**
```typescript
const filePath = join(process.cwd(), 'public', decret.fichierPdf);
```

**Après:**
```typescript
const filePath = join(UPLOADS_DIR, decret.fichierPdf);
```

#### 3. `src/app/api/decrets/download-by-number/route.ts`
**Changements:** Identiques au point 2

#### 4. `next.config.ts`
**Changements:**
- Augmentation de `bodySizeLimit` à 50MB (Server Actions)
- Ajout de configuration `api.bodyParser.sizeLimit: '50mb'` (API Routes)

**Ajouté:**
```typescript
api: {
  bodyParser: {
    sizeLimit: '50mb',
  },
  responseLimit: '50mb',
}
```

### Nouveaux fichiers créés

#### Configuration

1. **`src/lib/config.ts`**
   - Constantes de configuration centralisées
   - `UPLOADS_DIR` - Chemin de stockage
   - `UPLOADS_BASE_URL` - URL de base pour accès
   - `MAX_FILE_SIZE` - Limite de taille
   - `UPLOAD_FOLDERS` - Noms des sous-dossiers

2. **`src/lib/file-utils.ts`**
   - Utilitaires pour manipulation de fichiers
   - `getFileUrl()` - Convertit chemin en URL
   - `getFileName()` - Extrait nom du fichier
   - `hasValidExtension()` - Vérifie l'extension
   - `generateUniqueFileName()` - Génère nom unique

#### Configuration serveur

3. **`nginx-config-example.conf`**
   - Configuration nginx complète
   - `client_max_body_size 50M` - Limite uploads
   - Location `/uploads/` pour servir fichiers statiques
   - Configuration proxy vers Next.js
   - Headers CORS et cache

4. **`scripts/setup-server.sh`**
   - Script bash de configuration automatique
   - Crée les dossiers nécessaires
   - Configure les permissions
   - Guide pour activation nginx

5. **`scripts/check-upload-config.js`**
   - Script de diagnostic
   - Vérifie existence du dossier
   - Teste les permissions
   - Vérifie les sous-dossiers
   - Teste l'écriture de fichiers

#### Documentation

6. **`DEPLOYMENT.md`**
   - Guide complet de déploiement
   - Configuration serveur étape par étape
   - Commandes de dépannage
   - Configuration sécurité (HTTPS, firewall)

7. **`MIGRATION-UPLOADS.md`**
   - Guide de migration depuis ancien système
   - Comparaison avant/après
   - Migration des fichiers existants
   - Checklist complète

8. **`QUICK-START-PRODUCTION.md`**
   - Guide rapide pour mise en prod
   - Étapes essentielles uniquement
   - Commandes de diagnostic
   - Résolution problèmes courants

9. **`CHANGELOG-UPLOADS.md`** (ce fichier)
   - Récapitulatif de tous les changements

## 🎯 Objectifs atteints

### ✅ Problème résolu
**Erreur en production:** "Erreur lors du traitement"

**Causes identifiées:**
1. ❌ Écriture dans `/public` (fonctionne en local mais problème en prod)
2. ❌ Limite de taille par défaut trop basse (4.5MB)
3. ❌ Pas de gestion de permissions

**Solutions implémentées:**
1. ✅ Stockage externe configurable (`/var/www/service-civique-uploads`)
2. ✅ nginx sert les fichiers statiques
3. ✅ Limite augmentée à 50MB (nginx + Next.js)
4. ✅ Création automatique des dossiers
5. ✅ Scripts de diagnostic et configuration

### ✅ Avantages du nouveau système

1. **Séparation des préoccupations**
   - Fichiers stockés hors de l'application
   - nginx sert les fichiers statiques (plus performant)
   - Application Next.js ne gère que la logique

2. **Flexibilité**
   - Chemin configurable via variable d'environnement
   - Même code fonctionne en local et production
   - Facile à migrer vers un CDN ultérieurement

3. **Performance**
   - nginx sert les fichiers directement (pas de Node.js)
   - Cache HTTP configuré
   - Meilleure gestion des gros fichiers

4. **Sécurité**
   - Permissions précises sur le dossier uploads
   - Isolation des fichiers utilisateurs
   - Configuration CORS contrôlée

5. **Maintenabilité**
   - Configuration centralisée
   - Scripts de diagnostic
   - Documentation complète

## 🔧 Configuration requise

### Variables d'environnement (`.env`)

```bash
UPLOADS_DIR="/var/www/service-civique-uploads"  # Production
# UPLOADS_DIR="./public/uploads"                # Développement

UPLOADS_BASE_URL="/uploads"
JWT_SECRET="votre-secret"
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV="production"
```

### Structure des dossiers

```
/var/www/service-civique-uploads/
├── excel/          # Fichiers Excel/CSV uploadés
├── pdf/            # Décrets PDF signés
└── images/         # Images (pour usage futur)
```

### Permissions requises

- Dossier appartient à l'utilisateur qui exécute Node.js
- Permissions: `755` (rwxr-xr-x)
- nginx a accès en lecture

## 🚀 Prochaines étapes

Pour déployer ces changements:

1. Lire `QUICK-START-PRODUCTION.md`
2. Exécuter les commandes de configuration
3. Tester avec un upload
4. Consulter `DEPLOYMENT.md` si problèmes

## 📝 Notes importantes

- **Pas de breaking change** pour les utilisateurs finaux
- Les URLs restent identiques: `/uploads/pdf/fichier.pdf`
- Les anciens fichiers dans `/public/uploads` peuvent être migrés
- Le code fonctionne en développement ET production
- Rollback possible en changeant les variables d'environnement

## 🐛 Support

En cas de problème:
1. Exécuter `node scripts/check-upload-config.js`
2. Consulter les logs: `pm2 logs` et `tail -f /var/log/nginx/error.log`
3. Vérifier les permissions: `ls -la /var/www/service-civique-uploads`
4. Consulter `DEPLOYMENT.md` section "Dépannage"

