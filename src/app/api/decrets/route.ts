import { NextRequest, NextResponse } from 'next/server';
import { DecretService } from '../../../lib/services/decret.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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
}
