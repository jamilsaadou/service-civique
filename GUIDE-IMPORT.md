# Guide d'Import des Affectations - Service Civique National

## 📋 Vue d'ensemble

Ce guide vous explique comment importer des affectations de service civique dans la plateforme ANSI en utilisant des fichiers Excel et PDF.

## 🚀 Processus d'import

### Étape 1: Préparation des fichiers

#### Fichier Excel des affectations
- **Format requis**: `.xlsx` ou `.xls`
- **Télécharger le modèle**: Utilisez le bouton "Télécharger le modèle" sur la page d'import
- **Colonnes obligatoires**:
  - Nom
  - Prénom(s)
  - Date de naissance (format: J/M/AAAA)
  - Lieu de naissance
  - Diplôme
  - Lieu d'obtention du diplôme
  - Lieu d'affectation
  - Numéro de décret

#### Fichier PDF du décret
- **Format requis**: `.pdf`
- **Contenu**: Décret officiel signé par les autorités compétentes

### Étape 2: Utilisation du modèle Excel

1. **Téléchargez le modèle** depuis la page d'import
2. **Ouvrez le fichier** dans Excel ou LibreOffice Calc
3. **Consultez l'onglet "Instructions"** pour les détails
4. **Remplissez l'onglet "Affectations Service Civique"** avec vos données
5. **Supprimez les lignes d'exemple** avant l'import
6. **Sauvegardez** au format `.xlsx`

### Étape 3: Import dans la plateforme

1. **Connectez-vous** à l'interface d'administration
2. **Accédez** à la page "Import de Décret"
3. **Remplissez** les informations du décret:
   - Numéro du décret (ex: DECRET_2024_005)
   - Titre du décret
   - Description (optionnel)
4. **Uploadez** le fichier Excel
5. **Uploadez** le fichier PDF du décret
6. **Cliquez** sur "Prévisualiser"

### Étape 4: Validation et publication

1. **Vérifiez** les données importées dans la prévisualisation
2. **Corrigez** les erreurs éventuelles en modifiant le fichier Excel
3. **Publiez** le décret une fois validé

## 📊 Format des données

### Exemples de valeurs acceptées

| Champ | Exemples |
|-------|----------|
| **Nom** | Dupont, Martin, Diallo, Ousmane |
| **Prénom(s)** | Jean, Marie, Ahmed, Fatima |
| **Date de naissance** | 15/3/1995, 22/7/1996 |
| **Lieu de naissance** | Paris, Lyon, Niamey, Zinder |
| **Diplôme** | Licence Administration, Master Informatique, Doctorat en Médecine |
| **Lieu d'obtention du diplôme** | Université de Paris, Université Abdou Moumouni |
| **Lieu d'affectation** | Ministère de la Santé, Ministère de l'Éducation |
| **Numéro de décret** | DECRET_2024_001, DECRET_2024_015 |

### Règles de validation

- ✅ **Tous les champs sont obligatoires**
- ✅ **Format de date**: J/M/AAAA (ex: 15/3/1995)
- ✅ **Pas de cellules vides**
- ✅ **Éviter les caractères spéciaux** dans les noms
- ✅ **Cohérence des données** (dates réalistes, institutions existantes)

## 🛠️ Génération du modèle

### Pour les développeurs

```bash
# Générer un nouveau modèle Excel
npm run generate:template

# Le fichier sera créé dans:
# - public/templates/modele-import-affectations.xlsx
# - test-data/modele-import-affectations.xlsx
```

## 🔧 Dépannage

### Erreurs courantes

#### "Colonne non trouvée dans le fichier Excel"
- **Cause**: Les en-têtes de colonnes ne correspondent pas au format attendu
- **Solution**: Utilisez le modèle Excel fourni sans modifier les en-têtes

#### "Format de date invalide"
- **Cause**: La date n'est pas au format J/M/AAAA
- **Solution**: Formatez les dates comme 15/3/1995

#### "Champ requis manquant"
- **Cause**: Une ou plusieurs cellules sont vides
- **Solution**: Remplissez toutes les cellules obligatoires

#### "Erreur lors du traitement du fichier"
- **Cause**: Fichier corrompu ou format non supporté
- **Solution**: Vérifiez que le fichier est au format .xlsx et n'est pas corrompu

### Support technique

Pour toute assistance technique:
1. Vérifiez que vous utilisez le modèle Excel le plus récent
2. Consultez les logs d'erreur dans la prévisualisation
3. Contactez l'équipe technique ANSI

## 📈 Bonnes pratiques

1. **Testez avec un petit échantillon** avant l'import complet
2. **Sauvegardez vos fichiers** avant modification
3. **Vérifiez la cohérence** des données avant import
4. **Documentez** chaque import avec le numéro de décret
5. **Archivez** les fichiers sources après publication

## 🔒 Sécurité

- Les fichiers sont traités de manière sécurisée
- Les données sont validées avant insertion en base
- L'accès est restreint aux administrateurs autorisés
- Les logs d'activité sont conservés pour audit

---

**Version**: 1.0  
**Dernière mise à jour**: Janvier 2024  
**Contact**: admin@ansi.gov.ne
