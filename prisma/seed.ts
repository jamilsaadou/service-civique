import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer le Super Administrateur
  const hashedPassword = await bcrypt.hash('SCN@2024!SecurePass', 10);
  
  const superAdmin = await prisma.utilisateur.create({
    data: {
      email: 'superadmin@ansi.gov.ne',
      nom: 'Super',
      prenom: 'Administrateur',
      motDePasse: hashedPassword,
      role: 'SUPER_ADMIN',
      actif: true
    }
  });

  console.log(`✅ Super Administrateur créé: ${superAdmin.email}`);
  console.log(`   Username: superadmin`);
  console.log(`   Password: SCN@2024!SecurePass`);

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
