import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const decret = await prisma.decret.findUnique({
      where: { id },
      include: {
        affectations: true,
        _count: {
          select: { affectations: true }
        }
      }
    });

    if (!decret) {
      return NextResponse.json(
        { error: 'Décret non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(decret);

  } catch (error) {
    console.error('Erreur lors de la récupération du décret:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Vérifier que le décret existe
    const decret = await prisma.decret.findUnique({
      where: { id }
    });

    if (!decret) {
      return NextResponse.json(
        { error: 'Décret non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le décret (les affectations seront supprimées automatiquement grâce à onDelete: Cascade)
    await prisma.decret.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Décret supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du décret:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { titre, description } = body;

    // Vérifier que le décret existe
    const existingDecret = await prisma.decret.findUnique({
      where: { id }
    });

    if (!existingDecret) {
      return NextResponse.json(
        { error: 'Décret non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le décret
    const updatedDecret = await prisma.decret.update({
      where: { id },
      data: {
        titre,
        description,
      },
      include: {
        affectations: true,
        _count: {
          select: { affectations: true }
        }
      }
    });

    return NextResponse.json(updatedDecret);

  } catch (error) {
    console.error('Erreur lors de la mise à jour du décret:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
