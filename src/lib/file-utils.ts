/**
 * Utilitaires pour la gestion des fichiers uploadés
 */

import { UPLOADS_BASE_URL } from "./config";

/**
 * Convertit un chemin relatif de fichier en URL accessible publiquement
 * @param relativePath - Chemin relatif du fichier (ex: "pdf/1234567890_decret.pdf")
 * @returns URL complète du fichier (ex: "/uploads/pdf/1234567890_decret.pdf")
 */
export function getFileUrl(relativePath: string | null): string | null {
  if (!relativePath) return null;

  // Si le chemin commence déjà par /uploads, le retourner tel quel
  if (relativePath.startsWith("/uploads")) {
    return relativePath;
  }

  // Si le chemin commence par uploads/ (sans slash), ajouter le slash
  if (relativePath.startsWith("uploads/")) {
    return `/${relativePath}`;
  }

  // Sinon, construire l'URL avec UPLOADS_BASE_URL
  return `${UPLOADS_BASE_URL}/${relativePath}`;
}

/**
 * Extrait le nom du fichier à partir d'un chemin
 * @param filePath - Chemin du fichier
 * @returns Nom du fichier
 */
export function getFileName(filePath: string | null): string | null {
  if (!filePath) return null;

  const parts = filePath.split("/");
  return parts[parts.length - 1];
}

/**
 * Vérifie si un fichier a une extension valide
 * @param fileName - Nom du fichier
 * @param allowedExtensions - Extensions autorisées
 * @returns true si l'extension est valide
 */
export function hasValidExtension(
  fileName: string,
  allowedExtensions: string[]
): boolean {
  const extension = fileName.toLowerCase().split(".").pop();
  return allowedExtensions.some(
    (ext) => ext.toLowerCase().replace(".", "") === extension
  );
}

/**
 * Génère un nom de fichier unique avec timestamp
 * @param originalName - Nom original du fichier
 * @returns Nom de fichier avec timestamp
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  // Nettoyer le nom du fichier (enlever les caractères spéciaux)
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${timestamp}_${cleanName}`;
}
