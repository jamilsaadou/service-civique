-- CreateTable
CREATE TABLE `decrets` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `datePublication` DATETIME(3) NULL,
    `statut` ENUM('BROUILLON', 'PUBLIE', 'ARCHIVE') NOT NULL DEFAULT 'BROUILLON',
    `fichierExcel` VARCHAR(191) NULL,
    `fichierPdf` VARCHAR(191) NULL,

    UNIQUE INDEX `decrets_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `affectations` (
    `id` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `dateNaissance` DATETIME(3) NOT NULL,
    `lieuNaissance` VARCHAR(191) NOT NULL,
    `niveauDiplome` VARCHAR(191) NOT NULL,
    `specialite` VARCHAR(191) NOT NULL,
    `etablissement` VARCHAR(191) NOT NULL,
    `institutionAffectation` VARCHAR(191) NOT NULL,
    `decretId` VARCHAR(191) NOT NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilisateurs` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'OPERATEUR', 'LECTEUR') NOT NULL DEFAULT 'ADMIN',
    `motDePasse` VARCHAR(191) NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs_activite` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `utilisateurId` VARCHAR(191) NULL,
    `adresseIp` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `decretId` VARCHAR(191) NULL,
    `metadonnees` JSON NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statistiques` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('TOTAL_AFFECTATIONS', 'AFFECTATIONS_PAR_MOIS', 'AFFECTATIONS_PAR_INSTITUTION', 'AFFECTATIONS_PAR_DIPLOME', 'CONSULTATIONS_DECRETS', 'RECHERCHES_EFFECTUEES') NOT NULL,
    `periode` VARCHAR(191) NOT NULL,
    `valeur` INTEGER NOT NULL,
    `metadonnees` JSON NULL,
    `dateCreation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModification` DATETIME(3) NOT NULL,

    UNIQUE INDEX `statistiques_type_periode_key`(`type`, `periode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `affectations` ADD CONSTRAINT `affectations_decretId_fkey` FOREIGN KEY (`decretId`) REFERENCES `decrets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
