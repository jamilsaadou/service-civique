import { prisma } from '../prisma';
import { StatutDecret } from '../../generated/prisma';
import * as XLSX from 'xlsx';

export interface ImportedData {
  prenom: string;
  nom: string;
  dateNaissance: string;
  lieuNaissance: string;
  niveauDiplome: string;
  specialite: string;
  etablissement: string;
  institutionAffectation: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface DecretData {
  numero: string;
  titre: string;
  description?: string;
}

export class DecretService {
  /**
   * Traite un fichier Excel et extrait les données d'affectation
   */
  static async processExcelFile(file: File): Promise<{
    data: ImportedData[];
    errors: ValidationError[];
  }> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir en JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
    
    const data: ImportedData[] = [];
    const errors: ValidationError[] = [];
    
    // Supposer que la première ligne contient les en-têtes
    const headers = jsonData[0] as string[];
    
    // Debug: afficher les en-têtes détectés
    console.log('En-têtes détectés dans le fichier Excel:', headers);
    
    // Mapper les colonnes attendues
    const columnMapping = {
      prenom: this.findColumnIndex(headers, ['prénom', 'prenom', 'firstname']),
      nom: this.findColumnIndex(headers, ['nom', 'lastname', 'name']),
      dateNaissance: this.findColumnIndex(headers, ['date naissance', 'date_naissance', 'birthdate']),
      lieuNaissance: this.findColumnIndex(headers, ['lieu naissance', 'lieu_naissance', 'birthplace']),
      niveauDiplome: this.findColumnIndex(headers, ['niveau diplôme', 'niveau diplome', 'niveau_diplome', 'diploma_level']),
      specialite: this.findColumnIndex(headers, ['spécialité', 'specialite', 'specialty']),
      etablissement: this.findColumnIndex(headers, ['établissement', 'etablissement', 'institution']),
      institutionAffectation: this.findColumnIndex(headers, ['institution affectation', 'institution_affectation', 'assignment'])
    };
    
    // Debug: afficher le mapping des colonnes
    console.log('Mapping des colonnes:', columnMapping);
    
    // Traiter chaque ligne (en sautant les en-têtes)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;
      
      const rowData: Partial<ImportedData> = {};
      const rowErrors: ValidationError[] = [];
      
      // Extraire les données de chaque colonne
      Object.entries(columnMapping).forEach(([field, columnIndex]) => {
        if (columnIndex !== -1) {
          const value = row[columnIndex];
          if (value !== undefined && value !== null && value !== '') {
            rowData[field as keyof ImportedData] = String(value).trim();
          } else {
            rowErrors.push({
              row: i + 1,
              field,
              message: `Champ requis manquant`
            });
          }
        } else {
          rowErrors.push({
            row: i + 1,
            field,
            message: `Colonne non trouvée dans le fichier Excel`
          });
        }
      });
      
      // Validation des données
      if (rowData.dateNaissance) {
        const parsedDate = this.parseDate(rowData.dateNaissance);
        if (!parsedDate) {
          rowErrors.push({
            row: i + 1,
            field: 'dateNaissance',
            message: 'Format de date invalide. Utilisez le format J/M/AAAA ou J/M/AA (ex: 15/3/1995 ou 15/3/95)'
          });
        } else {
          // Remplacer par la date parsée au format ISO
          rowData.dateNaissance = parsedDate.toISOString().split('T')[0];
        }
      }
      
      if (rowErrors.length === 0) {
        data.push(rowData as ImportedData);
      } else {
        errors.push(...rowErrors);
      }
    }
    
