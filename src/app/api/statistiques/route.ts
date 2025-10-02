import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { StatutDecret } from '../../../generated/prisma';

export async function GET() {
  try {
    // Récupérer les statistiques globales
    const [
      totalAffectations,
      totalDecrets,
      decretsPublies,
      institutionsUniques,
      lieuxNaissanceUniques,
      diplomesUniques,
      totalRecherches,
      totalConsultations
    ] = await Promise.all([
      // Total des affectations
      prisma.affectation.count({
        where: {
          decret: {
            statut: StatutDecret.PUBLIE
          }
        }
      }),
      
      // Total des décrets
      prisma.decret.count(),
      
      // Décrets publiés
      prisma.decret.count({
        where: { statut: StatutDecret.PUBLIE }
      }),
      
      // Institutions uniques
      prisma.affectation.findMany({
        where: {
          decret: { statut: StatutDecret.PUBLIE }
        },
        select: { lieuAffectation: true },
        distinct: ['lieuAffectation']
      }),
      
      // Lieux de naissance uniques
      prisma.affectation.findMany({
        where: {
          decret: { statut: StatutDecret.PUBLIE }
        },
        select: { lieuNaissance: true },
        distinct: ['lieuNaissance']
      }),
      
      // Diplômes uniques
      prisma.affectation.findMany({
        where: {
          decret: { statut: StatutDecret.PUBLIE }
        },
        select: { diplome: true },
        distinct: ['diplome']
      }),
      
      // Total des recherches
      prisma.logActivite.count({
        where: { action: 'RECHERCHE' }
      }),
      
      // Total des consultations
      prisma.logActivite.count({
        where: { action: 'CONSULTATION' }
      })
    ]);

    // Statistiques par institution
    const affectationsParInstitution = await prisma.affectation.groupBy({
      by: ['lieuAffectation'],
      where: {
        decret: { statut: StatutDecret.PUBLIE }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Statistiques par diplôme
    const affectationsParDiplome = await prisma.affectation.groupBy({
      by: ['diplome'],
      where: {
        decret: { statut: StatutDecret.PUBLIE }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Statistiques par lieu de naissance
    const affectationsParLieuNaissance = await prisma.affectation.groupBy({
      by: ['lieuNaissance'],
      where: {
        decret: { statut: StatutDecret.PUBLIE }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Statistiques de recherche par adresse IP
    const recherchesParIP = await prisma.logActivite.groupBy({
      by: ['adresseIp'],
      where: {
        action: 'RECHERCHE',
        adresseIp: {
          not: 'Non disponible'
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Recherches récentes (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recherchesRecentes = await prisma.logActivite.findMany({
      where: {
        action: 'RECHERCHE',
        dateCreation: {
          gte: sevenDaysAgo
        }
      },
      select: {
        dateCreation: true,
        metadonnees: true
      },
      orderBy: {
        dateCreation: 'asc'
      }
    });

    // Organiser les recherches par jour
    const rechercheParJour: { [key: string]: number } = {};
    recherchesRecentes.forEach(recherche => {
      const jour = new Date(recherche.dateCreation).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short'
      });
      rechercheParJour[jour] = (rechercheParJour[jour] || 0) + 1;
    });

    const statistiquesRecherches = Object.entries(rechercheParJour).map(([jour, count]) => ({
      jour,
      recherches: count
    }));

    // Termes de recherche les plus fréquents
    const termesRecherche = recherchesRecentes
      .map(log => {
        if (log.metadonnees && typeof log.metadonnees === 'object') {
          const meta = log.metadonnees as any;
          return meta.query || '';
        }
        return '';
      })
      .filter(term => term.trim() !== '');

    const termesCounts: { [key: string]: number } = {};
    termesRecherche.forEach(terme => {
      termesCounts[terme] = (termesCounts[terme] || 0) + 1;
    });

    const topTermesRecherche = Object.entries(termesCounts)
      .map(([terme, count]) => ({ terme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      global: {
        totalAffectations,
        totalDecrets,
        decretsPublies,
        nombreInstitutions: institutionsUniques.length,
        nombreLieuxNaissance: lieuxNaissanceUniques.length,
        nombreDiplomes: diplomesUniques.length,
        totalRecherches,
        totalConsultations
      },
      parInstitution: affectationsParInstitution.map(item => ({
        nom: item.lieuAffectation,
        nombreAffectations: item._count.id,
        pourcentage: totalAffectations > 0 
          ? ((item._count.id / totalAffectations) * 100).toFixed(1)
          : '0'
      })),
      parDiplome: affectationsParDiplome.map(item => ({
        nom: item.diplome,
        nombreAffectations: item._count.id,
        pourcentage: totalAffectations > 0
          ? ((item._count.id / totalAffectations) * 100).toFixed(1)
          : '0'
      })),
      parLieuNaissance: affectationsParLieuNaissance.map(item => ({
        nom: item.lieuNaissance,
        nombreAffectations: item._count.id
      })),
      recherchesParJour: statistiquesRecherches,
      recherchesParIP: recherchesParIP.map(item => ({
        adresseIp: item.adresseIp,
        nombreRecherches: item._count.id
      })),
      topTermesRecherche
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
