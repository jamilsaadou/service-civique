# Migration du système d'uploads

Ce guide explique comment migrer du système d'uploads dans `/public` vers le nouveau système avec dossier externe et nginx.

## 📊 Changements

### Avant (Développement)
- Fichiers stockés dans: `./public/uploads/`
- Accès direct via Next.js: `/uploads/fichier.pdf`
- Limite de taille: ~4.5MB

### Après (Production)
- Fichiers stockés dans: `/var/www/service-civique-uploads/`
- Servis par nginx: `/uploads/fichier.pdf`
- Limite de taille: 50MB

## 🚀 Étapes de migration

### 1. Installer les dépendances (si dotenv n'est pas installé)

```bash
npm install dotenv
```

### 2. Configurer les variables d'environnement

Créez ou modifiez `.env` :

```bash
# Production
UPLOADS_DIR="/var/www/service-civique-uploads"
UPLOADS_BASE_URL="/uploads"
```

Pour le développement local, vous pouvez utiliser :

```bash
# Développement
UPLOADS_DIR="./public/uploads"
UPLOADS_BASE_URL="/uploads"
```

### 3. Exécuter le script de vérification

```bash
node scripts/check-upload-config.js
```

Ce script va :
- Vérifier que le dossier existe
- Tester les permissions
- Vérifier les sous-dossiers
- Tester l'écriture de fichiers

### 4. Configurer le serveur (si nécessaire)

Si le script détecte des problèmes, suivez les instructions dans `DEPLOYMENT.md`.

### 5. Migrer les fichiers existants (optionnel)

Si vous avez déjà des fichiers dans `./public/uploads/`, copiez-les :

```bash
# Sur le serveur
sudo cp -r ./public/uploads/* /var/www/service-civique-uploads/
sudo chown -R $(whoami):$(whoami) /var/www/service-civique-uploads
```

### 6. Mettre à jour la base de données (optionnel)

Si vos chemins en base de données commencent par `uploads/` au lieu de juste le sous-dossier :

```sql
-- Exemple avec SQLite
UPDATE decrets 
SET fichierPdf = REPLACE(fichierPdf, 'uploads/', '')
WHERE fichierPdf LIKE 'uploads/%';

UPDATE decrets 
SET fichierExcel = REPLACE(fichierExcel, 'uploads/', '')
WHERE fichierExcel LIKE 'uploads/%';
```

**Note:** Les nouveaux imports stockent déjà le bon format: `pdf/12345_decret.pdf`

### 7. Redémarrer l'application

```bash
npm run build
pm2 reload service-civique
```

## 🧪 Tests

### Test 1: Vérifier l'upload

1. Connectez-vous à l'interface admin
2. Allez dans "Import de Décret"
3. Uploadez un fichier Excel et PDF de test
4. Vérifiez que les fichiers sont créés dans `/var/www/service-civique-uploads/`

### Test 2: Vérifier le téléchargement

1. Dans la liste des décrets, cliquez sur "Télécharger PDF"
2. Le fichier doit se télécharger correctement

### Test 3: Vérifier via nginx

```bash
# Remplacez par votre domaine et un fichier existant
curl -I http://votre-domaine.com/uploads/pdf/1234567890_decret.pdf
# Devrait retourner 200 OK
```

## 🐛 Dépannage

### Erreur "Permission denied"

```bash
# Vérifier l'utilisateur qui exécute Node.js
ps aux | grep node

# Ajuster les permissions
sudo chown -R VOTRE_USER:VOTRE_USER /var/www/service-civique-uploads
sudo chmod -R 755 /var/www/service-civique-uploads
```

### Erreur "ENOENT: no such file or directory"

Le dossier n'existe pas. Créez-le :

```bash
sudo mkdir -p /var/www/service-civique-uploads/{excel,pdf,images}
sudo chown -R $(whoami):$(whoami) /var/www/service-civique-uploads
```

### Fichiers uploadés mais non accessibles via URL

Vérifiez la configuration nginx :

```bash
sudo nano /etc/nginx/sites-available/service-civique

# Vérifiez la directive location /uploads/
# Elle doit pointer vers le bon dossier avec "alias"
```

### Les fichiers s'uploadent en local mais pas en prod

1. Vérifiez les logs nginx: `sudo tail -f /var/log/nginx/error.log`
2. Vérifiez que `client_max_body_size 50M;` est bien dans la config nginx
3. Rechargez nginx: `sudo systemctl reload nginx`

## 📝 Checklist de migration

- [ ] Variables d'environnement configurées dans `.env`
- [ ] Dossier `/var/www/service-civique-uploads` créé
- [ ] Permissions correctes sur le dossier
- [ ] Configuration nginx en place avec `client_max_body_size 50M`
- [ ] nginx rechargé
- [ ] Application redémarrée
- [ ] Test d'upload réussi
- [ ] Test de téléchargement réussi
- [ ] Fichiers existants migrés (si applicable)

## 🔄 Rollback (en cas de problème)

Si vous devez revenir à l'ancien système temporairement :

1. Dans `.env`, configurez :
   ```bash
   UPLOADS_DIR="./public/uploads"
   UPLOADS_BASE_URL="/uploads"
   ```

2. Redémarrez l'application :
   ```bash
   pm2 reload service-civique
   ```

Les fichiers seront à nouveau stockés dans `/public/uploads`.

## 📚 Ressources

- `DEPLOYMENT.md` - Guide complet de déploiement
- `scripts/check-upload-config.js` - Script de diagnostic
- `scripts/setup-server.sh` - Script de configuration serveur
- `nginx-config-example.conf` - Configuration nginx

