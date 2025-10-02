# Identifiants Super Administrateur

## Configuration

Le système utilise maintenant un compte super administrateur stocké en base de données via Prisma.

### Identifiants par défaut

Les identifiants sont créés lors du seeding de la base de données :

```
Username: superadmin
Email: superadmin@ansi.gov.ne
Password: SCN@2024!SecurePass
```

## Connexion

1. Accédez à la page de connexion : `/login`
2. Utilisez les identifiants suivants :
   - **Nom d'utilisateur** : `superadmin`
   - **Mot de passe** : `SCN@2024!SecurePass`

## Création du Super Admin

Le super administrateur est créé automatiquement lors du seeding de la base de données :

```bash
cd service-civique-platform
npx prisma db seed
```

Cette commande va :
1. Créer le super administrateur avec le mot de passe hashé (bcrypt)
2. Lui attribuer le rôle `SUPER_ADMIN`
3. Créer des données de test (décrets, affectations, statistiques)

## Sécurité

✅ **Améliorations de sécurité** :
- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les identifiants sont stockés en base de données, pas dans des fichiers de configuration
- L'API vérifie les mots de passe avec bcrypt.compare()
- Un seul compte super administrateur existe
- Le mot de passe ne peut pas être lu en clair depuis la base de données

⚠️ **IMPORTANT pour la production** : 
- Changez immédiatement le mot de passe par défaut
- Utilisez un mot de passe fort et unique
- Ne partagez jamais ces identifiants par email ou message non sécurisé
- Envisagez d'ajouter l'authentification à deux facteurs

## Modifier le mot de passe

Pour changer le mot de passe du super administrateur, vous pouvez :

### Option 1 : Via le seed (recommandé pour le premier déploiement)

1. Modifiez le fichier `prisma/seed.ts` :
```typescript
const hashedPassword = await bcrypt.hash('VOTRE_NOUVEAU_MOT_DE_PASSE', 10);
```

2. Réinitialisez et reseedez la base de données :
```bash
npx prisma db push --force-reset
npx prisma db seed
```

### Option 2 : Via un script Node.js

Créez un script pour mettre à jour le mot de passe :

```typescript
import { PrismaClient } from './src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
  const newPassword = 'VOTRE_NOUVEAU_MOT_DE_PASSE';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.utilisateur.update({
    where: { email: 'superadmin@ansi.gov.ne' },
    data: { motDePasse: hashedPassword }
  });
  
  console.log('Mot de passe mis à jour!');
  await prisma.$disconnect();
}

updatePassword();
```

## Structure de la base de données

Le super administrateur est stocké dans la table `utilisateurs` :
- **id** : Identifiant unique (CUID)
- **email** : superadmin@ansi.gov.ne
- **nom** : Super
- **prenom** : Administrateur
- **role** : SUPER_ADMIN
- **motDePasse** : Hash bcrypt du mot de passe
- **actif** : true

## Notes

- Il n'y a qu'un seul compte super administrateur par défaut
- Le super administrateur peut se connecter avec `superadmin` ou `superadmin@ansi.gov.ne`
- L'authentification se fait via l'API `/api/auth/login`
- Le token d'authentification est stocké dans le localStorage du navigateur
- Le mot de passe est hashé avec bcrypt avant d'être stocké en base
