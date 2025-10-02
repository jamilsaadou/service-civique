import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/affectations/fields
 * Récupère les valeurs uniques des champs pour l'autocomplétion
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field');
    const query = searchParams.get('q') || '';

    if (!field) {
      return NextResponse.json(
        { error: 'Le paramètre "field" est requis' },
        { status: 400 }
      );
    }

    let results: string[] = [];

    switch (field) {
      case 'lieuNaissance':
        // Récupérer les lieux de naissance uniques des affectations publiées
        const lieuxNaissance = await prisma.affectation.findMany({
          where: {
            decret: {
              statut: 'PUBLIE'
            },
            lieuNaissance: {
              contains: query
            }
          },
          select: {
            lieuNaissance: true
          },
          distinct: ['lieuNaissance'],
          take: 20
        });
        results = lieuxNaissance
          .map((a: { lieuNaissance: string }) => a.lieuNaissance)
          .filter(Boolean)
          .sort();
        break;

      case 'institutionAffectation':
        // Récupérer les institutions d'affectation uniques des affectations publiées
        const institutions = await prisma.affectation.findMany({
          where: {
            decret: {
              statut: 'PUBLIE'
            },
            lieuAffectation: {
              contains: query
            }
          },
          select: {
            lieuAffectation: true
          },
          distinct: ['lieuAffectation'],
          take: 20
        });
        results = institutions
          .map((a: { lieuAffectation: string }) => a.lieuAffectation)
          .filter(Boolean)
          .sort();
        break;

      case 'diplome':
        // Récupérer les diplômes uniques des affectations publiées
        const diplomes = await prisma.affectation.findMany({
          where: {
            decret: {
              statut: 'PUBLIE'
            },
            diplome: {
              contains: query
            }
          },
          select: {
            diplome: true
          },
          distinct: ['diplome'],
          take: 20
        });
        results = diplomes
          .map((a: { diplome: string }) => a.diplome)
          .filter(Boolean)
          .sort();
        break;

      default:
        return NextResponse.json(
          { error: 'Champ non supporté' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      field,
      results,
      count: results.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des champs:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des données',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
