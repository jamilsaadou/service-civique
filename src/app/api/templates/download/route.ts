import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'modele-import-affectations.xlsx');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: 'Fichier modèle non trouvé' },
        { status: 404 }
      );
    }

    // Lire le fichier
    const fileBuffer = fs.readFileSync(templatePath);

    // Retourner le fichier avec les bons headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="modele-import-affectations.xlsx"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Erreur lors du téléchargement du modèle:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
