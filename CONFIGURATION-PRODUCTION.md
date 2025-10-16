# Configuration pour la Production

## 📁 Configuration des Uploads

### Développement

En développement, les fichiers sont automatiquement stockés dans `public/uploads/`.

### Production

Pour la production, vous devez configurer un dossier externe avec les bonnes permissions.

#### 1. Créer le dossier d'uploads

```bash
# Créer le dossier
sudo mkdir -p /var/www/service-civique-uploads

# Créer les sous-dossiers
sudo mkdir -p /var/www/service-civique-uploads/excel
sudo mkdir -p /var/www/service-civique-uploads/pdf
sudo mkdir -p /var/www/service-civique-uploads/images

# Donner les permissions au serveur web
# Pour nginx avec l'utilisateur www-data:
sudo chown -R www-data:www-data /var/www/service-civique-uploads
sudo chmod -R 755 /var/www/service-civique-uploads
```

#### 2. Configurer les variables d'environnement

Ajoutez dans votre fichier `.env` de production:

```env
# Chemin absolu vers le dossier d'uploads
UPLOADS_DIR=/var/www/service-civique-uploads

# URL de base pour accéder aux fichiers (si vous utilisez un CDN ou un serveur de fichiers séparé)
UPLOADS_BASE_URL=/uploads
```

#### 3. Configuration Nginx (Optionnel)

Si vous souhaitez servir les fichiers directement via Nginx pour de meilleures performances:

```nginx
server {
    # ... votre configuration existante ...

    # Servir les fichiers uploadés directement via Nginx
    location /uploads/ {
        alias /var/www/service-civique-uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Sécurité: empêcher l'exécution de scripts
        location ~ \.(php|pl|py|jsp|asp|sh|cgi)$ {
            return 403;
        }
    }
}
```

## 🔒 Sécurité

### Permissions recommandées

```bash
# Dossier principal: lecture + écriture pour le serveur web
chmod 755 /var/www/service-civique-uploads

# Sous-dossiers: lecture + écriture pour le serveur web
chmod 755 /var/www/service-civique-uploads/*

# Fichiers uploadés: lecture seule pour le serveur web après upload
# L'application doit définir les permissions après chaque upload
```

### Protection contre les uploads malveillants

L'application inclut déjà les protections suivantes:
- Validation des types de fichiers (extensions et MIME types)
- Limite de taille (50MB par défaut)
- Noms de fichiers sécurisés (timestamp + nom original nettoyé)

## 📊 Monitoring

### Vérifier l'espace disque

```bash
# Vérifier l'espace utilisé
du -sh /var/www/service-civique-uploads

# Vérifier par type de fichier
du -sh /var/www/service-civique-uploads/*
```

### Nettoyage des anciens fichiers

Vous pouvez utiliser le script fourni:

```bash
# Nettoyer les fichiers de plus de 90 jours
node scripts/cleanup-old-uploads.js
```

## 🚀 Déploiement

### Checklist avant déploiement

- [ ] Le dossier `/var/www/service-civique-uploads` existe
- [ ] Les permissions sont correctes (755 pour les dossiers)
- [ ] Les variables d'environnement sont configurées
- [ ] Le serveur web peut écrire dans le dossier
- [ ] La configuration Nginx est mise à jour (si applicable)
- [ ] Un système de backup est en place

### Backup des uploads

```bash
# Backup quotidien recommandé
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /var/www/service-civique-uploads
```

## 🔧 Dépannage

### Erreur: EACCES: permission denied

```bash
# Vérifier les permissions
ls -la /var/www/service-civique-uploads

# Corriger si nécessaire
sudo chown -R www-data:www-data /var/www/service-civique-uploads
sudo chmod -R 755 /var/www/service-civique-uploads
```

### Erreur: ENOENT: no such file or directory

```bash
# Créer le dossier manquant
sudo mkdir -p /var/www/service-civique-uploads/{excel,pdf,images}
```

### Les fichiers ne sont pas accessibles via HTTP

1. Vérifier la configuration Nginx
2. Vérifier que `UPLOADS_BASE_URL` correspond au path Nginx
3. Vérifier les permissions de lecture (755)

## 📝 Notes importantes

1. **Ne jamais commiter les fichiers uploadés dans Git**
   - Le dossier `public/uploads` est dans `.gitignore`
   
2. **Sauvegardes régulières**
   - Les fichiers uploadés contiennent des documents officiels
   - Mettre en place une stratégie de backup

3. **Quotas de stockage**
   - Surveiller l'espace disque
   - Implémenter un système de rotation si nécessaire

4. **CDN (Optionnel)**
   - Pour de meilleures performances, envisager un CDN
   - Configurer `UPLOADS_BASE_URL` avec l'URL du CDN
