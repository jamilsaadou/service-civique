import { NextRequest, NextResponse } from "next/server";
import { DecretService } from "../../../../lib/services/decret.service";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { withAuth } from "../../../../lib/auth-middleware";
import { UPLOADS_DIR, UPLOAD_FOLDERS } from "../../../../lib/config";

export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (req) => {
      try {
        const formData = await req.formData();
        const excelFile = formData.get("excelFile") as File;
        const pdfFile = formData.get("pdfFile") as File;
        const numero = formData.get("numero") as string;
        const titre = formData.get("titre") as string;
        const description = formData.get("description") as string;

        if (!excelFile || !pdfFile || !numero || !titre) {
          return NextResponse.json(
            { error: "Fichiers Excel et PDF, numéro et titre sont requis" },
            { status: 400 }
          );
        }

        // Vérifier les types de fichiers
        if (!excelFile.name.match(/\.(xlsx|xls|csv)$/i)) {
          return NextResponse.json(
            {
              error: "Le fichier doit avoir une extension .xlsx, .xls ou .csv",
            },
            { status: 400 }
          );
        }

        if (!pdfFile.name.match(/\.pdf$/i)) {
          return NextResponse.json(
            { error: "Le fichier doit être un PDF" },
            { status: 400 }
          );
        }

        // Traiter le fichier (Excel ou CSV)
        const isCsvFile = excelFile.name.match(/\.csv$/i);
        const { data, errors } = isCsvFile
          ? await DecretService.processCsvFile(excelFile)
          : await DecretService.processExcelFile(excelFile);

        if (errors.length > 0) {
          return NextResponse.json({
            success: false,
            errors,
            data: [],
          });
        }

        // Trier les données par ordre alphabétique
        const sortedData = DecretService.sortDataAlphabetically(data);

        // Convertir pour l'affichage frontend
        const displayData = DecretService.convertToDisplayData(
          sortedData,
          numero
        );

        // Générer des noms de fichiers uniques
        const timestamp = Date.now();
        const excelFileName = `${timestamp}_${excelFile.name}`;
        const pdfFileName = `${timestamp}_${pdfFile.name}`;

        // Créer les dossiers s'ils n'existent pas
        const excelDir = join(UPLOADS_DIR, UPLOAD_FOLDERS.excel);
        const pdfDir = join(UPLOADS_DIR, UPLOAD_FOLDERS.pdf);

        await mkdir(excelDir, { recursive: true });
        await mkdir(pdfDir, { recursive: true });

        // Chemins complets pour sauvegarder les fichiers
        const excelFullPath = join(excelDir, excelFileName);
        const pdfFullPath = join(pdfDir, pdfFileName);

        // Chemins relatifs pour stocker en base de données (URLs accessibles via nginx)
        const excelPath = `${UPLOAD_FOLDERS.excel}/${excelFileName}`;
        const pdfPath = `${UPLOAD_FOLDERS.pdf}/${pdfFileName}`;

        // Sauvegarder le fichier Excel
        const excelBuffer = Buffer.from(await excelFile.arrayBuffer());
        await writeFile(excelFullPath, excelBuffer);

        // Sauvegarder le fichier PDF
        const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
        await writeFile(pdfFullPath, pdfBuffer);

        // Créer le décret avec les affectations (utiliser les données triées)
        const decret = await DecretService.createDecret(
          { numero, titre, description },
          sortedData,
          excelPath,
          pdfPath
        );

        return NextResponse.json({
          success: true,
          decret,
          data: displayData, // Retourner les données formatées pour le frontend
          errors: [],
        });
      } catch (error) {
        console.error("Erreur lors de l'import:", error);
        return NextResponse.json(
          { error: "Erreur interne du serveur" },
          { status: 500 }
        );
      }
    },
    {
      requiredRole: ["ADMIN", "SUPER_ADMIN"],
    }
  );
}
