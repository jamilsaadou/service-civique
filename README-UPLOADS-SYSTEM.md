# 📤 Système d'Uploads - Documentation Complète

## 🎯 Problème résolu

**Symptôme:** L'application fonctionne en local mais renvoie "Erreur lors du traitement" en production lors de l'upload de fichiers.

**Causes:**
1. Tentative d'écriture dans `/public/` (peut causer des problèmes en production)
2. Limite de taille par défaut trop basse (4.5MB)
3. Permissions non configurées
4. nginx limite les uploads à 1MB par défaut

**Solution implémentée:** Système d'uploads externe avec nginx + configuration optimisée

## 📁 Architecture

### Avant
```
next-app/
└── public/
    └── uploads/          ← Fichiers mélangés avec l'app
        ├── excel/
        └── pdf/
```

### Après
```
/var/www/service-civique-uploads/  ← Dossier externe
├── excel/
├── pdf/
└── images/

+ nginx sert les fichiers directement
+ Next.js gère uniquement la logique
```

## 📚 Documentation disponible

### 🚀 Guides de démarrage

1. **[QUICK-START-PRODUCTION.md](QUICK-START-PRODUCTION.md)** ⭐ **COMMENCEZ ICI**
   - Guide rapide en 6 étapes
   - Commandes essentielles
   - Diagnostic de base

2. **[DEPLOYMENT.md](DEPLOYMENT.md)**
   - Guide complet de déploiement
   - Configuration serveur détaillée
   - Sécurité (HTTPS, firewall)
   - Dépannage approfondi

3. **[MIGRATION-UPLOADS.md](MIGRATION-UPLOADS.md)**
   - Migration depuis ancien système
   - Comparaison avant/après
   - Checklist complète

### 📋 Références

4. **[CHANGELOG-UPLOADS.md](CHANGELOG-UPLOADS.md)**
   - Liste de tous les changements
   - Fichiers modifiés
   - Configuration requise

5. **Configuration nginx:** `nginx-config-example.conf`

### 🔧 Scripts

6. **Scripts disponibles:**
   ```bash
   scripts/setup-server.sh           # Configuration serveur
   scripts/check-upload-config.js    # Diagnostic
   scripts/cleanup-old-uploads.js    # Maintenance
   ```

## ⚡ Démarrage Rapide (5 minutes)

```bash
# 1. Créer .env
cat > .env << 'EOF'
UPLOADS_DIR="/var/www/service-civique-uploads"
UPLOADS_BASE_URL="/uploads"
JWT_SECRET="$(openssl rand -base64 32)"
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV="production"
EOF

# 2. Configurer le serveur
sudo mkdir -p /var/www/service-civique-uploads/{excel,pdf,images}
sudo chown -R $(whoami):$(whoami) /var/www/service-civique-uploads
sudo chmod -R 755 /var/www/service-civique-uploads

# 3. Configurer nginx
sudo cp nginx-config-example.conf /etc/nginx/sites-available/service-civique
sudo nano /etc/nginx/sites-available/service-civique  # Mettre votre domaine
sudo ln -s /etc/nginx/sites-available/service-civique /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. Vérifier
node scripts/check-upload-config.js

# 5. Build et démarrer
npm install
npm run build
pm2 restart service-civique

# 6. Tester
# Allez sur votre domaine et testez un upload
```

## 🔍 Diagnostic

### Si l'erreur persiste

```bash
# 1. Vérifier les permissions
ls -la /var/www/service-civique-uploads

# 2. Tester l'écriture
node scripts/check-upload-config.js

# 3. Vérifier les logs
pm2 logs service-civique
sudo tail -f /var/log/nginx/error.log

# 4. Vérifier nginx
sudo nginx -t
grep -r "client_max_body_size" /etc/nginx/sites-available/
```

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Permission denied" | Permissions dossier | `sudo chown -R $(whoami) /var/www/service-civique-uploads` |
| "413 Request Too Large" | Limite nginx | Vérifier `client_max_body_size 50M` dans nginx |
| "ENOENT: no such file" | Dossier inexistant | `mkdir -p /var/www/service-civique-uploads` |
| ".env not loaded" | Variables non chargées | Redémarrer: `pm2 restart service-civique` |

## 📊 Configuration

### Variables d'environnement (`.env`)

