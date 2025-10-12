'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  FileText, 
  Upload, 
  BarChart3, 
  Users, 
  Eye, 
  Plus, 
  Calendar,
  TrendingUp,
  Building,
  Search,
  Loader,
  Activity
} from 'lucide-react';

interface Decree {
  id: string;
  numero: string;
  titre: string;
  dateCreation: string;
  statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
  _count?: {
    affectations: number;
  };
}

interface Affectation {
  id: string;
  prenoms: string;
  nom: string;
  dateNaissance: string;
  lieuNaissance: string;
  diplome: string;
  lieuObtentionDiplome: string;
  lieuAffectation: string;
  numeroDecret: string;
  decret?: {
    numero: string;
  };
}

interface Stats {
  totalAffectations: number;
  totalDecrets: number;
  decretsPublies: number;
  nombreInstitutions: number;
}

export default function AdminDashboard() {
  const [decrees, setDecrees] = useState<Decree[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les statistiques
      const statsResponse = await fetch('/api/statistiques');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.global);
      }

      // Charger les décrets récents
      const decretsResponse = await fetch('/api/decrets?page=1&limit=5');
      if (decretsResponse.ok) {
        const decretsData = await decretsResponse.json();
        setDecrees(decretsData.decrets);
      }

      // Charger les affectations récentes
      const affectationsResponse = await fetch('/api/affectations?page=1&limit=5');
      if (affectationsResponse.ok) {
        const affectationsData = await affectationsResponse.json();
        setAffectations(affectationsData.affectations);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h2>
          <p className="text-gray-600">Gérez les décrets et consultez les statistiques de la plateforme</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Affectations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalAffectations.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Arrêtés Publiés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.decretsPublies || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Arrêtés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalDecrets || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Institutions Actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.nombreInstitutions || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link 
            href="/ansi-admin/import"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Importer un arrêté</h3>
            </div>
            <p className="text-gray-600">Importez un nouveau fichier Excel d'affectations</p>
          </Link>

          <Link 
            href="/ansi-admin/decrets"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Gérer les arrêtés</h3>
            </div>
            <p className="text-gray-600">Consultez et modifiez les arrêtés existants</p>
          </Link>

          <Link 
            href="/ansi-admin/statistiques"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Statistiques</h3>
            </div>
            <p className="text-gray-600">Analysez les données d'utilisation de la plateforme</p>
          </Link>

          <Link 
            href="/ansi-admin/logs"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Logs d'activité</h3>
            </div>
            <p className="text-gray-600">Consultez l'historique des activités et des appareils</p>
          </Link>
        </div>

        {/* Recent Decrees */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Arrêtés récents</h3>
              <Link 
                href="/ansi-admin/decrets"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Voir tout
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrêté
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affectations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {decrees.length > 0 ? (
                  decrees.map((decree) => (
                    <tr key={decree.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{decree.numero}</div>
                          <div className="text-sm text-gray-500">{decree.titre}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(decree.dateCreation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          decree.statut === 'PUBLIE' 
                            ? 'bg-green-100 text-green-800' 
                            : decree.statut === 'BROUILLON'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {decree.statut === 'PUBLIE' ? 'Publié' : decree.statut === 'BROUILLON' ? 'Brouillon' : 'Archivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {decree._count?.affectations || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          href={`/ansi-admin/decrets/${decree.id}`}
                          className="text-orange-600 hover:text-orange-900 mr-3"
                        >
                          <Eye className="h-4 w-4 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucun arrêté disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Liste des Affectations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Affectations Récentes</h3>
              <Link 
                href="/consultation"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Voir toutes les affectations
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom Complet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de Naissance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution d'Affectation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Décret
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {affectations.length > 0 ? (
                  affectations.map((affectation, index) => {
                    const colors = ['green', 'purple', 'orange', 'red', 'blue'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <tr key={affectation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
                                <Users className={`h-5 w-5 text-${color}-600`} />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {affectation.prenoms} {affectation.nom}
                              </div>
                              <div className="text-sm text-gray-500">ID: {affectation.id.substring(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(affectation.dateNaissance).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-500">{affectation.lieuNaissance}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{affectation.diplome}</div>
                          <div className="text-sm text-gray-500">
                            {affectation.lieuObtentionDiplome.length > 20 
                              ? affectation.lieuObtentionDiplome.substring(0, 20) + '...'
                              : affectation.lieuObtentionDiplome}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-orange-900">
                            {affectation.lieuAffectation.length > 25
                              ? affectation.lieuAffectation.substring(0, 25) + '...'
                              : affectation.lieuAffectation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {affectation.decret?.numero || affectation.numeroDecret}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Affecté
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Aucune affectation disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
