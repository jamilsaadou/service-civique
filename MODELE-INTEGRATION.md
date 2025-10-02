# Intégration du Nouveau Modèle de Données

## Résumé des Changements

Ce document décrit l'intégration du nouveau modèle de données basé sur le fichier Excel fourni dans la plateforme de service civique.

## Modifications du Schéma de Base de Données

### Ancien Modèle (Affectation)
```prisma
model Affectation {
  id                    String   @id @default(cuid())
  prenom                String
  nom                   String
  dateNaissance         DateTime
  lieuNaissance         String
  niveauDiplome         String
  specialite            String
  etablissement         String
  institutionAffectation String
  // ...
}
```

### Nouveau Modèle (Affectation)
```prisma
model Affectation {
  id                    String   @id @default(cuid())
  nom                   String
  prenoms               String   // Changé de "prenom" à "prenoms"
  dateNaissance         DateTime
  lieuNaissance         String
  diplome               String   // Changé de "niveauDiplome" à "diplome"
  lieuObtentionDiplome  String   // Nouveau champ
  lieuAffectation       String   // Changé de "institutionAffectation"
  numeroDecret          String   // Nouveau champ
  // ...
}
```

## Correspondance des Champs

| Ancien Champ | Nouveau Champ | Description |
|--------------|---------------|-------------|
| `prenom` | `prenoms` | Prénom(s) de la personne |
| `niveauDiplome` + `specialite` | `diplome` | Diplôme complet (niveau + spécialité) |
| `etablissement` | `lieuObtentionDiplome` | Lieu d'obtention du diplôme |
| `institutionAffectation` | `lieuAffectation` | Lieu d'affectation |
| - | `numeroDecret` | Numéro de décret (nouveau champ) |

## Migration des Données

La migration a été effectuée avec préservation des données existantes :

1. **Ajout des nouveaux champs** avec des valeurs par défaut temporaires
2. **Migration des données** :
   - `prenoms` ← `prenom`
   - `diplome` ← `niveauDiplome` + `specialite` (concaténés)
   - `lieuObtentionDiplome` ← `etablissement`
   - `lieuAffectation` ← `institutionAffectation`
   - `numeroDecret` ← 'N/A' (valeur par défaut)
3. **Suppression des anciens champs**

## Fichier de Test

Un fichier Excel de test a été créé avec les données du modèle original :
- **Chemin** : `test-data/model-test-data.xlsx`
- **Contenu** : 8 enregistrements basés sur le modèle fourni
- **Colonnes** : Nom, Prénom(s), Date de naissance, Lieu de naissance, Diplome, Lieu d'obtention du diplome, Lieu d'affectation, Numéro de décret

## Services Mis à Jour

### DecretService
- **processExcelFile()** : Mise à jour du mapping des colonnes pour correspondre au nouveau modèle
- **createDecret()** : Adaptation pour utiliser les nouveaux champs
- **searchAffectations()** : Mise à jour des critères de recherche

### Mapping des Colonnes Excel
Le service reconnaît maintenant les colonnes suivantes :
- `prenoms` : ['prénom(s)', 'prénoms', 'prénom', 'prenom', 'firstname']
- `diplome` : ['diplôme', 'diplome', 'niveau diplôme', 'niveau diplome']
- `lieuObtentionDiplome` : ["lieu d'obtention du diplôme", 'établissement', 'etablissement']
- `lieuAffectation` : ["lieu d'affectation", 'institution affectation']
- `numeroDecret` : ['numéro de décret', 'numero de decret'] (optionnel)

## Test de l'Intégration

1. **Serveur de développement** : Démarré avec succès sur http://localhost:3002
2. **Migration** : Appliquée avec succès (297 enregistrements migrés)
3. **Fichier de test** : Généré avec les données du modèle original

## Utilisation

Pour tester le nouveau modèle :

1. Accédez à l'interface d'administration : http://localhost:3002/ansi-admin
2. Utilisez la fonction d'import avec le fichier `test-data/model-test-data.xlsx`
3. Vérifiez que les données sont correctement importées avec les nouveaux champs

## Compatibilité

- ✅ **Données existantes** : Préservées et migrées automatiquement
- ✅ **Interface utilisateur** : Compatible avec les nouveaux champs
- ✅ **API** : Mise à jour pour utiliser les nouveaux champs
- ✅ **Recherche** : Fonctionne avec les nouveaux critères

## Notes Importantes

- Le champ `numeroDecret` est optionnel lors de l'import
- Les données existantes ont été migrées avec `numeroDecret = 'N/A'`
- La recherche inclut maintenant les nouveaux champs (`diplome`, `lieuObtentionDiplome`)
- **Formats de date supportés** :
  - Format complet : `J/M/AAAA` ou `J/M/AA` (ex: 15/3/1995 ou 15/3/95)
  - **Année seule** : `AAAA` (ex: 1996) - automatiquement complété par 01/01/AAAA
- Pour les personnes avec seulement l'année de naissance, le système complète automatiquement avec le 1er janvier de l'année