```bash
# Production (VPS)
UPLOADS_DIR="/var/www/service-civique-uploads"
UPLOADS_BASE_URL="/uploads"

# Développement (Local)
UPLOADS_DIR="./public/uploads"
UPLOADS_BASE_URL="/uploads"
```

### Limites de taille

- **nginx:** 50MB (`client_max_body_size`)
- **Next.js API Routes:** 50MB (`bodyParser.sizeLimit`)
- **Next.js Server Actions:** 50MB (`bodySizeLimit`)

### Structure des chemins

**En base de données:**
```
pdf/1234567890_decret.pdf
excel/1234567890_liste.xlsx
```

**Sur le disque:**
```
/var/www/service-civique-uploads/pdf/1234567890_decret.pdf
/var/www/service-civique-uploads/excel/1234567890_liste.xlsx
```

**URL publique:**
```
https://votre-domaine.com/uploads/pdf/1234567890_decret.pdf
https://votre-domaine.com/uploads/excel/1234567890_liste.xlsx
```

## 🛠️ Maintenance

### Nettoyer les anciens fichiers

```bash
# Simulation (ne supprime pas)
node scripts/cleanup-old-uploads.js --dry-run

# Supprimer fichiers > 30 jours
node scripts/cleanup-old-uploads.js --days=30

# Supprimer fichiers > 90 jours
node scripts/cleanup-old-uploads.js --days=90
```

### Vérifier l'espace disque

```bash
# Espace total
df -h /var/www/service-civique-uploads

# Taille du dossier
du -sh /var/www/service-civique-uploads

# Par sous-dossier
du -sh /var/www/service-civique-uploads/*
```

### Sauvegarder les fichiers

```bash
# Créer une archive
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /var/www/service-civique-uploads

# Restaurer
tar -xzf uploads-backup-20240101.tar.gz -C /
```

## 🔒 Sécurité

### HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

### Firewall

```bash
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
```

### JWT Secret

```bash
# Générer une clé forte
openssl rand -base64 32

# Ajouter dans .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

## 📈 Monitoring

### Logs en temps réel

```bash
# Application
pm2 logs service-civique --lines 100

# nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Statistiques d'usage

```bash
# Nombre total de fichiers
find /var/www/service-civique-uploads -type f | wc -l

# Fichiers par type
find /var/www/service-civique-uploads/pdf -type f | wc -l
find /var/www/service-civique-uploads/excel -type f | wc -l

# Derniers uploads
ls -lhtr /var/www/service-civique-uploads/pdf/ | tail -n 10
```

## 🎓 Détails techniques

### Fichiers modifiés

- `src/app/api/decrets/import/route.ts` - Import de décrets
- `src/app/api/decrets/[id]/download/route.ts` - Téléchargement
- `src/app/api/decrets/download-by-number/route.ts` - Téléchargement par numéro
- `next.config.ts` - Configuration des limites

### Nouveaux fichiers

- `src/lib/config.ts` - Configuration centralisée
- `src/lib/file-utils.ts` - Utilitaires fichiers
- Scripts et documentation (voir ci-dessus)

## 🤝 Support

### En cas de problème

1. ✅ Exécuter le diagnostic: `node scripts/check-upload-config.js`
2. ✅ Consulter les logs (voir section Monitoring)
3. ✅ Vérifier la checklist dans `QUICK-START-PRODUCTION.md`
4. ✅ Consulter le guide complet `DEPLOYMENT.md`

### Ressources

- [nginx Documentation](https://nginx.org/en/docs/)
- [Next.js Configuration](https://nextjs.org/docs/api-reference/next.config.js/introduction)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

## ✅ Checklist finale

Avant de considérer que tout fonctionne :

- [ ] `.env` créé avec les bonnes variables
- [ ] Dossier `/var/www/service-civique-uploads` créé
- [ ] Permissions correctes (755, propriétaire = utilisateur Node.js)
- [ ] Configuration nginx en place
- [ ] nginx rechargé (`sudo systemctl reload nginx`)
- [ ] Application redémarrée (`pm2 restart service-civique`)
- [ ] Script de diagnostic OK (`node scripts/check-upload-config.js`)
- [ ] Test d'upload réussi
- [ ] Fichier visible dans le dossier uploads
- [ ] Téléchargement du PDF fonctionne
- [ ] URL publique accessible (http://domaine.com/uploads/pdf/fichier.pdf)

---

**🎉 Une fois tous ces points validés, votre système d'uploads est opérationnel !**

