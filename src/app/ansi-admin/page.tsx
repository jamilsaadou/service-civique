'use client';

import { useState } from 'react';
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
  Search
} from 'lucide-react';

interface Decree {
  id: string;
  numero: string;
  titre: string;
  dateCreation: string;
  statut: 'brouillon' | 'publie';
  nombreAffectations: number;
}

interface Stats {
  totalAffectations: number;
  totalDecrets: number;
  recherchesMois: number;
  institutionsActives: number;
}

// Mock data
const mockDecrees: Decree[] = [
  {
    id: '1',
    numero: 'Decret_2024_003',
    titre: 'Affectations Service Civique - Promotion Mars 2024',
    dateCreation: '2024-03-15',
    statut: 'publie',
    nombreAffectations: 150
  },
  {
    id: '2',
    numero: 'Decret_2024_002',
    titre: 'Affectations Service Civique - Promotion Février 2024',
    dateCreation: '2024-02-20',
    statut: 'publie',
    nombreAffectations: 120
  },
  {
    id: '3',
    numero: 'Decret_2024_004',
    titre: 'Affectations Service Civique - Promotion Avril 2024',
    dateCreation: '2024-04-10',
    statut: 'brouillon',
    nombreAffectations: 0
  }
];

const mockStats: Stats = {
  totalAffectations: 270,
  totalDecrets: 3,
  recherchesMois: 1250,
  institutionsActives: 15
};

export default function AdminDashboard() {
  const [decrees] = useState<Decree[]>(mockDecrees);
  const [stats] = useState<Stats>(mockStats);

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
                <p className="text-2xl font-bold text-gray-900">{stats.totalAffectations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Décrets Publiés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDecrets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recherches ce mois</p>
                <p className="text-2xl font-bold text-gray-900">1,250</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.institutionsActives}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link 
            href="/ansi-admin/import"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Importer un décret</h3>
            </div>
            <p className="text-gray-600">Importez un nouveau fichier Excel d'affectations</p>
          </Link>

          <Link 
            href="/ansi-admin/decrets"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Gérer les décrets</h3>
            </div>
            <p className="text-gray-600">Consultez et modifiez les décrets existants</p>
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
        </div>

        {/* Recent Decrees */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Décrets récents</h3>
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
                    Décret
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
                {decrees.map((decree) => (
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
                        decree.statut === 'publie' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {decree.statut === 'publie' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {decree.nombreAffectations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-orange-600 hover:text-orange-900 mr-3">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Liste des Affectations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Liste des Affectations Récentes</h3>
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
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Jean Dupont</div>
                        <div className="text-sm text-gray-500">ID: 001</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">15/03/1995</div>
                    <div className="text-sm text-gray-500">Paris</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Master</div>
                    <div className="text-sm text-gray-500">Informatique</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-900">Ministère de la Défense</div>
                    <div className="text-sm text-gray-500">Université de Paris</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Decret_2024_003
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Affecté
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Marie Martin</div>
                        <div className="text-sm text-gray-500">ID: 002</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">22/07/1996</div>
                    <div className="text-sm text-gray-500">Lyon</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Licence</div>
                    <div className="text-sm text-gray-500">Administration</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-900">Ministère de l'Intérieur</div>
                    <div className="text-sm text-gray-500">Université Lyon 2</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Decret_2024_003
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Affecté
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Ahmed Diallo</div>
                        <div className="text-sm text-gray-500">ID: 003</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">08/11/1994</div>
                    <div className="text-sm text-gray-500">Niamey</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Master</div>
                    <div className="text-sm text-gray-500">Génie Civil</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-900">Ministère des Infrastructures</div>
                    <div className="text-sm text-gray-500">Université Abdou Moumouni</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Decret_2024_003
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Affecté
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Fatima Ibrahim</div>
                        <div className="text-sm text-gray-500">ID: 004</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">12/05/1997</div>
                    <div className="text-sm text-gray-500">Zinder</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Licence</div>
                    <div className="text-sm text-gray-500">Médecine</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-900">Ministère de la Santé</div>
                    <div className="text-sm text-gray-500">Université de Zinder</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Decret_2024_002
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Affecté
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Moussa Garba</div>
                        <div className="text-sm text-gray-500">ID: 005</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">30/09/1995</div>
                    <div className="text-sm text-gray-500">Maradi</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Master</div>
                    <div className="text-sm text-gray-500">Agriculture</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-900">Ministère de l'Agriculture</div>
                    <div className="text-sm text-gray-500">Université de Maradi</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Decret_2024_002
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Affecté
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
