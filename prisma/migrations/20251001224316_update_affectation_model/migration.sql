/*
  Warnings:

  - You are about to drop the column `etablissement` on the `affectations` table. All the data in the column will be lost.
  - You are about to drop the column `institutionAffectation` on the `affectations` table. All the data in the column will be lost.
  - You are about to drop the column `niveauDiplome` on the `affectations` table. All the data in the column will be lost.
  - You are about to drop the column `prenom` on the `affectations` table. All the data in the column will be lost.
  - You are about to drop the column `specialite` on the `affectations` table. All the data in the column will be lost.
  - Added the required column `diplome` to the `affectations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lieuAffectation` to the `affectations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lieuObtentionDiplome` to the `affectations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroDecret` to the `affectations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenoms` to the `affectations` table without a default value. This is not possible if the table is not empty.

*/

-- Étape 1: Ajouter les nouvelles colonnes avec des valeurs par défaut temporaires
ALTER TABLE `affectations` 
    ADD COLUMN `prenoms` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `diplome` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `lieuObtentionDiplome` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `lieuAffectation` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `numeroDecret` VARCHAR(191) NOT NULL DEFAULT '';

-- Étape 2: Migrer les données existantes
UPDATE `affectations` SET 
    `prenoms` = `prenom`,
    `diplome` = CONCAT(`niveauDiplome`, CASE WHEN `specialite` != '' THEN CONCAT(' - ', `specialite`) ELSE '' END),
    `lieuObtentionDiplome` = `etablissement`,
    `lieuAffectation` = `institutionAffectation`,
    `numeroDecret` = 'N/A';

-- Étape 3: Supprimer les anciennes colonnes
ALTER TABLE `affectations` 
    DROP COLUMN `etablissement`,
    DROP COLUMN `institutionAffectation`,
    DROP COLUMN `niveauDiplome`,
    DROP COLUMN `prenom`,
    DROP COLUMN `specialite`;

-- Étape 4: Supprimer les valeurs par défaut (optionnel, pour maintenir la cohérence du schéma)
ALTER TABLE `affectations` 
    ALTER COLUMN `prenoms` DROP DEFAULT,
    ALTER COLUMN `diplome` DROP DEFAULT,
    ALTER COLUMN `lieuObtentionDiplome` DROP DEFAULT,
    ALTER COLUMN `lieuAffectation` DROP DEFAULT,
    ALTER COLUMN `numeroDecret` DROP DEFAULT;
