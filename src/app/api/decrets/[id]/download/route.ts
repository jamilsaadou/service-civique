import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Récupérer le décret
    const decret = await prisma.decret.findUnique({
      where: { id }
    });

    if (!decret) {
      return NextResponse.json(
        { error: 'Décret non trouvé' },
        { status: 404 }
      );
    }

    // Note: Permettre le téléchargement des PDF pour tous les décrets qui ont un fichier PDF
    // (pas seulement les décrets publiés)

    // Vérifier qu'un fichier PDF existe
    if (!decret.fichierPdf) {
      return NextResponse.json(
        { error: 'Aucun fichier PDF associé à ce décret' },
        { status: 404 }
      );
    }

    try {
      // Lire le fichier PDF depuis le système de fichiers
      const filePath = join(process.cwd(), 'public', decret.fichierPdf);
      const fileBuffer = await readFile(filePath);

      // Extraire le nom du fichier pour le téléchargement
      const fileName = `${decret.numero}.pdf`;

      // Retourner le fichier PDF
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });

    } catch (fileError) {
      console.error('Erreur lors de la lecture du fichier PDF:', fileError);
      return NextResponse.json(
        { error: 'Fichier PDF introuvable sur le serveur' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Erreur lors du téléchargement du décret:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
