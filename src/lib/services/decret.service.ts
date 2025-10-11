import { prisma } from "../prisma";
import { StatutDecret } from "../../generated/prisma";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";

export interface ImportedData {
  nom: string;
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  diplome: string;
  lieuObtentionDiplome: string;
  lieuAffectation: string;
  numeroDecret: string;
}

// Interface pour l'affichage frontend (compatibilité)
export interface DisplayData {
  id: string;
  prenom: string;
  nom: string;
  dateNaissance: string;
  lieuNaissance: string;
  niveauDiplome: string;
  specialite: string;
  etablissement: string;
  institutionAffectation: string;
  numeroDecret: string;
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
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir en JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    }) as unknown[][];

    const data: ImportedData[] = [];
    const errors: ValidationError[] = [];

    // Supposer que la première ligne contient les en-têtes
    const headers = jsonData[0] as string[];

    // Debug: afficher les en-têtes détectés
    console.log("En-têtes détectés dans le fichier Excel:", headers);

    // Mapper les colonnes attendues
    const columnMapping = {
      prenoms: this.findColumnIndex(headers, [
        "prénom(s)",
        "prénoms",
        "prénom",
        "prenom",
        "firstname",
      ]),
      nom: this.findColumnIndex(headers, ["nom", "lastname", "name"]),
      dateNaissance: this.findColumnIndex(headers, [
        "date de naissance",
        "date naissance",
        "date_naissance",
        "birthdate",
      ]),
      lieuNaissance: this.findColumnIndex(headers, [
        "lieu de naissance",
        "lieu naissance",
        "lieu_naissance",
        "birthplace",
      ]),
      diplome: this.findColumnIndex(headers, [
        "diplôme",
        "diplome",
        "niveau diplôme",
        "niveau diplome",
        "niveau_diplome",
        "diploma_level",
      ]),
      lieuObtentionDiplome: this.findColumnIndex(headers, [
        "lieu d'obtention du diplôme",
        "lieu d'obtention du diplome",
        "lieu obtention diplôme",
        "lieu obtention diplome",
        "établissement",
        "etablissement",
        "institution",
      ]),
      lieuAffectation: this.findColumnIndex(headers, [
        "lieu d'affectation",
        "lieu affectation",
        "institution affectation",
        "institution_affectation",
        "assignment",
      ]),
      numeroDecret: this.findColumnIndex(headers, [
        "numéro de décret",
        "numero de decret",
        "numéro décret",
        "numero decret",
        "decree_number",
      ]),
    };

    const optionalFields: (keyof ImportedData)[] = [
      "numeroDecret",
      "lieuObtentionDiplome",
    ];

    // Debug: afficher le mapping des colonnes
    console.log("Mapping des colonnes:", columnMapping);

    // Traiter chaque ligne (en sautant les en-têtes)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;

      const rowData: Partial<ImportedData> = {};
      const rowErrors: ValidationError[] = [];

      // Extraire les données de chaque colonne
      Object.entries(columnMapping).forEach(([field, columnIndex]) => {
        const typedField = field as keyof ImportedData;
        const isOptional = optionalFields.includes(typedField);

        if (columnIndex !== -1) {
          const value = row[columnIndex];
          if (value !== undefined && value !== null && value !== "") {
            rowData[typedField] = String(value).trim();
          } else if (!isOptional) {
            rowErrors.push({
              row: i + 1,
              field,
              message: `Champ requis manquant`,
            });
          } else if (rowData[typedField] === undefined) {
            rowData[typedField] = "Non renseigné";
          }
        } else if (!isOptional) {
          rowErrors.push({
            row: i + 1,
            field,
            message: `Colonne non trouvée dans le fichier Excel`,
          });
        } else if (rowData[typedField] === undefined) {
          rowData[typedField] = "Non renseigné";
        }
      });

      // Validation des données
      if (rowData.dateNaissance) {
        const parsedDate = this.parseDate(rowData.dateNaissance);
        if (!parsedDate) {
          rowErrors.push({
            row: i + 1,
            field: "dateNaissance",
            message:
              "Format de date invalide. Utilisez le format J/M/AAAA, J/M/AA (ex: 15/3/1995 ou 15/3/95) ou AAAA pour l'année seule (ex: 1996)",
          });
        } else {
          // Remplacer par la date parsée au format ISO
          rowData.dateNaissance = parsedDate.toISOString().split("T")[0];
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
   * Traite un fichier CSV et extrait les données d'affectation
   */
  static async processCsvFile(file: File): Promise<{
    data: ImportedData[];
    errors: ValidationError[];
  }> {
    const buffer = await file.arrayBuffer();
    const text = new TextDecoder("utf-8").decode(buffer);

    const data: ImportedData[] = [];
    const errors: ValidationError[] = [];

    try {
      // Détecter le délimiteur (virgule ou point-virgule)
      const firstLine = text.split("\n")[0];
      const delimiter = firstLine.includes(";") ? ";" : ",";

      console.log("Délimiteur CSV détecté:", delimiter);

      // Parser le CSV
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
        relax_quotes: true,
        delimiter: delimiter,
      }) as Record<string, string>[];

      if (!records || records.length === 0) {
        errors.push({
          row: 0,
          field: "general",
          message: "Le fichier CSV est vide",
        });
        return { data, errors };
      }

      // Obtenir les en-têtes depuis le premier enregistrement
      const headers = Object.keys(records[0] as Record<string, unknown>);
      console.log("En-têtes détectés dans le fichier CSV:", headers);

      // Mapper les colonnes attendues
      const columnMapping = {
        prenoms: this.findColumnName(headers, [
          "prénom(s)",
          "prénoms",
          "prénom",
          "prenom",
          "firstname",
        ]),
        nom: this.findColumnName(headers, ["nom", "lastname", "name"]),
        dateNaissance: this.findColumnName(headers, [
          "date de naissance",
          "date naissance",
          "date_naissance",
          "birthdate",
        ]),
        lieuNaissance: this.findColumnName(headers, [
          "lieu de naissance",
          "lieu naissance",
          "lieu_naissance",
          "birthplace",
        ]),
        diplome: this.findColumnName(headers, [
          "diplôme",
          "diplome",
          "niveau diplôme",
          "niveau diplome",
          "niveau_diplome",
          "diploma_level",
        ]),
        lieuObtentionDiplome: this.findColumnName(headers, [
          "lieu d'obtention du diplôme",
          "lieu d'obtention du diplome",
          "lieu obtention diplôme",
          "lieu obtention diplome",
          "établissement",
          "etablissement",
          "institution",
        ]),
        lieuAffectation: this.findColumnName(headers, [
          "lieu d'affectation",
          "lieu affectation",
          "institution affectation",
          "institution_affectation",
          "assignment",
        ]),
        numeroDecret: this.findColumnName(headers, [
          "numéro de décret",
          "numero de decret",
          "numéro décret",
          "numero decret",
          "decree_number",
        ]),
      };

      const optionalFields: (keyof ImportedData)[] = [
        "numeroDecret",
        "lieuObtentionDiplome",
      ];

      console.log("Mapping des colonnes:", columnMapping);

      // Traiter chaque ligne
      records.forEach((record: Record<string, string>, index: number) => {
        const rowData: Partial<ImportedData> = {};
        const rowErrors: ValidationError[] = [];

        // Extraire les données de chaque colonne
        Object.entries(columnMapping).forEach(([field, columnName]) => {
          const typedField = field as keyof ImportedData;
          const isOptional = optionalFields.includes(typedField);

          if (columnName) {
            const value = record[columnName];
            if (value !== undefined && value !== null && value.trim() !== "") {
              rowData[typedField] = value.trim();
            } else if (!isOptional) {
              rowErrors.push({
                row: index + 2, // +2 car index commence à 0 et on saute l'en-tête
                field,
                message: `Champ requis manquant`,
              });
            } else if (rowData[typedField] === undefined) {
              rowData[typedField] = "Non renseigné";
            }
          } else if (!isOptional) {
            rowErrors.push({
              row: index + 2,
              field,
              message: `Colonne non trouvée dans le fichier CSV`,
            });
          } else if (rowData[typedField] === undefined) {
            rowData[typedField] = "Non renseigné";
          }
        });

        // Validation des données
        if (rowData.dateNaissance) {
          const parsedDate = this.parseDate(rowData.dateNaissance);
          if (!parsedDate) {
            rowErrors.push({
              row: index + 2,
              field: "dateNaissance",
              message:
                "Format de date invalide. Utilisez le format J/M/AAAA, J/M/AA (ex: 15/3/1995 ou 15/3/95) ou AAAA pour l'année seule (ex: 1996)",
            });
          } else {
            // Remplacer par la date parsée au format ISO
            rowData.dateNaissance = parsedDate.toISOString().split("T")[0];
          }
        }

        if (rowErrors.length === 0) {
          data.push(rowData as ImportedData);
        } else {
          errors.push(...rowErrors);
        }
      });
    } catch (error) {
      console.error("Erreur lors du parsing CSV:", error);
      errors.push({
        row: 0,
        field: "general",
        message: `Erreur lors du parsing du fichier CSV: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`,
      });
    }

    return { data, errors };
  }

  /**
   * Parse une date au format J/M/AAAA, JJ/MM/AAAA, J/M/AA, JJ/MM/AA ou AAAA (année seule)
   */
  private static parseDate(dateString: string): Date | null {
    if (!dateString || typeof dateString !== "string") {
      return null;
    }

    // Nettoyer la chaîne
    const cleanDate = dateString.trim();

    // Vérifier si c'est seulement une année (4 chiffres)
    const yearOnlyRegex = /^(\d{4})$/;
    const yearMatch = cleanDate.match(yearOnlyRegex);

    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);

      // Validation de l'année
      if (year < 1900 || year > 2100) {
        return null;
      }

      // Compléter avec 01/01 pour l'année fournie
      return new Date(year, 0, 1); // 1er janvier de l'année
    }

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
    if (
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 1900 ||
      year > 2100
    ) {
      return null;
    }

    // Créer la date (mois - 1 car JavaScript utilise 0-11 pour les mois)
    const date = new Date(year, month - 1, day);

    // Vérifier que la date est valide (pas de 31 février par exemple)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  /**
   * Trouve l'index d'une colonne basé sur des noms possibles
   */
  private static findColumnIndex(
    headers: string[],
    possibleNames: string[]
  ): number {
    for (const name of possibleNames) {
      const index = headers.findIndex(
        (header) =>
          header &&
          typeof header === "string" &&
          header.toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (index !== -1) return index;
    }
    return -1;
  }

  /**
   * Trouve le nom d'une colonne basé sur des noms possibles (pour CSV)
   */
  private static findColumnName(
    headers: string[],
    possibleNames: string[]
  ): string | null {
    for (const name of possibleNames) {
      const found = headers.find(
        (header) =>
          header &&
          typeof header === "string" &&
          header.toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (found) return found;
    }
    return null;
  }

  /**
   * Convertit les données ImportedData vers DisplayData pour la compatibilité frontend
   */
  static convertToDisplayData(
    importedData: ImportedData[],
    numeroDecret: string
  ): DisplayData[] {
    return importedData.map((item, index) => ({
      id: (index + 1).toString(),
      prenom: item.prenoms, // Mapping prenoms -> prenom
      nom: item.nom,
      dateNaissance: item.dateNaissance,
      lieuNaissance: item.lieuNaissance,
      niveauDiplome: item.diplome, // Mapping diplome -> niveauDiplome
      specialite: "", // Champ vide car non disponible dans ImportedData
      etablissement: item.lieuObtentionDiplome, // Mapping lieuObtentionDiplome -> etablissement
      institutionAffectation: item.lieuAffectation, // Mapping lieuAffectation -> institutionAffectation
      numeroDecret: item.numeroDecret || numeroDecret,
    }));
  }

  /**
   * Trie les données par ordre alphabétique (nom, puis prénom)
   */
  static sortDataAlphabetically(data: ImportedData[]): ImportedData[] {
    return [...data].sort((a, b) => {
      // Tri par nom d'abord
      const nomComparison = a.nom.localeCompare(b.nom, "fr", {
        sensitivity: "base",
      });
      if (nomComparison !== 0) {
        return nomComparison;
      }
      // Si les noms sont identiques, trier par prénom
      return a.prenoms.localeCompare(b.prenoms, "fr", { sensitivity: "base" });
    });
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
          create: affectations.map((affectation) => ({
            prenoms: affectation.prenoms,
            nom: affectation.nom,
            dateNaissance: new Date(affectation.dateNaissance),
            lieuNaissance: affectation.lieuNaissance,
            diplome: affectation.diplome,
            lieuObtentionDiplome: affectation.lieuObtentionDiplome,
            lieuAffectation: affectation.lieuAffectation,
            numeroDecret: affectation.numeroDecret,
          })),
        },
      },
      include: {
        affectations: true,
      },
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
        datePublication: new Date(),
      },
      include: {
        affectations: true,
      },
    });
  }

  /**
   * Récupère tous les décrets avec pagination, recherche et filtres
   */
  static async getDecrets(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string = ""
  ) {
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
        { description: { contains: search } },
      ];
    }

    // Filtre par statut
    if (status && status !== "all") {
      if (status === "publie") {
        whereConditions.statut = StatutDecret.PUBLIE;
      } else if (status === "brouillon") {
        whereConditions.statut = StatutDecret.BROUILLON;
      } else if (status === "archive") {
        whereConditions.statut = StatutDecret.ARCHIVE;
      }
    }

    const [decrets, total] = await Promise.all([
      prisma.decret.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { dateCreation: "desc" },
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
            select: { affectations: true },
          },
          affectations: {
            select: {
              lieuAffectation: true,
            },
            distinct: ["lieuAffectation"],
          },
        },
      }),
      prisma.decret.count({
        where: whereConditions,
      }),
    ]);

    return {
      decrets,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  /**
   * Récupère un décret par son ID avec ses affectations
   */
  static async getDecretById(id: string) {
    return await prisma.decret.findUnique({
      where: { id },
      include: {
        affectations: true,
      },
    });
  }

  /**
   * Recherche dans les affectations avec filtres avancés
   */
  static async searchAffectations(
    query: string = "",
    page: number = 1,
    limit: number = 10,
    filters?: {
      nom?: string;
      prenoms?: string;
      dateNaissance?: string;
      lieuNaissance?: string;
      diplome?: string;
      institution?: string;
    }
  ) {
    const skip = (page - 1) * limit;

    // Construire les conditions de recherche
    const whereConditions: any = {
      decret: {
        statut: StatutDecret.PUBLIE,
      },
    };

    const searchConditions: any[] = [];

    // Si query est fourni, rechercher dans tous les champs
    if (query && query.trim()) {
      searchConditions.push(
        { prenoms: { contains: query } },
        { nom: { contains: query } },
        { lieuAffectation: { contains: query } },
        { diplome: { contains: query } },
        { lieuObtentionDiplome: { contains: query } },
        { lieuNaissance: { contains: query } }
      );
    }

    // Appliquer les filtres spécifiques
    if (filters) {
      if (filters.nom?.trim()) {
        searchConditions.push({ nom: { contains: filters.nom } });
      }
      if (filters.prenoms?.trim()) {
        searchConditions.push({ prenoms: { contains: filters.prenoms } });
      }
      if (filters.dateNaissance?.trim()) {
        // Recherche par année de naissance si seulement l'année est fournie
        const yearMatch = filters.dateNaissance.match(/^\d{4}$/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0], 10);
          const startDate = new Date(year, 0, 1);
          const endDate = new Date(year, 11, 31, 23, 59, 59);
          searchConditions.push({
            dateNaissance: {
              gte: startDate,
              lte: endDate,
            },
          });
        } else {
          // Recherche par date exacte
          const parsedDate = this.parseDate(filters.dateNaissance);
          if (parsedDate) {
            searchConditions.push({ dateNaissance: parsedDate });
          }
        }
      }
      if (filters.lieuNaissance?.trim()) {
        searchConditions.push({
          lieuNaissance: { contains: filters.lieuNaissance },
        });
      }
      if (filters.diplome?.trim()) {
        searchConditions.push({ diplome: { contains: filters.diplome } });
      }
      if (filters.institution?.trim()) {
        searchConditions.push({
          lieuAffectation: { contains: filters.institution },
        });
      }
    }

    // Si des conditions de recherche existent, les ajouter avec OR
    if (searchConditions.length > 0) {
      whereConditions.OR = searchConditions;
    }

    const [affectations, total] = await Promise.all([
      prisma.affectation.findMany({
        where: whereConditions,
        skip,
        take: limit,
        include: {
          decret: {
            select: {
              numero: true,
              titre: true,
              datePublication: true,
              fichierPdf: true,
            },
          },
        },
        orderBy: { dateCreation: "desc" },
      }),
      prisma.affectation.count({
        where: whereConditions,
      }),
    ]);

    return {
      affectations,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
