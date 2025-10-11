#!/bin/bash

# Script de configuration du serveur pour Service Civique
# À exécuter sur le VPS Ubuntu en tant que root ou avec sudo

echo "🚀 Configuration du serveur Service Civique..."

# Créer le dossier pour les uploads
echo "📁 Création du dossier uploads..."
UPLOAD_DIR="/var/www/service-civique-uploads"
mkdir -p $UPLOAD_DIR/excel
mkdir -p $UPLOAD_DIR/pdf
mkdir -p $UPLOAD_DIR/images

# Configurer les permissions
# Remplacez 'www-data' par l'utilisateur qui exécute votre application Next.js si différent
echo "🔑 Configuration des permissions..."
chown -R www-data:www-data $UPLOAD_DIR
chmod -R 755 $UPLOAD_DIR

# Copier la configuration nginx
echo "⚙️  Configuration de nginx..."
# cp nginx-config-example.conf /etc/nginx/sites-available/service-civique
# ln -s /etc/nginx/sites-available/service-civique /etc/nginx/sites-enabled/
# rm /etc/nginx/sites-enabled/default  # Supprimer la config par défaut si nécessaire

# Tester la configuration nginx
# nginx -t

# Recharger nginx
# systemctl reload nginx

echo "✅ Configuration terminée!"
echo ""
echo "📝 Prochaines étapes manuelles:"
echo "1. Éditez /etc/nginx/sites-available/service-civique avec votre domaine"
echo "2. Créez le lien symbolique: ln -s /etc/nginx/sites-available/service-civique /etc/nginx/sites-enabled/"
echo "3. Testez nginx: nginx -t"
echo "4. Rechargez nginx: systemctl reload nginx"
echo "5. Vérifiez l'utilisateur qui exécute Next.js (pm2 list ou ps aux | grep node)"
echo "6. Ajustez les permissions si nécessaire"
echo ""
echo "Variables d'environnement à définir dans votre .env:"
echo "UPLOADS_DIR=$UPLOAD_DIR"
echo "UPLOADS_BASE_URL=http://votre-domaine.com/uploads"

