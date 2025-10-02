const ExcelJS = require('exceljs');
const path = require('path');

async function generateTemplate() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Affectations Service Civique');

  // Définir les en-têtes
  const headers = [
    'Nom',
    'Prénom(s)',
    'Date de naissance',
    'Lieu de naissance',
    'Diplôme',
    "Lieu d'obtention du diplôme",
    "Lieu d'affectation",
    'Numéro de décret'
  ];

  // Ajouter les en-têtes avec style
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Ajouter des exemples de données
  const sampleData = [
    [
      'Dupont',
      'Jean',
      '15/3/1995',
      'Paris',
      'Master Informatique',
      'Université de Paris',
      'Ministère de la Défense',
      'DECRET_2024_001'
    ],
    [
      'Martin',
      'Marie',
      '22/7/1996',
      'Lyon',
      'Licence Administration',
      'Université Lyon 2',
      "Ministère de l'Intérieur",
      'DECRET_2024_001'
    ],
    [
      'Diallo',
      'Ahmed',
      '8/11/1994',
      'Niamey',
      'Master Génie Civil',
      'Université Abdou Moumouni',
      'Ministère des Infrastructures',
      'DECRET_2024_001'
    ]
  ];

  // Ajouter les données d'exemple
  sampleData.forEach(rowData => {
    const row = worksheet.addRow(rowData);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      // Format spécial pour les dates
      if (cell.value && typeof cell.value === 'string' && cell.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        cell.numFmt = 'yyyy-mm-dd';
      }
    });
  });

  // Ajuster la largeur des colonnes
  worksheet.columns = [
    { width: 18 }, // Nom
    { width: 18 }, // Prénom(s)
    { width: 18 }, // Date de naissance
    { width: 22 }, // Lieu de naissance
    { width: 24 }, // Diplôme
    { width: 30 }, // Lieu d'obtention du diplôme
    { width: 30 }, // Lieu d'affectation
    { width: 22 }  // Numéro de décret
  ];

  // Ajouter une feuille d'instructions
  const instructionsSheet = workbook.addWorksheet('Instructions');
  
  const instructions = [
    ['MODÈLE D\'IMPORT - AFFECTATIONS SERVICE CIVIQUE'],
    [''],
    ['INSTRUCTIONS D\'UTILISATION :'],
    [''],
    ['1. Utilisez la feuille "Affectations Service Civique" pour saisir vos données'],
    ['2. Respectez exactement le format des en-têtes (ne pas modifier)'],
    ['3. Les colonnes indiquées sont toutes obligatoires'],
    ['4. Format de date : J/M/AAAA (exemple: 15/3/1995)'],
    ['5. Supprimez les lignes d\'exemple avant l\'import'],
    [''],
    ['COLONNES REQUISES :'],
    ['• Nom : Nom de famille'],
    ['• Prénom(s) : Prénom ou liste de prénoms'],
    ['• Date de naissance : Format J/M/AAAA'],
    ['• Lieu de naissance : Ville ou pays de naissance'],
    ['• Diplôme : Intitulé complet du diplôme obtenu'],
    ['• Lieu d\'obtention du diplôme : Établissement où le diplôme a été délivré'],
    ['• Lieu d\'affectation : Ministère ou organisme d\'affectation'],
    ['• Numéro de décret : Numéro unique du décret correspondant'],
    [''],
    ['EXEMPLES DE VALEURS ACCEPTÉES :'],
    [''],
    ['Diplôme : Licence en Droit, Master Informatique, Doctorat en Médecine'],
    ['Lieu d\'obtention du diplôme : Université de Paris, ENS, etc.'],
    ['Lieu d\'affectation : Ministère de la Santé, Ministère de l\'Éducation, etc.'],
    [''],
    ['ATTENTION :'],
    ['• Vérifiez que toutes les cellules sont remplies'],
    ['• Évitez les caractères spéciaux dans les noms'],
    ['• Les dates doivent être au format J/M/AAAA'],
    ['• Sauvegardez le fichier au format .xlsx avant l\'import']
  ];

  instructions.forEach((instruction, index) => {
    const row = instructionsSheet.addRow(instruction);
    if (index === 0) {
      // Titre principal
      row.getCell(1).font = { bold: true, size: 16, color: { argb: '366092' } };
    } else if (instruction[0] && instruction[0].includes(':') && instruction[0].toUpperCase() === instruction[0]) {
      // Sous-titres
      row.getCell(1).font = { bold: true, size: 12, color: { argb: '366092' } };
    } else if (instruction[0] && instruction[0].startsWith('•')) {
      // Points de liste
      row.getCell(1).font = { size: 10 };
      row.getCell(1).alignment = { indent: 1 };
    }
  });

  instructionsSheet.getColumn(1).width = 80;

  // Sauvegarder le fichier
  const templatePath = path.join(__dirname, '..', 'public', 'templates', 'modele-import-affectations.xlsx');
  
  // Créer le dossier s'il n'existe pas
  const fs = require('fs');
  const templateDir = path.dirname(templatePath);
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }

  await workbook.xlsx.writeFile(templatePath);
  console.log('✅ Fichier modèle généré avec succès :', templatePath);
  
  // Générer aussi une version dans test-data
  const testDataPath = path.join(__dirname, '..', 'test-data', 'modele-import-affectations.xlsx');
  await workbook.xlsx.writeFile(testDataPath);
  console.log('✅ Copie du modèle créée dans test-data :', testDataPath);
}

generateTemplate().catch(console.error);
