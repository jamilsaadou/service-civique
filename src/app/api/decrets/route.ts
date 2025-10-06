import { NextRequest, NextResponse } from 'next/server';
import { DecretService } from '../../../lib/services/decret.service';
import { withAuth } from '../../../lib/auth-middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') || '';

      const result = await DecretService.getDecrets(page, limit, search, status);

      return NextResponse.json(result);

    } catch (error) {
      console.error('Erreur lors de la récupération des décrets:', error);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }
  }, {
    requiredRole: ['ADMIN', 'SUPER_ADMIN', 'OPERATEUR', 'LECTEUR']
  });
}
