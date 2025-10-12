'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  ArrowLeft, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  Loader2
} from 'lucide-react';
import { authGet, authPost, authDelete } from '../../../lib/api-client';

interface Decree {
  id: string;
  numero: string;
  titre: string;
  description: string | null;
  dateCreation: string;
  datePublication: string | null;
  statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
  fichierPdf: string | null;
  fichierExcel: string | null;
  _count: {
    affectations: number;
  };
  affectations: {
    institutionAffectation: string;
  }[];
}

interface DecreesResponse {
  decrets: Decree[];
  total: number;
  pages: number;
  currentPage: number;
}

export default function DecreesPage() {
  const [decrees, setDecrees] = useState<Decree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'publie' | 'brouillon'>('all');
  const [selectedDecree, setSelectedDecree] = useState<Decree | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  // Fonction pour charger les décrets depuis l'API
  const loadDecrees = async (search?: string, status?: string, page?: number, limit?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: (limit || itemsPerPage).toString(),
        page: (page || currentPage).toString()
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      if (status && status !== 'all') {
        params.append('status', status);
      }
      
      const response = await authGet(`/api/decrets?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des décrets');
      }
      
      const data: DecreesResponse = await response.json();
      setDecrees(data.decrets);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors du chargement des décrets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les décrets au montage du composant
  useEffect(() => {
    loadDecrees();
  }, []);

  // Recharger les décrets quand les filtres ou la pagination changent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDecrees(searchTerm, statusFilter, currentPage, itemsPerPage);
    }, 300); // Debounce de 300ms pour éviter trop de requêtes

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, currentPage, itemsPerPage]);

  // Gestionnaires de pagination
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset à la première page
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const filteredDecrees = decrees; // Plus besoin de filtrage côté client

  const handleDeleteDecree = (decree: Decree) => {
    setSelectedDecree(decree);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDecree) return;
    
    try {
      const response = await authDelete(`/api/decrets/${selectedDecree.id}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      // Recharger les décrets après suppression
      await loadDecrees();
      setShowDeleteModal(false);
      setSelectedDecree(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      // Vous pourriez ajouter une notification d'erreur ici
    }
  };

  const handlePublishDecree = async (decree: Decree) => {
    try {
      const response = await authPost(`/api/decrets/${decree.id}/publish`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la publication');
      }
      
      // Recharger les décrets après publication
      await loadDecrees();
    } catch (err) {
      console.error('Erreur lors de la publication:', err);
      // Vous pourriez ajouter une notification d'erreur ici
    }
  };

  const handleDownloadDecree = (decree: Decree) => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = `/api/decrets/${decree.id}/download`; // This would be the actual API endpoint
    link.download = `${decree.numero}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Arrêtés</h1>
                <p className="text-sm text-gray-600">Consultez et gérez tous les arrêtés</p>
              </div>
            </div>
            <Link 
              href="/ansi-admin"
              className="inline-flex items-center text-gray-700 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un arrêté..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'publie' | 'brouillon')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="publie">Publiés</option>
                <option value="brouillon">Brouillons</option>
              </select>
            </div>
          </div>

          <Link
            href="/ansi-admin/import"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau arrêté
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Arrêtés</p>
                <p className="text-xl font-bold text-gray-900">{loading ? '...' : total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Publiés</p>
                <p className="text-xl font-bold text-gray-900">
                  {loading ? '...' : decrees.filter(d => d.statut === 'PUBLIE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Brouillons</p>
                <p className="text-xl font-bold text-gray-900">
                  {loading ? '...' : decrees.filter(d => d.statut === 'BROUILLON').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Affectations</p>
                <p className="text-xl font-bold text-gray-900">
                  {loading ? '...' : decrees.reduce((sum, d) => sum + d._count.affectations, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mr-3" />
              <span className="text-gray-600">Chargement des arrêtés...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button 
                  onClick={() => loadDecrees()}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Decrees Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900">
                Liste des arrêtés ({total} au total)
              </h3>
              
              {/* Items per page selector */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Afficher:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">par page</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, total)} sur {total}
                </div>
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
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affectations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Institutions d'Affectation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDecrees.map((decree) => (
                    <tr key={decree.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{decree.numero}</div>
                          <div className="text-sm text-gray-500">{decree.titre}</div>
                          {decree.description && (
                            <div className="text-xs text-gray-400 mt-1">{decree.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          decree.statut === 'PUBLIE' 
                            ? 'bg-green-100 text-green-800' 
                            : decree.statut === 'BROUILLON'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {decree.statut === 'PUBLIE' ? 'Publié' : 
                           decree.statut === 'BROUILLON' ? 'Brouillon' : 'Archivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {decree._count.affectations}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {decree.affectations && decree.affectations.length > 0 ? (
                            <div className="space-y-1">
                              {decree.affectations.slice(0, 3).map((affectation, index) => (
                                <div key={index} className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded-full inline-block mr-1 mb-1">
                                  {affectation.institutionAffectation}
                                </div>
                              ))}
                              {decree.affectations.length > 3 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  +{decree.affectations.length - 3} autres...
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Aucune institution</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <div>
                            <div>Créé: {new Date(decree.dateCreation).toLocaleDateString('fr-FR')}</div>
                            {decree.datePublication && (
                              <div>Publié: {new Date(decree.datePublication).toLocaleDateString('fr-FR')}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/ansi-admin/decrets/${decree.id}`}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => handleDownloadDecree(decree)}
                            disabled={!decree.fichierPdf}
                            className={`transition-colors ${
                              decree.fichierPdf 
                                ? 'text-green-600 hover:text-green-900' 
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={decree.fichierPdf ? "Télécharger l'arrêté PDF" : "Aucun fichier PDF disponible"}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {decree.statut === 'BROUILLON' && (
                            <button 
                              onClick={() => handlePublishDecree(decree)}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                              title="Publier l'arrêté"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDecree(decree)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDecrees.length === 0 && !loading && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun arrêté trouvé</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Aucun arrêté ne correspond à vos critères de recherche.'
                    : 'Commencez par importer votre premier arrêté.'
                  }
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredDecrees.length > 0 && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-sm text-gray-600">
                  Page {currentPage} sur {totalPages}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedDecree && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Supprimer l'arrêté</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir supprimer l'arrêté "{selectedDecree.numero}" ?
                  Cette action est irréversible.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
