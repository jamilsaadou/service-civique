# Documentation de Sécurité

## 🔒 Améliorations de Sécurité Implémentées

Cette documentation décrit les mesures de sécurité mises en place pour protéger l'application Service Civique.

---

## 1. Authentification JWT Sécurisée

### ✅ Avant (Non sécurisé)
- Token simple encodé en Base64 : `Buffer.from(`${user.id}:${Date.now()}`).toString('base64')`
- Facilement décodable et falsifiable
- Pas d'expiration
- Pas de vérification cryptographique

### ✅ Après (Sécurisé)
- **JWT (JSON Web Tokens)** avec signature cryptographique
- Token signé avec un secret sécurisé (`JWT_SECRET`)
- Expiration automatique (24h par défaut)
- Contenu du payload :
  ```typescript
  {
    userId: string,
    email: string,
    role: string,
    iat: number,  // Date de création
    exp: number   // Date d'expiration
  }
  ```

### Configuration
Fichier `.env` :
```env
JWT_SECRET="votre-secret-jwt-super-securise-changez-moi-en-production-123456789"
JWT_EXPIRES_IN="24h"
```

⚠️ **IMPORTANT** : Changez le `JWT_SECRET` en production avec une valeur complexe et aléatoire.

---

## 2. Middleware d'Authentification

Un middleware centralisé (`withAuth`) protège toutes les routes API sensibles.

### Fonctionnalités
- ✅ Vérification de la présence du token
- ✅ Validation de la signature du token
- ✅ Vérification de l'expiration
- ✅ Contrôle des rôles (RBAC - Role-Based Access Control)
- ✅ Messages d'erreur explicites

### Utilisation
```typescript
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    // Votre logique protégée ici
    return NextResponse.json({ data: "protected" });
  }, {
    requiredRole: ['ADMIN', 'SUPER_ADMIN']
  });
}
```

---

## 3. Routes API Protégées

### Routes Administratives (Authentification Requise)

#### 🔐 Accès Admin/Super Admin Seulement
- `POST /api/decrets/import` - Import de décrets
- `POST /api/decrets/[id]/publish` - Publication de décrets
- `DELETE /api/decrets/[id]` - Suppression de décrets
- `PUT /api/decrets/[id]` - Modification de décrets
- `GET /api/logs` - Consultation des logs

#### 🔐 Accès pour tous les utilisateurs authentifiés
- `GET /api/decrets` - Liste des décrets
- `GET /api/decrets/[id]` - Détails d'un décret
- `GET /api/statistiques` - Statistiques

### Routes Publiques (Pas d'authentification)
- `POST /api/auth/login` - Connexion
- `GET /api/affectations` - Consultation publique des affectations
- `GET /api/affectations/search` - Recherche publique
- `POST /api/logs` - Enregistrement de logs de consultation
- `GET /api/decrets/download-by-number` - Téléchargement de décrets publiés

---

## 4. Rôles et Permissions

### Hiérarchie des Rôles

```
SUPER_ADMIN (Accès total)
    ↓
ADMIN (Gestion complète)
    ↓
OPERATEUR (Opérations courantes)
    ↓
LECTEUR (Lecture seule)
```

### Matrice des Permissions

| Action | SUPER_ADMIN | ADMIN | OPERATEUR | LECTEUR |
|--------|-------------|-------|-----------|---------|
| Importer décrets | ✅ | ✅ | ❌ | ❌ |
| Publier décrets | ✅ | ✅ | ❌ | ❌ |
| Modifier décrets | ✅ | ✅ | ❌ | ❌ |
| Supprimer décrets | ✅ | ✅ | ❌ | ❌ |
| Consulter décrets | ✅ | ✅ | ✅ | ✅ |
| Voir statistiques | ✅ | ✅ | ✅ | ✅ |
| Consulter logs | ✅ | ✅ | ❌ | ❌ |

---

## 5. Format des Requêtes Authentifiées

### Header d'Authentification
Toutes les requêtes aux endpoints protégés doivent inclure le header :

```
Authorization: Bearer <votre_token_jwt>
```

