# 🚀 Guide Rapide - Mise en Production

## ✅ Ce qui a été fait

1. ✅ Configuration nginx pour servir les fichiers statiques
2. ✅ Système de stockage externe (`/var/www/service-civique-uploads`)
3. ✅ Augmentation des limites d'upload (50MB)
4. ✅ Code API modifié pour utiliser le nouveau système
5. ✅ Scripts de diagnostic et configuration

## 📋 Étapes à suivre sur votre VPS

### 1️⃣ Créer le fichier `.env` (à la racine du projet)

```bash
cat > .env << 'EOF'
# Base de données
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (générez une clé forte)
JWT_SECRET="CHANGEZ_MOI_AVEC_UNE_CLE_FORTE"

# Configuration uploads PRODUCTION
UPLOADS_DIR="/var/www/service-civique-uploads"
UPLOADS_BASE_URL="/uploads"

# Environnement
NODE_ENV="production"
EOF
```

**🔐 Important:** Générez un JWT_SECRET fort :
```bash
openssl rand -base64 32
```

### 2️⃣ Configurer le serveur

```bash
# Option A: Script automatique
sudo chmod +x scripts/setup-server.sh
sudo bash scripts/setup-server.sh

# Option B: Commandes manuelles
sudo mkdir -p /var/www/service-civique-uploads/{excel,pdf,images}
sudo chown -R $(whoami):$(whoami) /var/www/service-civique-uploads
sudo chmod -R 755 /var/www/service-civique-uploads
```

### 3️⃣ Configurer nginx

```bash
# Copier la configuration
sudo cp nginx-config-example.conf /etc/nginx/sites-available/service-civique

# Éditer pour mettre votre domaine
sudo nano /etc/nginx/sites-available/service-civique
# Remplacez "votre-domaine.com" par votre vrai domaine

# Activer le site
sudo ln -s /etc/nginx/sites-available/service-civique /etc/nginx/sites-enabled/

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

### 4️⃣ Vérifier la configuration

```bash
# Script de diagnostic
node scripts/check-upload-config.js

# Ce script vérifie:
# - Existence du dossier
# - Permissions
# - Capacité d'écriture
```

### 5️⃣ Build et démarrer

```bash
# Installer les dépendances
npm install

# Build
npm run build

# Démarrer avec PM2
pm2 start npm --name "service-civique" -- start
pm2 save
```

### 6️⃣ Tester

1. Accédez à votre domaine
2. Connectez-vous en tant qu'admin
3. Allez dans "Import de Décret"
4. Uploadez un fichier Excel et PDF de test
5. Vérifiez que les fichiers apparaissent dans `/var/www/service-civique-uploads/`

## 🔍 Diagnostic en cas de problème

### Erreur lors de l'upload (l'erreur dans votre frontend)

**Causes possibles:**

1. **Permissions incorrectes**
   ```bash
   # Vérifier
   ls -la /var/www/service-civique-uploads
   
   # Corriger
   sudo chown -R $(whoami):$(whoami) /var/www/service-civique-uploads
   sudo chmod -R 755 /var/www/service-civique-uploads
   ```

2. **Limite nginx trop basse**
   ```bash
   # Vérifier la config nginx
   grep -r "client_max_body_size" /etc/nginx/sites-available/service-civique
   # Doit afficher: client_max_body_size 50M;
   
   # Si absent, ajoutez-le et rechargez
   sudo systemctl reload nginx
   ```

3. **Variables d'environnement non chargées**
   ```bash
   # Vérifier que .env existe
   cat .env
   
   # Redémarrer l'app
   pm2 restart service-civique
   ```

### Consulter les logs

```bash
# Logs nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs application
pm2 logs service-civique

# Logs système
journalctl -u nginx -f
```

## 📊 Commandes utiles

```bash
# Vérifier l'espace disque
df -h /var/www/service-civique-uploads

# Compter les fichiers uploadés
find /var/www/service-civique-uploads -type f | wc -l

# Voir les derniers fichiers uploadés
ls -lhtr /var/www/service-civique-uploads/pdf/ | tail -n 5

# Tester l'accès nginx à un fichier
curl -I http://votre-domaine.com/uploads/pdf/nom-fichier.pdf
```

## 🆘 Besoin d'aide ?

1. Exécutez le script de diagnostic:
   ```bash
   node scripts/check-upload-config.js
   ```

2. Consultez les guides détaillés:
   - `DEPLOYMENT.md` - Guide complet
   - `MIGRATION-UPLOADS.md` - Guide de migration
   - `TROUBLESHOOTING-LOGIN.md` - Problèmes de connexion

3. Vérifiez les logs (voir commandes ci-dessus)

## 🎉 C'est tout !

Une fois ces étapes complétées, votre système d'upload devrait fonctionner parfaitement en production avec :
- ✅ Uploads jusqu'à 50MB
- ✅ Fichiers stockés en dehors de l'app
- ✅ nginx servant les fichiers statiques efficacement
- ✅ Permissions correctes

