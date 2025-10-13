/**
 * Configuration de l'application
 */

import { join } from "path";

// Chemin de stockage des fichiers uploadés
// En développement, utiliser le dossier public/uploads
// En production, utiliser une variable d'environnement
export const UPLOADS_DIR =
  process.env.UPLOADS_DIR ||
  join(process.cwd(), "public", "uploads");

// URL de base pour accéder aux fichiers uploadés
export const UPLOADS_BASE_URL = process.env.UPLOADS_BASE_URL || "/uploads";

// Taille maximale des fichiers (en bytes)
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Types de fichiers acceptés
export const ACCEPTED_FILE_TYPES = {
  excel: [".xlsx", ".xls", ".csv"],
  pdf: [".pdf"],
  image: [".jpg", ".jpeg", ".png", ".gif"],
};

// Configuration des dossiers
export const UPLOAD_FOLDERS = {
  excel: "excel",
  pdf: "pdf",
  images: "images",
};