### Exemple avec fetch
```javascript
const response = await fetch('/api/decrets', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Exemple avec Axios
```javascript
axios.get('/api/decrets', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 6. Gestion des Erreurs d'Authentification

### Codes de Statut HTTP

| Code | Signification | Action |
|------|--------------|--------|
| `401 Unauthorized` | Token manquant/invalide | Rediriger vers login |
| `403 Forbidden` | Privilèges insuffisants | Afficher erreur d'accès |
| `500 Internal Server Error` | Erreur serveur | Réessayer |

### Messages d'Erreur

#### Token Manquant
```json
{
  "success": false,
  "message": "Token d'authentification manquant",
  "error": "MISSING_TOKEN"
}
```

#### Token Invalide/Expiré
```json
{
  "success": false,
  "message": "Token d'authentification invalide ou expiré",
  "error": "INVALID_TOKEN"
}
```

#### Privilèges Insuffisants
```json
{
  "success": false,
  "message": "Accès non autorisé : privilèges insuffisants",
  "error": "INSUFFICIENT_PRIVILEGES"
}
```

---

## 7. Bonnes Pratiques de Sécurité

### Pour le Développement

✅ **À FAIRE**
- Utiliser HTTPS en production
- Stocker le token dans un cookie httpOnly (optionnel)
- Implémenter un refresh token pour les sessions longues
- Limiter le nombre de tentatives de connexion (rate limiting)
- Logger toutes les tentatives d'accès non autorisées
- Valider et nettoyer toutes les entrées utilisateur
- Utiliser des secrets forts en production

❌ **À ÉVITER**
- Stocker le token dans localStorage (vulnérable aux attaques XSS)
- Partager le JWT_SECRET
- Utiliser des tokens sans expiration
- Logger les mots de passe en clair
- Ignorer les erreurs d'authentification

### En Production

1. **Changez immédiatement le JWT_SECRET**
   ```bash
   # Générer un secret fort
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Utilisez HTTPS obligatoirement**
   - Configurez un certificat SSL/TLS valide
   - Forcez la redirection HTTP → HTTPS

3. **Configurez les CORS correctement**
   ```typescript
   const allowedOrigins = ['https://votre-domaine.com'];
   ```

4. **Activez le rate limiting**
   ```typescript
   // Limiter les tentatives de login
   // Exemple : max 5 tentatives par minute par IP
   ```

5. **Mettez en place une rotation des secrets**
   - Planifiez un changement régulier du JWT_SECRET
   - Implémentez un système de révocation de tokens

---

## 8. Tests de Sécurité

### Test d'Authentification

```bash
# Test sans token (doit échouer)
curl -X GET http://localhost:3000/api/decrets

# Test avec token valide (doit réussir)
curl -X GET http://localhost:3000/api/decrets \
  -H "Authorization: Bearer <votre_token>"

# Test avec token invalide (doit échouer)
curl -X GET http://localhost:3000/api/decrets \
  -H "Authorization: Bearer token_invalide"
```

### Test de Permissions

```bash
# Test avec rôle LECTEUR sur endpoint ADMIN (doit échouer)
curl -X POST http://localhost:3000/api/decrets/import \
  -H "Authorization: Bearer <token_lecteur>"

# Test avec rôle ADMIN (doit réussir)
curl -X POST http://localhost:3000/api/decrets/import \
  -H "Authorization: Bearer <token_admin>"
```

---

## 9. Monitoring et Audit

### Logs de Sécurité

Tous les événements suivants sont enregistrés :
- ✅ Tentatives de connexion (succès/échec)
- ✅ Accès aux endpoints protégés
- ✅ Tentatives d'accès non autorisées
- ✅ Modifications de données sensibles

### Consultation des Logs

Les administrateurs peuvent consulter les logs via :
- Interface web : `/ansi-admin/logs`
- API : `GET /api/logs` (Admin uniquement)

---

## 10. Résumé des Fichiers Modifiés/Créés

### Nouveaux Fichiers
- `src/lib/jwt.ts` - Utilitaires JWT
- `src/lib/auth-middleware.ts` - Middleware d'authentification
- `SECURITY.md` - Cette documentation

### Fichiers Modifiés
- `.env` - Ajout de JWT_SECRET et JWT_EXPIRES_IN
- `package.json` - Ajout de jsonwebtoken
- `src/app/api/auth/login/route.ts` - Génération de JWT
- `src/app/api/decrets/route.ts` - Protection avec middleware
- `src/app/api/decrets/import/route.ts` - Protection avec middleware
- `src/app/api/decrets/[id]/route.ts` - Protection avec middleware
- `src/app/api/decrets/[id]/publish/route.ts` - Protection avec middleware
- `src/app/api/statistiques/route.ts` - Protection avec middleware
- `src/app/api/logs/route.ts` - Protection GET avec middleware

---

## 11. Support et Contact

Pour toute question ou problème de sécurité :
1. Consulter cette documentation
2. Vérifier les logs système
3. Contacter l'équipe de développement

---

## 12. Changelog Sécurité

### Version 2.0 - Sécurisation Complète (Janvier 2025)
- ✅ Implémentation JWT
- ✅ Middleware d'authentification
- ✅ Protection des routes API
- ✅ Contrôle d'accès basé sur les rôles (RBAC)
- ✅ Documentation de sécurité complète

### Version 1.0 - Version Initiale
- ⚠️ Authentification basique non sécurisée
- ⚠️ Pas de protection des endpoints
- ⚠️ Tokens facilement décodables

---

**Dernière mise à jour** : Janvier 2025
**Auteur** : Équipe de développement Service Civique
