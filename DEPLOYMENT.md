# Guide de Déploiement - Service Civique

## 📋 Prérequis

- VPS Ubuntu avec Node.js installé
- nginx installé
- PM2 (ou autre gestionnaire de processus)
- Accès root ou sudo

## 🚀 Étapes de déploiement

### 1. Configuration du serveur

Exécutez le script de configuration :

```bash
sudo chmod +x scripts/setup-server.sh
sudo bash scripts/setup-server.sh
```

Ou manuellement :

```bash
# Créer le dossier uploads
sudo mkdir -p /var/www/service-civique-uploads/excel
sudo mkdir -p /var/www/service-civique-uploads/pdf
sudo mkdir -p /var/www/service-civique-uploads/images

# Configurer les permissions
# Remplacez 'www-data' par l'utilisateur qui exécute votre app Next.js
sudo chown -R www-data:www-data /var/www/service-civique-uploads
sudo chmod -R 755 /var/www/service-civique-uploads
```

### 2. Configuration nginx

Copiez la configuration nginx :

```bash
sudo cp nginx-config-example.conf /etc/nginx/sites-available/service-civique
```

Éditez le fichier et remplacez `votre-domaine.com` par votre domaine :

```bash
sudo nano /etc/nginx/sites-available/service-civique
```

Activez le site :

```bash
sudo ln -s /etc/nginx/sites-available/service-civique /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Si vous n'avez pas d'autre site
```

Testez et rechargez nginx :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Base de données
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (générer une clé secrète forte)
JWT_SECRET="votre-secret-jwt-tres-securise"

# Configuration des uploads (PRODUCTION)
UPLOADS_DIR="/var/www/service-civique-uploads"
UPLOADS_BASE_URL="/uploads"

# Environnement
NODE_ENV="production"
```

### 4. Vérifier l'utilisateur qui exécute Next.js

Si vous utilisez PM2 :

```bash
pm2 list
# Vérifiez l'utilisateur dans la colonne "user"
```

Ou avec ps :

```bash
ps aux | grep node
```

Si l'utilisateur est différent de `www-data`, ajustez les permissions :

```bash
sudo chown -R VOTRE_USER:VOTRE_USER /var/www/service-civique-uploads
```

### 5. Installation et build

```bash
npm install
npm run build
```

### 6. Démarrer l'application

Avec PM2 :

```bash
pm2 start npm --name "service-civique" -- start
pm2 save
pm2 startup
```

## 🔧 Configuration des limites

### nginx

Les limites sont configurées dans `/etc/nginx/sites-available/service-civique` :

- `client_max_body_size 50M;` - Limite de taille des fichiers uploadés
- Timeouts augmentés pour les requêtes longues

### Next.js

Les limites sont configurées dans `next.config.ts` :

- `bodySizeLimit: '50mb'` pour les Server Actions
- `api.bodyParser.sizeLimit: '50mb'` pour les API Routes

## 🐛 Dépannage

### Erreur "Permission denied" lors de l'upload

```bash
# Vérifier les permissions
ls -la /var/www/service-civique-uploads

# Corriger les permissions
sudo chown -R $(whoami):$(whoami) /var/www/service-civique-uploads
sudo chmod -R 755 /var/www/service-civique-uploads
```

### Erreur "413 Request Entity Too Large"

Vérifiez que nginx est bien configuré avec `client_max_body_size 50M;`

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Fichiers non accessibles via URL

Vérifiez la configuration nginx pour la location `/uploads/` :

```bash
sudo nano /etc/nginx/sites-available/service-civique
# Vérifiez que la directive "alias" pointe vers le bon dossier
```

### Logs

Consulter les logs nginx :

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

Consulter les logs de l'application :

```bash
pm2 logs service-civique
```

## 📁 Structure des dossiers en production

```
/var/www/service-civique-uploads/
├── excel/
│   └── 1234567890_fichier.xlsx
├── pdf/
│   └── 1234567890_decret.pdf
└── images/
    └── logo.png
```

Les fichiers sont accessibles via :
- `http://votre-domaine.com/uploads/excel/1234567890_fichier.xlsx`
- `http://votre-domaine.com/uploads/pdf/1234567890_decret.pdf`

## 🔄 Mise à jour de l'application

```bash
git pull
npm install
npm run build
pm2 reload service-civique
```

## 🔒 Sécurité

1. **Générez un JWT_SECRET fort** :
   ```bash
   openssl rand -base64 32
   ```

2. **Configurez HTTPS** avec Let's Encrypt :
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d votre-domaine.com
   ```

3. **Firewall** :
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

