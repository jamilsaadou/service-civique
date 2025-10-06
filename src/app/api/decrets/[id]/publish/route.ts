import { NextRequest, NextResponse } from 'next/server';
import { DecretService } from '../../../../../lib/services/decret.service';
import { withAuth } from '../../../../../lib/auth-middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req) => {
    try {
      const { id } = await params;

      if (!id) {
        return NextResponse.json(
          { error: 'ID du décret requis' },
          { status: 400 }
        );
      }

      // Publier le décret
      const decret = await DecretService.publishDecret(id);

      if (!decret) {
        return NextResponse.json(
          { error: 'Décret non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        decret
      });

    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }
  }, {
    requiredRole: ['ADMIN', 'SUPER_ADMIN']
  });
}
