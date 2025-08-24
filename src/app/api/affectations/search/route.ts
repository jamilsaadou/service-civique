import { NextRequest, NextResponse } from 'next/server';
import { DecretService } from '../../../../lib/services/decret.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json({
        affectations: [],
        total: 0,
        pages: 0,
        currentPage: page
      });
    }

    const result = await DecretService.searchAffectations(query, page, limit);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
