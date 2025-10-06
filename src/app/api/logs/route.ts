import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { withAuth } from '../../../lib/auth-middleware';

// Fonction pour extraire les informations de l'appareil depuis le User-Agent
function extractDeviceInfo(userAgent: string): { deviceType: string; deviceName: string } {
  const ua = userAgent.toLowerCase();
  
  // Détection du type d'appareil
  let deviceType = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
    deviceType = 'Tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone/i.test(userAgent)) {
    deviceType = 'Mobile';
  }
  
  // Détection du navigateur/système
  let deviceName = 'Inconnu';
  
  // Navigateurs
  if (ua.includes('edg/') || ua.includes('edge/')) {
    deviceName = 'Microsoft Edge';
  } else if (ua.includes('chrome/') && !ua.includes('edg/')) {
    deviceName = 'Google Chrome';
  } else if (ua.includes('safari/') && !ua.includes('chrome/')) {
    deviceName = 'Safari';
  } else if (ua.includes('firefox/')) {
    deviceName = 'Mozilla Firefox';
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    deviceName = 'Opera';
  }
  
  // Systèmes d'exploitation
  if (ua.includes('windows')) {
    deviceName += ' (Windows)';
  } else if (ua.includes('mac os')) {
    deviceName += ' (MacOS)';
  } else if (ua.includes('linux')) {
    deviceName += ' (Linux)';
  } else if (ua.includes('android')) {
    deviceName += ' (Android)';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    deviceName += ' (iOS)';
  }
  
  return { deviceType, deviceName };
}

// Enregistrer un log d'activité
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, description, decretId, metadonnees } = body;
    
    // Récupérer les informations de la requête
    const adresseIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'Non disponible';
    const userAgent = request.headers.get('user-agent') || 'Non disponible';
    
    // Extraire les informations de l'appareil
    const { deviceType, deviceName } = extractDeviceInfo(userAgent);
    
    const log = await prisma.logActivite.create({
      data: {
        action,
        description,
        adresseIp,
        userAgent,
        deviceType,
        deviceName,
        decretId,
        metadonnees: metadonnees ? JSON.parse(JSON.stringify(metadonnees)) : undefined
      }
    });
    
    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Erreur lors de la création du log:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du log' },
      { status: 500 }
    );
  }
}

// Récupérer les logs d'activité (protégé - admin seulement)
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const action = searchParams.get('action');
      const limit = parseInt(searchParams.get('limit') || '100');
      
      const where = action ? { action } : {};
      
      const logs = await prisma.logActivite.findMany({
        where,
        orderBy: { dateCreation: 'desc' },
        take: limit
      });
      
      return NextResponse.json({ logs });
    } catch (error) {
      console.error('Erreur lors de la récupération des logs:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des logs' },
        { status: 500 }
      );
    }
  }, {
    requiredRole: ['ADMIN', 'SUPER_ADMIN']
  });
}
