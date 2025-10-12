'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building,
  Calendar,
  MapPin,
  FileText,
  Download,
  Loader,
  Search,
  Eye
} from 'lucide-react';
import { authGet } from '../../../lib/api-client';

interface StatistiquesGlobales {
  totalAffectations: number;
  totalDecrets: number;
  decretsPublies: number;
  nombreInstitutions: number;
  nombreLieuxNaissance: number;
  nombreDiplomes: number;
}

interface InstitutionStat {
  nom: string;
  nombreAffectations: number;
  pourcentage: string;
}

interface DiplomeStat {
  nom: string;
  nombreAffectations: number;
  pourcentage: string;
}

interface LieuNaissanceStat {
  nom: string;
  nombreAffectations: number;
}

interface RechercheParJour {
  jour: string;
  recherches: number;
}

interface RechercheParIP {
  adresseIp: string;
  nombreRecherches: number;
}

interface TermeRecherche {
  terme: string;
  count: number;
}

interface StatistiquesData {
  global: StatistiquesGlobales & {
    totalRecherches: number;
    totalConsultations: number;
  };
  parInstitution: InstitutionStat[];
  parDiplome: DiplomeStat[];
  parLieuNaissance: LieuNaissanceStat[];
  recherchesParJour: RechercheParJour[];
  recherchesParIP: RechercheParIP[];
  topTermesRecherche: TermeRecherche[];
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatistiquesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await authGet('/api/statistiques');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Erreur lors du chargement des statistiques');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Erreur inconnue'}</p>
          <button
            onClick={loadStatistics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const tauxPublication = stats.global.totalDecrets > 0
    ? ((stats.global.decretsPublies / stats.global.totalDecrets) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
                <p className="text-sm text-gray-600">Analysez les données de la plateforme</p>
              </div>
            </div>
            <Link 
              href="/ansi-admin"
              className="inline-flex items-center text-gray-700 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Affectations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.global.totalAffectations.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Publiées</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.global.decretsPublies}</p>
                <p className="text-sm text-green-600">
                  {tauxPublication}% du total
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
                <p className="text-sm font-medium text-gray-600">Institutions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.global.nombreInstitutions}</p>
                <p className="text-sm text-gray-500">Actives</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lieux de Naissance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.global.nombreLieuxNaissance}</p>
                <p className="text-sm text-gray-500">Régions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Institutions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Institutions</h3>
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.parInstitution.slice(0, 6).map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{stat.nom}</span>
                      <span className="text-gray-600">{stat.nombreAffectations}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stat.pourcentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recherches par jour */}
          {stats.recherchesParJour.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Activité de recherche</h3>
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {stats.recherchesParJour.slice(0, 6).map((stat, index) => {
                  const maxValue = Math.max(...stats.recherchesParJour.map(s => s.recherches));
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-900">{stat.jour}</span>
                          <span className="text-gray-600">{stat.recherches} recherches</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(stat.recherches / maxValue) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Activité de recherche</h3>
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center py-8">Aucune recherche enregistrée</p>
            </div>
          )}
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Diplomas Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Répartition par diplôme</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diplôme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.parDiplome.slice(0, 10).map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.nombreAffectations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.pourcentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regional Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Répartition par lieu de naissance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affectations
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.parLieuNaissance.slice(0, 10).map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{stat.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.nombreAffectations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 mr-3" />
              <div>
                <h4 className="text-lg font-semibold">Total Arrêtés</h4>
                <p className="text-blue-100">{stats.global.totalDecrets} arrêtés créés</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 mr-3" />
              <div>
                <h4 className="text-lg font-semibold">Taux de Publication</h4>
                <p className="text-green-100">{tauxPublication}% des arrêtés publiés</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center">
              <Users className="h-8 w-8 mr-3" />
              <div>
                <h4 className="text-lg font-semibold">Diplômes Variés</h4>
                <p className="text-purple-100">{stats.global.nombreDiplomes} niveaux différents</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
