#!/usr/bin/env node

/**
 * Script de nettoyage des fichiers uploads obsolètes
 * Supprime les fichiers plus anciens que X jours qui ne sont plus référencés en base de données
 * 
 * Usage: node scripts/cleanup-old-uploads.js [--days=30] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../src/generated/prisma');

// Charger les variables d'environnement
require('dotenv').config();

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/service-civique-uploads';

// Parser les arguments
const args = process.argv.slice(2);
const daysArg = args.find(arg => arg.startsWith('--days='));
const dryRun = args.includes('--dry-run');
const DAYS_OLD = daysArg ? parseInt(daysArg.split('=')[1]) : 30;

console.log('🧹 Script de nettoyage des uploads\n');
console.log(`📁 Dossier: ${UPLOADS_DIR}`);
console.log(`📅 Fichiers plus vieux que: ${DAYS_OLD} jours`);
console.log(`🔍 Mode: ${dryRun ? 'DRY RUN (simulation)' : 'RÉEL'}\n`);

const prisma = new PrismaClient();

async function getReferencedFiles() {
    console.log('📊 Récupération des fichiers référencés en base de données...');

    const decrets = await prisma.decret.findMany({
        select: {
            fichierPdf: true,
            fichierExcel: true
        }
    });

    const referencedFiles = new Set();

    decrets.forEach(decret => {
        if (decret.fichierPdf) referencedFiles.add(decret.fichierPdf);
        if (decret.fichierExcel) referencedFiles.add(decret.fichierExcel);
    });

    console.log(`   ✅ ${referencedFiles.size} fichiers référencés trouvés\n`);
    return referencedFiles;
}

function getFilesInDirectory(dir) {
    const files = [];

    function scanDir(currentDir, relativePath = '') {
        if (!fs.existsSync(currentDir)) return;

        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        entries.forEach(entry => {
            const fullPath = path.join(currentDir, entry.name);
            const relPath = path.join(relativePath, entry.name);

            if (entry.isDirectory()) {
                scanDir(fullPath, relPath);
            } else if (entry.isFile()) {
                const stats = fs.statSync(fullPath);
                files.push({
                    fullPath,
                    relativePath: relPath.replace(/\\/g, '/'), // Normaliser les slashes
                    size: stats.size,
                    mtime: stats.mtime
                });
            }
        });
    }

    scanDir(dir);
    return files;
}

async function cleanup() {
    try {
        // Vérifier que le dossier existe
        if (!fs.existsSync(UPLOADS_DIR)) {
            console.error('❌ Erreur: Le dossier uploads n\'existe pas:', UPLOADS_DIR);
            process.exit(1);
        }

        // Récupérer les fichiers référencés
        const referencedFiles = await getReferencedFiles();

        // Scanner tous les fichiers
        console.log('🔍 Scan des fichiers...');
        const allFiles = getFilesInDirectory(UPLOADS_DIR);
        console.log(`   ✅ ${allFiles.length} fichiers trouvés\n`);

        // Calculer la date limite
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - DAYS_OLD);

        // Analyser les fichiers
        let totalSize = 0;
        let oldFilesCount = 0;
        let unreferencedCount = 0;
        const filesToDelete = [];

        console.log('📋 Analyse des fichiers...\n');

        allFiles.forEach(file => {
            const isOld = file.mtime < cutoffDate;
            const isReferenced = referencedFiles.has(file.relativePath);

            if (isOld && !isReferenced) {
                filesToDelete.push(file);
                totalSize += file.size;
            }

            if (isOld) oldFilesCount++;
            if (!isReferenced) unreferencedCount++;
        });

        // Afficher les statistiques
        console.log('📊 Statistiques:');
        console.log(`   • Total fichiers: ${allFiles.length}`);
        console.log(`   • Fichiers anciens (>${DAYS_OLD} jours): ${oldFilesCount}`);
        console.log(`   • Fichiers non référencés: ${unreferencedCount}`);
        console.log(`   • Fichiers à supprimer: ${filesToDelete.length}`);
        console.log(`   • Espace à libérer: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

        if (filesToDelete.length === 0) {
            console.log('✅ Aucun fichier à supprimer\n');
            return;
        }

        // Afficher les fichiers à supprimer
        if (dryRun) {
            console.log('📝 Fichiers qui seraient supprimés:\n');
            filesToDelete.forEach(file => {
                const age = Math.floor((Date.now() - file.mtime.getTime()) / (1000 * 60 * 60 * 24));
                console.log(`   • ${file.relativePath} (${(file.size / 1024).toFixed(2)} KB, ${age} jours)`);
            });
            console.log('\n💡 Exécutez sans --dry-run pour supprimer réellement\n');
        } else {
            console.log('🗑️  Suppression des fichiers...\n');
            let deleted = 0;
            let failed = 0;

            for (const file of filesToDelete) {
                try {
                    fs.unlinkSync(file.fullPath);
                    deleted++;
                    console.log(`   ✅ Supprimé: ${file.relativePath}`);
                } catch (error) {
                    failed++;
                    console.error(`   ❌ Échec: ${file.relativePath} - ${error.message}`);
                }
            }

            console.log(`\n✅ Nettoyage terminé!`);
            console.log(`   • Supprimés: ${deleted}`);
            console.log(`   • Échecs: ${failed}`);
            console.log(`   • Espace libéré: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);
        }

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Afficher l'aide
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/cleanup-old-uploads.js [options]

Options:
  --days=N      Supprimer les fichiers plus vieux que N jours (défaut: 30)
  --dry-run     Mode simulation (ne supprime pas réellement)
  --help, -h    Afficher cette aide

Exemples:
  node scripts/cleanup-old-uploads.js --dry-run
  node scripts/cleanup-old-uploads.js --days=60
  node scripts/cleanup-old-uploads.js --days=90 --dry-run
  `);
    process.exit(0);
}

// Exécuter le nettoyage
cleanup();

