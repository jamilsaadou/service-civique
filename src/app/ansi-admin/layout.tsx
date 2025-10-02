'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, User } from 'lucide-react';

interface AdminUser {
  username: string;
  role: string;
  loginTime: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('ansi_admin_token');
      const userData = localStorage.getItem('ansi_admin_user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erreur lors du parsing des données utilisateur:', error);
          handleLogout();
        }
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    };

    checkAuthentication();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('ansi_admin_token');
    localStorage.removeItem('ansi_admin_user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  // Affichage du loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, ne rien afficher (la redirection est en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de navigation d'administration */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration ANSI</h1>
                <p className="text-sm text-gray-600">Panneau d'administration</p>
              </div>
            </div>
            
            {/* Informations utilisateur et déconnexion */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-4 w-4 mr-2" />
                <span>Connecté en tant que <strong>{user?.username}</strong></span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main>
        {children}
      </main>
    </div>
  );
}
