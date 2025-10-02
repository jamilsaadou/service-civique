import { NextRequest, NextResponse } from 'next/server';
import { DecretService } from '../../../../lib/services/decret.service';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const excelFile = formData.get('excelFile') as File;
    const pdfFile = formData.get('pdfFile') as File;
    const numero = formData.get('numero') as string;
    const titre = formData.get('titre') as string;
    const description = formData.get('description') as string;

    if (!excelFile || !pdfFile || !numero || !titre) {
      return NextResponse.json(
        { error: 'Fichiers Excel et PDF, numéro et titre sont requis' },
        { status: 400 }
      );
    }

    // Vérifier les types de fichiers
    if (!excelFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        { error: 'Le fichier doit avoir une extension .xlsx, .xls ou .csv' },
        { status: 400 }
      );
    }

    if (!pdfFile.name.match(/\.pdf$/i)) {
      return NextResponse.json(
        { error: 'Le fichier doit être un PDF' },
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
        data: []
      });
    }

    // Trier les données par ordre alphabétique
    const sortedData = DecretService.sortDataAlphabetically(data);

    // Convertir pour l'affichage frontend
    const displayData = DecretService.convertToDisplayData(sortedData, numero);

    // Générer des noms de fichiers uniques
    const timestamp = Date.now();
    const excelFileName = `${timestamp}_${excelFile.name}`;
    const pdfFileName = `${timestamp}_${pdfFile.name}`;
    
    const excelPath = `uploads/excel/${excelFileName}`;
    const pdfPath = `uploads/pdf/${pdfFileName}`;

    // Sauvegarder le fichier Excel
    const excelBuffer = Buffer.from(await excelFile.arrayBuffer());
    const excelFullPath = join(process.cwd(), 'public', excelPath);
    await writeFile(excelFullPath, excelBuffer);

    // Sauvegarder le fichier PDF
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const pdfFullPath = join(process.cwd(), 'public', pdfPath);
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
      errors: []
    });

  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
