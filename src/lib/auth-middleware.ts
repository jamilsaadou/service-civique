import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware d'authentification pour les routes API
 * Vérifie le token JWT et ajoute les informations utilisateur à la requête
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options?: {
    requiredRole?: string | string[];
  }
): Promise<NextResponse> {
  // Extraire le token du header Authorization
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  // Vérifier la présence du token
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Token d\'authentification manquant',
        error: 'MISSING_TOKEN'
      },
      { status: 401 }
    );
  }

  // Vérifier et décoder le token
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      {
        success: false,
        message: 'Token d\'authentification invalide ou expiré',
        error: 'INVALID_TOKEN'
      },
      { status: 401 }
    );
  }

  // Vérifier le rôle si nécessaire
  if (options?.requiredRole) {
    const requiredRoles = Array.isArray(options.requiredRole)
      ? options.requiredRole
      : [options.requiredRole];

    if (!requiredRoles.includes(decoded.role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Accès non autorisé : privilèges insuffisants',
          error: 'INSUFFICIENT_PRIVILEGES'
        },
        { status: 403 }
      );
    }
  }

  // Ajouter les informations utilisateur à la requête
  const authenticatedRequest = request as AuthenticatedRequest;
  authenticatedRequest.user = decoded;

  // Appeler le handler avec la requête authentifiée
  return handler(authenticatedRequest);
}

/**
 * Vérifie si l'utilisateur est admin
 */
export function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Vérifie si l'utilisateur est super admin
 */
export function isSuperAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN';
}
