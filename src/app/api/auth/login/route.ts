import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('Tentative de connexion pour:', username);

    // Rechercher l'utilisateur par email (username)
    const user = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { email: username },
          { email: `${username}@ansi.gov.ne` }
        ],
        actif: true
      }
    });

    if (!user) {
      console.log('Utilisateur non trouvé');
      return NextResponse.json({
        success: false,
        message: 'Nom d\'utilisateur ou mot de passe incorrect'
      }, { status: 401 });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.motDePasse);

    if (!isPasswordValid) {
      console.log('Mot de passe incorrect');
      return NextResponse.json({
        success: false,
        message: 'Nom d\'utilisateur ou mot de passe incorrect'
      }, { status: 401 });
    }

    // Générer un token simple (en production, utiliser JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    console.log('Authentification réussie pour:', user.email, 'Role:', user.role);

    return NextResponse.json({
      success: true,
      token,
      message: 'Authentification réussie',
      user: {
        id: user.id,
        username: user.email.split('@')[0],
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return NextResponse.json({
      success: false,
      message: 'Une erreur est survenue lors de l\'authentification'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
