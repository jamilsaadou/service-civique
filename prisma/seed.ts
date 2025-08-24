import { PrismaClient, StatutDecret } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer un décret de test
  const decret = await prisma.decret.create({
    data: {
      numero: 'DECRET_2024_001',
      titre: 'Affectations Service Civique - Janvier 2024',
      description: 'Premier décret d\'affectations pour l\'année 2024',
      statut: StatutDecret.PUBLIE,
      datePublication: new Date(),
      fichierExcel: 'uploads/excel/sample-affectations.xlsx',
      fichierPdf: 'uploads/pdf/decret-2024-001.pdf',
      affectations: {
        create: [
          {
            prenom: 'Jean',
            nom: 'Dupont',
            dateNaissance: new Date('1995-03-15'),
            lieuNaissance: 'Paris',
            niveauDiplome: 'Master',
            specialite: 'Informatique',
            etablissement: 'Université de Paris',
            institutionAffectation: 'Ministère de la Défense'
          },
          {
            prenom: 'Marie',
            nom: 'Martin',
            dateNaissance: new Date('1996-07-22'),
            lieuNaissance: 'Lyon',
            niveauDiplome: 'Licence',
            specialite: 'Administration',
            etablissement: 'Université Lyon 2',
            institutionAffectation: 'Ministère de l\'Intérieur'
          },
          {
            prenom: 'Ahmed',
            nom: 'Diallo',
            dateNaissance: new Date('1994-11-08'),
            lieuNaissance: 'Niamey',
            niveauDiplome: 'Master',
            specialite: 'Génie Civil',
            etablissement: 'Université Abdou Moumouni',
            institutionAffectation: 'Ministère des Infrastructures'
          },
          {
            prenom: 'Fatima',
            nom: 'Ousmane',
            dateNaissance: new Date('1997-01-12'),
            lieuNaissance: 'Zinder',
            niveauDiplome: 'Licence',
            specialite: 'Économie',
            etablissement: 'Université de Zinder',
            institutionAffectation: 'Ministère des Finances'
          },
          {
            prenom: 'Ibrahim',
            nom: 'Moussa',
            dateNaissance: new Date('1995-09-30'),
            lieuNaissance: 'Maradi',
            niveauDiplome: 'Master',
            specialite: 'Agronomie',
            etablissement: 'Université de Maradi',
            institutionAffectation: 'Ministère de l\'Agriculture'
          }
        ]
      }
    },
    include: {
      affectations: true
    }
  });

  console.log(`✅ Décret créé: ${decret.numero} avec ${decret.affectations.length} affectations`);

  // Créer un utilisateur administrateur de test
  const admin = await prisma.utilisateur.create({
    data: {
      email: 'admin@ansi.gov.ne',
      nom: 'Administrateur',
      prenom: 'ANSI',
      motDePasse: 'hashed_password_here', // En production, utiliser bcrypt
      role: 'ADMIN'
    }
  });

  console.log(`✅ Utilisateur admin créé: ${admin.email}`);

  // Créer quelques statistiques de test
  await prisma.statistique.createMany({
    data: [
      {
        type: 'TOTAL_AFFECTATIONS',
        periode: '2024',
        valeur: 5
      },
      {
        type: 'AFFECTATIONS_PAR_MOIS',
        periode: '2024-01',
        valeur: 5
      },
      {
        type: 'CONSULTATIONS_DECRETS',
        periode: '2024-01',
        valeur: 25
      }
    ]
  });

  console.log('✅ Statistiques créées');

  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