    return { data, errors };
  }
  
  /**
   * Parse une date au format J/M/AAAA, JJ/MM/AAAA, J/M/AA ou JJ/MM/AA
   */
  private static parseDate(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }

    // Nettoyer la chaîne
    const cleanDate = dateString.trim();
    
    // Vérifier le format J/M/AAAA, JJ/MM/AAAA, J/M/AA ou JJ/MM/AA
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
    const match = cleanDate.match(dateRegex);
    
    if (!match) {
      return null;
    }
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    let year = parseInt(match[3], 10);
    
    // Convertir les années à 2 chiffres en années complètes
    if (year < 100) {
      // Supposer que les années 00-30 sont 2000-2030, et 31-99 sont 1931-1999
      if (year <= 30) {
        year += 2000;
      } else {
        year += 1900;
      }
    }
    
    // Validation basique
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
      return null;
    }
    
    // Créer la date (mois - 1 car JavaScript utilise 0-11 pour les mois)
    const date = new Date(year, month - 1, day);
    
    // Vérifier que la date est valide (pas de 31 février par exemple)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    
    return date;
  }

  /**
   * Trouve l'index d'une colonne basé sur des noms possibles
   */
  private static findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex(header => 
        header && typeof header === 'string' && 
        header.toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (index !== -1) return index;
    }
    return -1;
  }
  
  /**
   * Crée un nouveau décret avec ses affectations
   */
  static async createDecret(
    decretData: DecretData,
    affectations: ImportedData[],
    fichierExcel?: string,
    fichierPdf?: string
  ) {
    return await prisma.decret.create({
      data: {
        numero: decretData.numero,
        titre: decretData.titre,
        description: decretData.description,
        fichierExcel,
        fichierPdf,
        statut: StatutDecret.BROUILLON,
        affectations: {
          create: affectations.map(affectation => ({
            prenom: affectation.prenom,
            nom: affectation.nom,
            dateNaissance: new Date(affectation.dateNaissance),
            lieuNaissance: affectation.lieuNaissance,
            niveauDiplome: affectation.niveauDiplome,
            specialite: affectation.specialite,
            etablissement: affectation.etablissement,
            institutionAffectation: affectation.institutionAffectation
          }))
        }
      },
      include: {
        affectations: true
      }
    });
  }
  
  /**
   * Publie un décret (change son statut à PUBLIE)
   */
  static async publishDecret(decretId: string) {
    return await prisma.decret.update({
      where: { id: decretId },
      data: {
        statut: StatutDecret.PUBLIE,
        datePublication: new Date()
      },
      include: {
        affectations: true
      }
    });
  }
  
  /**
   * Récupère tous les décrets avec pagination, recherche et filtres
   */
  static async getDecrets(page: number = 1, limit: number = 10, search: string = '', status: string = '') {
    const skip = (page - 1) * limit;
    
    // Construire les conditions de recherche
    const whereConditions: {
      OR?: Array<{
        numero?: { contains: string };
        titre?: { contains: string };
        description?: { contains: string };
      }>;
      statut?: StatutDecret;
    } = {};
    
    // Recherche par numéro ou titre
    if (search.trim()) {
      whereConditions.OR = [
        { numero: { contains: search } },
        { titre: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    // Filtre par statut
    if (status && status !== 'all') {
      if (status === 'publie') {
        whereConditions.statut = StatutDecret.PUBLIE;
      } else if (status === 'brouillon') {
        whereConditions.statut = StatutDecret.BROUILLON;
      } else if (status === 'archive') {
        whereConditions.statut = StatutDecret.ARCHIVE;
      }
    }
    
    const [decrets, total] = await Promise.all([
      prisma.decret.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { dateCreation: 'desc' },
        select: {
          id: true,
          numero: true,
          titre: true,
          description: true,
          dateCreation: true,
          datePublication: true,
          statut: true,
          fichierPdf: true,
          fichierExcel: true,
          _count: {
            select: { affectations: true }
          },
          affectations: {
            select: {
              institutionAffectation: true
            },
            distinct: ['institutionAffectation']
          }
        }
      }),
      prisma.decret.count({
        where: whereConditions
      })
    ]);
    
    return {
      decrets,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    };
  }
  
  /**
   * Récupère un décret par son ID avec ses affectations
   */
  static async getDecretById(id: string) {
    return await prisma.decret.findUnique({
      where: { id },
      include: {
        affectations: true
      }
    });
  }
  
  /**
   * Recherche dans les affectations
   */
  static async searchAffectations(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [affectations, total] = await Promise.all([
      prisma.affectation.findMany({
        where: {
          OR: [
            { prenom: { contains: query } },
            { nom: { contains: query } },
            { institutionAffectation: { contains: query } },
            { specialite: { contains: query } }
          ],
          decret: {
            statut: StatutDecret.PUBLIE
          }
        },
        skip,
        take: limit,
        include: {
          decret: {
            select: {
              numero: true,
              titre: true,
              datePublication: true
            }
          }
        },
        orderBy: { dateCreation: 'desc' }
      }),
      prisma.affectation.count({
        where: {
          OR: [
            { prenom: { contains: query } },
            { nom: { contains: query } },
            { institutionAffectation: { contains: query } },
            { specialite: { contains: query } }
          ],
          decret: {
            statut: StatutDecret.PUBLIE
          }
        }
      })
    ]);
    
    return {
      affectations,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    };
  }
}
