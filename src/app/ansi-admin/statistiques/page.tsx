'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Search,
  Building,
  Calendar,
  MapPin,
  Eye,
  Download
} from 'lucide-react';

interface SearchStat {
  terme: string;
  nombreRecherches: number;
  pourcentage: number;
}

interface InstitutionStat {
  nom: string;
  nombreAffectations: number;
  pourcentage: number;
}

interface RegionStat {
  nom: string;
  nombreAffectations: number;
  nombreRecherches: number;
}

interface MonthlyStats {
  mois: string;
  recherches: number;
  affectationsTrouvees: number;
}

// Mock data
const mockSearchStats: SearchStat[] = [
  { terme: 'Dupont', nombreRecherches: 45, pourcentage: 12.5 },
  { terme: 'Martin', nombreRecherches: 38, pourcentage: 10.6 },
  { terme: 'Diallo', nombreRecherches: 32, pourcentage: 8.9 },
  { terme: 'Ahmed', nombreRecherches: 28, pourcentage: 7.8 },
  { terme: 'Marie', nombreRecherches: 25, pourcentage: 6.9 },
  { terme: 'Jean', nombreRecherches: 22, pourcentage: 6.1 },
  { terme: 'Ibrahim', nombreRecherches: 20, pourcentage: 5.6 },
  { terme: 'Fatima', nombreRecherches: 18, pourcentage: 5.0 },
  { terme: 'Moussa', nombreRecherches: 16, pourcentage: 4.4 },
  { terme: 'Aisha', nombreRecherches: 14, pourcentage: 3.9 }
];

const mockInstitutionStats: InstitutionStat[] = [
  { nom: 'Ministère de la Défense', nombreAffectations: 85, pourcentage: 31.5 },
  { nom: 'Ministère de l\'Intérieur', nombreAffectations: 62, pourcentage: 23.0 },
  { nom: 'Ministère des Infrastructures', nombreAffectations: 48, pourcentage: 17.8 },
  { nom: 'Ministère de l\'Éducation', nombreAffectations: 35, pourcentage: 13.0 },
  { nom: 'Ministère de la Santé', nombreAffectations: 25, pourcentage: 9.3 },
  { nom: 'Ministère de l\'Agriculture', nombreAffectations: 15, pourcentage: 5.6 }
];

const mockRegionStats: RegionStat[] = [
  { nom: 'Niamey', nombreAffectations: 120, nombreRecherches: 450 },
  { nom: 'Zinder', nombreAffectations: 45, nombreRecherches: 180 },
  { nom: 'Maradi', nombreAffectations: 38, nombreRecherches: 165 },
  { nom: 'Tahoua', nombreAffectations: 32, nombreRecherches: 140 },
  { nom: 'Agadez', nombreAffectations: 20, nombreRecherches: 95 },
  { nom: 'Dosso', nombreAffectations: 15, nombreRecherches: 85 }
];

const mockMonthlyStats: MonthlyStats[] = [
  { mois: 'Jan 2024', recherches: 890, affectationsTrouvees: 756 },
  { mois: 'Fév 2024', recherches: 1120, affectationsTrouvees: 952 },
  { mois: 'Mar 2024', recherches: 1350, affectationsTrouvees: 1148 },
  { mois: 'Avr 2024', recherches: 1250, affectationsTrouvees: 1063 },
  { mois: 'Mai 2024', recherches: 1180, affectationsTrouvees: 1003 },
  { mois: 'Jun 2024', recherches: 1420, affectationsTrouvees: 1207 }
];

export default function StatisticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const totalSearches = mockSearchStats.reduce((sum, stat) => sum + stat.nombreRecherches, 0);
  const totalAssignments = mockInstitutionStats.reduce((sum, stat) => sum + stat.nombreAffectations, 0);
  const totalRegionSearches = mockRegionStats.reduce((sum, stat) => sum + stat.nombreRecherches, 0);

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
                <p className="text-sm text-gray-600">Analysez l'utilisation de la plateforme</p>
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
        {/* Period Selector */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Analyse des données</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="1month">Dernier mois</option>
              <option value="3months">3 derniers mois</option>
              <option value="6months">6 derniers mois</option>
              <option value="1year">Dernière année</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recherches</p>
                <p className="text-2xl font-bold text-gray-900">{totalRegionSearches.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% ce mois
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Affectations Trouvées</p>
                <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% ce mois
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taux de Succès</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((totalAssignments / totalRegionSearches) * 100)}%
                </p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3% ce mois
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
                <p className="text-2xl font-bold text-gray-900">{mockInstitutionStats.length}</p>
                <p className="text-sm text-gray-500">Toutes actives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Évolution mensuelle</h3>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockMonthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{stat.mois}</span>
                      <span className="text-gray-600">{stat.recherches} recherches</span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stat.recherches / 1500) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Institutions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Institutions les plus demandées</h3>
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockInstitutionStats.slice(0, 5).map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{stat.nom}</span>
                      <span className="text-gray-600">{stat.nombreAffectations} affectations</span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
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
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Searches */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recherches les plus fréquentes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terme recherché
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
                  {mockSearchStats.slice(0, 8).map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.terme}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.nombreRecherches}
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
              <h3 className="text-lg font-semibold text-gray-900">Statistiques par région</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Région
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affectations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recherches
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockRegionStats.map((stat, index) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.nombreRecherches}
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
                <h4 className="text-lg font-semibold">Pic d'activité</h4>
                <p className="text-orange-100">Mars 2024 - 1,350 recherches</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 mr-3" />
              <div>
                <h4 className="text-lg font-semibold">Croissance</h4>
                <p className="text-green-100">+15% par rapport au trimestre précédent</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center">
              <Users className="h-8 w-8 mr-3" />
              <div>
                <h4 className="text-lg font-semibold">Satisfaction</h4>
                <p className="text-purple-100">85% des recherches aboutissent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
