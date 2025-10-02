import { NextRequest, NextResponse } from 'next/server';
import { DecretService } from '../../../../lib/services/decret.service';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Extraire les filtres spécifiques
    const filters = {
      nom: searchParams.get('nom') || undefined,
      prenoms: searchParams.get('prenoms') || undefined,
      dateNaissance: searchParams.get('dateNaissance') || undefined,
      lieuNaissance: searchParams.get('lieuNaissance') || undefined,
      diplome: searchParams.get('diplome') || undefined,
      institution: searchParams.get('institution') || undefined,
    };

    // Nettoyer les filtres (supprimer les valeurs undefined)
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    // Si aucun filtre ni query, retourner vide
    if (!query.trim() && Object.keys(cleanedFilters).length === 0) {
      return NextResponse.json({
        affectations: [],
        total: 0,
        pages: 0,
        currentPage: page
      });
    }

    const result = await DecretService.searchAffectations(
      query, 
      page, 
      limit,
      Object.keys(cleanedFilters).length > 0 ? cleanedFilters : undefined
    );

    // Logger la recherche
    try {
      const adresseIp = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'Non disponible';
      const userAgent = request.headers.get('user-agent') || 'Non disponible';
      
      await prisma.logActivite.create({
        data: {
          action: 'RECHERCHE',
          description: `Recherche effectuée: ${query || 'Filtres avancés'}`,
          adresseIp,
          userAgent,
          metadonnees: {
            query,
            filters: cleanedFilters,
            resultsCount: result.total
          }
        }
      });
    } catch (logError) {
      // Ne pas faire échouer la recherche si le logging échoue
      console.error('Erreur lors du logging:', logError);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
