import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { StatutDecret } from '../../../generated/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Récupérer toutes les affectations des décrets publiés
    const [affectations, total] = await Promise.all([
      prisma.affectation.findMany({
        where: {
          decret: {
            statut: StatutDecret.PUBLIE
          }
        },
        skip,
        take: limit,
        include: {
          decret: {
            select: {
              numero: true,
              titre: true,
              datePublication: true,
              fichierPdf: true
            }
          }
        },
        orderBy: [
          { decret: { datePublication: 'desc' } },
          { nom: 'asc' },
          { prenoms: 'asc' }
        ]
      }),
      prisma.affectation.count({
        where: {
          decret: {
            statut: StatutDecret.PUBLIE
          }
        }
      })
    ]);

    return NextResponse.json({
      affectations,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
