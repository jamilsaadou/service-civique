# Dépannage - Problème de connexion

## Problème : Impossible de se connecter

Si vous ne parvenez pas à vous connecter avec les identifiants du super administrateur, suivez ces étapes :

### 1. Vérifier les identifiants

Les identifiants par défaut sont :
- **Nom d'utilisateur** : `superadmin`
- **Mot de passe** : `SCN@2024!SecurePass`

⚠️ **Attention** : Le mot de passe est sensible à la casse (majuscules/minuscules).

### 2. Redémarrer le serveur

Après toute modification du fichier `.env`, **vous devez redémarrer le serveur** :

```bash
# Arrêter le serveur (CTRL+C dans le terminal)
# Puis redémarrer :
npm run dev
```

### 3. Vérifier le fichier .env

Assurez-vous que le fichier `.env` à la racine du projet contient bien :

```
SUPER_ADMIN_USERNAME="superadmin"
SUPER_ADMIN_PASSWORD="SCN@2024!SecurePass"
```

### 4. Vérifier la console du serveur

Lors d'une tentative de connexion, vérifiez les logs dans le terminal où le serveur tourne. Vous devriez voir :
```
Tentative de connexion pour: superadmin
Variables env chargées: { hasUsername: true, hasPassword: true, expectedUsername: 'superadmin' }
```

### 5. Vérifier la console du navigateur

Ouvrez les outils de développement du navigateur (F12) et vérifiez l'onglet "Console" et "Network" pour voir :
- Si la requête POST vers `/api/auth/login` est bien envoyée
- Quelle est la réponse du serveur
- S'il y a des erreurs JavaScript

### 6. Solution de repli

Si le problème persiste, l'API a été configurée avec des identifiants par défaut qui fonctionneront même si le fichier `.env` n'est pas lu correctement :
- **Nom d'utilisateur** : `superadmin`  
- **Mot de passe** : `SCN@2024!SecurePass`

### 7. Tester l'API directement

Vous pouvez tester l'API d'authentification directement avec curl :

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"SCN@2024!SecurePass"}'
```

Une réponse réussie devrait ressembler à :
```json
{
  "success": true,
  "token": "...",
  "message": "Authentification réussie",
  "user": {
    "username": "superadmin",
    "role": "superadmin"
  }
}
```

### 8. Vider le cache du navigateur

Parfois, le cache du navigateur peut causer des problèmes :
1. Ouvrez les outils de développement (F12)
2. Faites un clic droit sur le bouton de rafraîchissement
3. Sélectionnez "Vider le cache et actualiser"

### 9. Vérifier que l'API existe

Assurez-vous que le fichier existe :
```
service-civique-platform/src/app/api/auth/login/route.ts
```

## Besoin d'aide supplémentaire ?

Si le problème persiste après avoir suivi toutes ces étapes, vérifiez :
1. Que le serveur Next.js est bien démarré
2. Qu'il n'y a pas d'erreurs dans la console du serveur
3. Que le port 3000 (ou autre) est bien accessible
