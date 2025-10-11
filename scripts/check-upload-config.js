#!/usr/bin/env node

/**
 * Script de vérification de la configuration des uploads
 * Exécutez avec: node scripts/check-upload-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration des uploads...\n');

// Charger les variables d'environnement
require('dotenv').config();

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/service-civique-uploads';
const UPLOADS_BASE_URL = process.env.UPLOADS_BASE_URL || '/uploads';

console.log('📋 Configuration détectée:');
console.log(`   UPLOADS_DIR: ${UPLOADS_DIR}`);
console.log(`   UPLOADS_BASE_URL: ${UPLOADS_BASE_URL}`);
console.log('');

// Vérifier si le dossier existe
console.log('📁 Vérification du dossier uploads...');
if (fs.existsSync(UPLOADS_DIR)) {
    console.log('   ✅ Le dossier existe');

    // Vérifier les permissions
    try {
        fs.accessSync(UPLOADS_DIR, fs.constants.W_OK);
        console.log('   ✅ Permissions d\'écriture OK');
    } catch (err) {
        console.log('   ❌ ERREUR: Pas de permissions d\'écriture');
        console.log('   💡 Solution: sudo chown -R $(whoami):$(whoami) ' + UPLOADS_DIR);
    }

    // Vérifier les sous-dossiers
    const subfolders = ['excel', 'pdf', 'images'];
    subfolders.forEach(folder => {
        const folderPath = path.join(UPLOADS_DIR, folder);
        if (fs.existsSync(folderPath)) {
            console.log(`   ✅ Sous-dossier ${folder}/ existe`);
        } else {
            console.log(`   ⚠️  Sous-dossier ${folder}/ manquant`);
            console.log(`   💡 Solution: mkdir -p ${folderPath}`);
        }
    });

    // Afficher les stats du dossier
    const stats = fs.statSync(UPLOADS_DIR);
    console.log('\n   📊 Informations détaillées:');
    console.log(`      Propriétaire UID: ${stats.uid}`);
    console.log(`      Groupe GID: ${stats.gid}`);
    console.log(`      Permissions: ${(stats.mode & parseInt('777', 8)).toString(8)}`);

} else {
    console.log('   ❌ ERREUR: Le dossier n\'existe pas');
    console.log('   💡 Solution: mkdir -p ' + UPLOADS_DIR);
}

console.log('\n🌐 Vérification de l\'utilisateur Node.js...');
console.log(`   Process UID: ${process.getuid()}`);
console.log(`   Process GID: ${process.getgid()}`);

// Vérifier la configuration Next.js
console.log('\n⚙️  Vérification de la configuration Next.js...');
const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
    if (nextConfig.includes('bodySizeLimit')) {
        console.log('   ✅ bodySizeLimit configuré');
    } else {
        console.log('   ⚠️  bodySizeLimit non trouvé');
    }
} else {
    console.log('   ⚠️  next.config.ts non trouvé');
}

// Tester l'écriture d'un fichier
console.log('\n🧪 Test d\'écriture...');
const testFile = path.join(UPLOADS_DIR, 'test-write.txt');
try {
    fs.writeFileSync(testFile, 'test');
    console.log('   ✅ Écriture de fichier OK');
    fs.unlinkSync(testFile);
    console.log('   ✅ Suppression de fichier OK');
} catch (err) {
    console.log('   ❌ ERREUR lors du test d\'écriture:', err.message);
}

console.log('\n✨ Vérification terminée!\n');

