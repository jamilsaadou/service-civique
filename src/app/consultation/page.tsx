'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Shield, ArrowLeft, User, Calendar, MapPin, Building, FileText, AlertCircle, Download, Filter, X } from 'lucide-react';

interface Assignment {
  id: string;
  prenom: string;
  nom: string;
  dateNaissance: string;
  lieuNaissance: string;
  niveauDiplome: string;
  specialite: string;
  etablissement: string;
  institutionAffectation: string;
  numeroDecret: string;
  decret?: {
    id: string;
    numero: string;
    titre: string;
    datePublication: string;
    fichierPdf: string;
  };
}


export default function Consultation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Assignment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Real data states
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    nom: '',
    prenoms: '',
    dateNaissance: '',
    lieuNaissance: '',
    diplome: '',
    institution: ''
  });
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  
  // Autocomplete states
  const [lieuNaissanceSuggestions, setLieuNaissanceSuggestions] = useState<string[]>([]);
  const [institutionsList, setInstitutionsList] = useState<string[]>([]);
  const [diplomeSuggestions, setDiplomeSuggestions] = useState<string[]>([]);
  const [showLieuNaissanceDropdown, setShowLieuNaissanceDropdown] = useState(false);
  const [showDiplomeDropdown, setShowDiplomeDropdown] = useState(false);
  const lieuNaissanceRef = useRef<HTMLDivElement>(null);
  const diplomeRef = useRef<HTMLDivElement>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssignments, setTotalAssignments] = useState(0);
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load real data from API with pagination
  const loadAssignments = async (page?: number, limit?: number) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: (page || currentPage).toString(),
        limit: (limit || itemsPerPage).toString()
      });
      
      const response = await fetch(`/api/affectations?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        // Transform data to match our interface
        const transformedAssignments: Assignment[] = data.affectations.map((item: any) => ({
          id: item.id,
          prenom: item.prenoms, // Mapping prenoms -> prenom
          nom: item.nom,
          dateNaissance: item.dateNaissance,
          lieuNaissance: item.lieuNaissance,
          niveauDiplome: item.diplome || '', // Mapping diplome -> niveauDiplome avec fallback
          specialite: '', // Champ vide car non disponible dans les données backend
          etablissement: item.lieuObtentionDiplome || '', // Mapping lieuObtentionDiplome -> etablissement
          institutionAffectation: item.lieuAffectation || '', // Mapping lieuAffectation -> institutionAffectation
          numeroDecret: item.decret?.numero || '',
          decret: item.decret
        }));
        
        setAllAssignments(transformedAssignments);
        setFilteredAssignments(transformedAssignments);
        setTotalAssignments(data.total);
        setTotalPages(data.pages);
      } else {
        console.error('Erreur API:', data.error);
        setAllAssignments([]);
        setFilteredAssignments([]);
        setTotalAssignments(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setAllAssignments([]);
      setFilteredAssignments([]);
      setTotalAssignments(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger la liste des institutions au chargement
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const response = await fetch('/api/affectations/fields?field=institutionAffectation&q=');
        if (response.ok) {
          const data = await response.json();
          setInstitutionsList(data.results || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des institutions:', error);
      }
    };
    loadInstitutions();
  }, []);

  // Fermer les dropdowns quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (lieuNaissanceRef.current && !lieuNaissanceRef.current.contains(event.target as Node)) {
        setShowLieuNaissanceDropdown(false);
      }
      if (diplomeRef.current && !diplomeRef.current.contains(event.target as Node)) {
        setShowDiplomeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [currentPage, itemsPerPage]);

  // Gestionnaires de pagination
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset à la première page
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Filter functions - Recherche avec filtres avancés
  const handleAdvancedSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Construire les paramètres de recherche
      const params = new URLSearchParams();
      
      if (advancedFilters.nom) params.append('nom', advancedFilters.nom);
      if (advancedFilters.prenoms) params.append('prenoms', advancedFilters.prenoms);
      if (advancedFilters.dateNaissance) params.append('dateNaissance', advancedFilters.dateNaissance);
      if (advancedFilters.lieuNaissance) params.append('lieuNaissance', advancedFilters.lieuNaissance);
      if (advancedFilters.diplome) params.append('diplome', advancedFilters.diplome);
      if (advancedFilters.institution) params.append('institution', advancedFilters.institution);
      
      params.append('limit', '50');
      
      const response = await fetch(`/api/affectations/search?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Transformer les données pour correspondre à notre interface
        const transformedResults: Assignment[] = data.affectations.map((item: any) => ({
          id: item.id,
          prenom: item.prenoms,
          nom: item.nom,
          dateNaissance: item.dateNaissance,
          lieuNaissance: item.lieuNaissance,
          niveauDiplome: item.diplome || '',
          specialite: '',
          etablissement: item.lieuObtentionDiplome || '',
          institutionAffectation: item.lieuAffectation || '',
          numeroDecret: item.decret?.numero || '',
          decret: item.decret
        }));
        
        setSearchResults(transformedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    }
    
    setIsSearching(false);
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      nom: '',
      prenoms: '',
      dateNaissance: '',
      lieuNaissance: '',
      diplome: '',
      institution: ''
    });
  };

  // Fonction pour récupérer les suggestions depuis l'API
  const fetchSuggestions = useCallback(async (field: string, query: string) => {
    if (!query.trim() || query.length < 2) {
      switch (field) {
        case 'lieuNaissance':
          setLieuNaissanceSuggestions([]);
          break;
        case 'diplome':
          setDiplomeSuggestions([]);
          break;
      }
      return;
    }

    try {
      const response = await fetch(`/api/affectations/fields?field=${field}&q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        switch (field) {
          case 'lieuNaissance':
            setLieuNaissanceSuggestions(data.results || []);
            break;
          case 'diplome':
            setDiplomeSuggestions(data.results || []);
            break;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
    }
  }, []);

  const handleAdvancedFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...advancedFilters, [filterKey]: value };
    setAdvancedFilters(newFilters);
    
    // Appliquer le debouncing pour les champs avec autocomplétion
    if (filterKey === 'lieuNaissance' || filterKey === 'diplome') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        const fieldMap: { [key: string]: string } = {
          'lieuNaissance': 'lieuNaissance',
          'diplome': 'diplome'
        };
        fetchSuggestions(fieldMap[filterKey], value);
      }, 300);
    }
  };
  
  const handleSuggestionSelect = (filterKey: string, value: string) => {
    setAdvancedFilters({ ...advancedFilters, [filterKey]: value });
    setShowLieuNaissanceDropdown(false);
    setShowDiplomeDropdown(false);
  };

  // Get unique values for filter options
  const getUniqueInstitutions = () => [...new Set(allAssignments.map(a => a.institutionAffectation))];
  const getUniqueNiveauxDiplome = () => [...new Set(allAssignments.map(a => a.niveauDiplome))];
  const getUniqueSpecialites = () => [...new Set(allAssignments.map(a => a.specialite))];
  const getUniqueDecrets = () => [...new Set(allAssignments.map(a => a.numeroDecret))];
  const getUniqueLieuxNaissance = () => [...new Set(allAssignments.map(a => a.lieuNaissance))];

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      if (!searchTerm.trim()) {
        // Si aucun terme de recherche, afficher toutes les affectations
        setSearchResults(allAssignments);
        setIsSearching(false);
        return;
      }
      
      // Utiliser l'API de recherche des affectations
      const response = await fetch(`/api/affectations/search?q=${encodeURIComponent(searchTerm.trim())}&limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Transformer les données pour correspondre à notre interface
        const transformedResults: Assignment[] = data.affectations.map((item: any) => ({
          id: item.id,
          prenom: item.prenoms, // Mapping prenoms -> prenom
          nom: item.nom,
          dateNaissance: item.dateNaissance,
          lieuNaissance: item.lieuNaissance,
          niveauDiplome: item.diplome || '', // Mapping diplome -> niveauDiplome avec fallback
          specialite: '', // Champ vide car non disponible dans les données backend
          etablissement: item.lieuObtentionDiplome || '', // Mapping lieuObtentionDiplome -> etablissement
          institutionAffectation: item.lieuAffectation || '', // Mapping lieuAffectation -> institutionAffectation
          numeroDecret: item.decret?.numero || '',
          decret: item.decret
        }));
        
        setSearchResults(transformedResults);
      } else {
        // Fallback vers les données mockées en cas d'erreur API
        const results = allAssignments.filter(assignment => 
          assignment.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.prenom.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      // Fallback vers les données réelles chargées
      const results = allAssignments.filter(assignment => 
        assignment.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.prenom.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    }
    
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownloadDecree = (assignment: Assignment) => {
    if (assignment.decret?.id) {
      // Use the actual API endpoint with decree ID
      const link = document.createElement('a');
      link.href = `/api/decrets/${assignment.decret.id}/download`;
      link.download = `${assignment.numeroDecret}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For mock data or when no decree ID is available, try to find a matching decree
      // This allows testing the download functionality even with mock data
      const link = document.createElement('a');
      link.href = `/api/decrets/download-by-number?numero=${encodeURIComponent(assignment.numeroDecret)}`;
      link.download = `${assignment.numeroDecret}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image 
                src="/uploads/images/armoirie.png" 
                alt="République du Niger" 
                width={100} 
                height={100} 
                className="mr-4"
              />
              <h1 className="text-2xl font-bold text-gray-900">Service Civique National</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors">
                Accueil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Consultation des Affectations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Recherchez votre nom pour consulter votre affectation officielle au service civique national
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Nom, Prénom ou Institution d'affectation
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Entrez votre nom, prénom ou institution d'affectation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section - Always visible */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Filtres de recherche</h3>
              {hasSearched && (
                <span className="ml-3 text-sm text-green-600 font-medium">
                  (Filtres actifs)
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              {showFilters ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Masquer les filtres
                </>
              ) : (
                <>
                  <Filter className="mr-2 h-4 w-4" />
                  Afficher les filtres
                </>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Utilisez ces champs pour affiner votre recherche. Les filtres permettent de chercher par nom, prénom, date de naissance, lieu de naissance, diplôme et institution.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Nom Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={advancedFilters.nom}
                    onChange={(e) => handleAdvancedFilterChange('nom', e.target.value)}
                    placeholder="Ex: Diallo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Prénoms Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom(s)
                  </label>
                  <input
                    type="text"
                    value={advancedFilters.prenoms}
                    onChange={(e) => handleAdvancedFilterChange('prenoms', e.target.value)}
                    placeholder="Ex: Ahmed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Date de naissance Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de naissance ou année
                  </label>
                  <input
                    type="text"
                    value={advancedFilters.dateNaissance}
                    onChange={(e) => handleAdvancedFilterChange('dateNaissance', e.target.value)}
                    placeholder="Ex: 1995 ou 15/3/1995"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: AAAA ou JJ/MM/AAAA</p>
                </div>

                {/* Lieu de naissance Filter with Autocomplete */}
                <div ref={lieuNaissanceRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu de naissance
                  </label>
                  <input
                    type="text"
                    value={advancedFilters.lieuNaissance}
                    onChange={(e) => {
                      handleAdvancedFilterChange('lieuNaissance', e.target.value);
                      setShowLieuNaissanceDropdown(true);
                    }}
                    onFocus={() => {
                      if (lieuNaissanceSuggestions.length > 0) {
                        setShowLieuNaissanceDropdown(true);
                      }
                    }}
                    placeholder="Ex: Niamey"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {showLieuNaissanceDropdown && lieuNaissanceSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {lieuNaissanceSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionSelect('lieuNaissance', suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                        >
                          <MapPin className="inline h-3 w-3 mr-2 text-gray-400" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Tapez au moins 2 caractères pour des suggestions</p>
                </div>

                {/* Diplôme Filter with Autocomplete */}
                <div ref={diplomeRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diplôme
                  </label>
                  <input
                    type="text"
                    value={advancedFilters.diplome}
                    onChange={(e) => {
                      handleAdvancedFilterChange('diplome', e.target.value);
                      setShowDiplomeDropdown(true);
                    }}
                    onFocus={() => {
                      if (diplomeSuggestions.length > 0) {
                        setShowDiplomeDropdown(true);
                      }
                    }}
                    placeholder="Ex: Master, Licence"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {showDiplomeDropdown && diplomeSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {diplomeSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionSelect('diplome', suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                        >
                          <FileText className="inline h-3 w-3 mr-2 text-gray-400" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Tapez au moins 2 caractères pour des suggestions</p>
                </div>

                {/* Institution d'affectation Filter with Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution d'affectation
                  </label>
                  <select
                    value={advancedFilters.institution}
                    onChange={(e) => handleAdvancedFilterChange('institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">-- Toutes les institutions --</option>
                    {institutionsList.map((institution, index) => (
                      <option key={index} value={institution}>
                        {institution}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {hasSearched ? (
                    <span className="text-green-600 font-medium">
                      Recherche active • Modifiez les filtres et cliquez sur Rechercher pour mettre à jour
                    </span>
                  ) : (
                    'Remplissez un ou plusieurs champs puis cliquez sur Rechercher'
                  )}
                </div>
                <div className="flex space-x-2">
                  {hasSearched && (
                    <button
                      onClick={() => {
                        setHasSearched(false);
                        setSearchResults([]);
                        clearAdvancedFilters();
                      }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Nouvelle recherche
                    </button>
                  )}
                  <button
                    onClick={clearAdvancedFilters}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Effacer
                  </button>
                  <button
                    onClick={handleAdvancedSearch}
                    disabled={isSearching || Object.values(advancedFilters).every(v => !v.trim())}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {searchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <User className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                    </h3>
                  </div>
                  {/* Institutions d'affectation trouvées */}
                  <div className="text-sm text-gray-600">
                    {(() => {
                      const institutions = [...new Set(searchResults.map(r => r.institutionAffectation))];
                      return institutions.length > 1 ? 
                        `${institutions.length} institutions d'affectation` : 
                        `1 institution d'affectation`;
                    })()}
                  </div>
                </div>

                {/* Résumé des institutions d'affectation */}
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Institutions d'affectation correspondantes :
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(searchResults.map(r => r.institutionAffectation))].map((institution, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {institution}
                        <span className="ml-2 bg-green-200 text-green-900 rounded-full px-2 py-0.5 text-xs">
                          {searchResults.filter(r => r.institutionAffectation === institution).length}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {searchResults.map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">
                            {assignment.prenom} {assignment.nom}
                          </h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <FileText className="h-4 w-4 mr-1" />
                            Décret N° {assignment.numeroDecret}
                          </div>
                        </div>
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Affecté(e)
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">Né(e) le {new Date(assignment.dateNaissance).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">à {assignment.lieuNaissance}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">{assignment.niveauDiplome} en {assignment.specialite}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-700">
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-sm">Établissement: {assignment.etablissement}</span>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="font-medium text-orange-900 text-sm mb-1">Institution d'affectation:</div>
                            <div className="text-orange-800 font-semibold">{assignment.institutionAffectation}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Download Button */}
                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleDownloadDecree(assignment)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger le décret officiel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Aucune affectation n'a été trouvée pour "{searchTerm}". 
                  Vérifiez l'orthographe ou essayez avec un autre nom.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Conseils de recherche:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Vérifiez l'orthographe de votre nom</li>
                        <li>Essayez avec votre prénom uniquement</li>
                        <li>Assurez-vous que votre affectation a été publiée</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tableau des Affectations Publiées */}
        {!hasSearched && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Toutes les Affectations Publiées</h3>
                <p className="text-sm text-gray-600 mt-1">Liste complète des affectations officielles ({totalAssignments} au total)</p>
              </div>
              
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
                  {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalAssignments)} sur {totalAssignments}
                </div>
              </div>
            </div>
            
            {/* Version Tablette et Desktop - Tableau responsive */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Naissance
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formation
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Décret
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Statut
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PDF
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment, index) => {
                    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo', 'yellow', 'pink'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-2 py-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6 md:h-8 md:w-8">
                              <div className={`h-6 w-6 md:h-8 md:w-8 rounded-full bg-${color}-100 flex items-center justify-center`}>
                                <User className={`h-3 w-3 md:h-4 md:w-4 text-${color}-600`} />
                              </div>
                            </div>
                            <div className="ml-2">
                              <div className="text-xs md:text-sm font-medium text-gray-900">
                                {assignment.prenom} {assignment.nom}
                              </div>
                              <div className="text-xs text-gray-500 lg:hidden">
                                {new Date(assignment.dateNaissance).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 hidden lg:table-cell">
                          <div className="text-sm text-gray-900">{new Date(assignment.dateNaissance).toLocaleDateString('fr-FR')}</div>
                          <div className="text-xs text-gray-500">{assignment.lieuNaissance}</div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="text-xs md:text-sm text-gray-900" title={assignment.niveauDiplome}>
                            {assignment.niveauDiplome.length > 10 ? assignment.niveauDiplome.substring(0, 10) + '...' : assignment.niveauDiplome}
                          </div>
                          <div className="text-xs text-gray-500" title={assignment.specialite}>
                            {assignment.specialite.length > 12 ? assignment.specialite.substring(0, 12) + '...' : assignment.specialite}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="text-xs md:text-sm font-medium text-orange-900" title={assignment.institutionAffectation}>
                            {assignment.institutionAffectation.length > 15 ? assignment.institutionAffectation.substring(0, 15) + '...' : assignment.institutionAffectation}
                          </div>
                          <div className="text-xs text-gray-500 hidden lg:block" title={assignment.etablissement}>
                            {assignment.etablissement.length > 20 ? assignment.etablissement.substring(0, 20) + '...' : assignment.etablissement}
                          </div>
                        </td>
                        <td className="px-2 py-3 hidden xl:table-cell">
                          <div className="text-xs text-gray-900" title={assignment.numeroDecret}>
                            {assignment.numeroDecret}
                          </div>
                        </td>
                        <td className="px-2 py-3 hidden lg:table-cell">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Affecté
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <button
                            onClick={() => handleDownloadDecree(assignment)}
                            className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                            title="Télécharger le décret officiel"
                          >
                            <Download className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="ml-1 hidden md:inline">PDF</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Version Mobile - Cards */}
            <div className="md:hidden space-y-4">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {assignment.prenom} {assignment.nom}
                      </h4>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Affecté
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(assignment.dateNaissance).toLocaleDateString('fr-FR')} - {assignment.lieuNaissance}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {assignment.niveauDiplome} en {assignment.specialite}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Building className="h-4 w-4 mr-2" />
                      {assignment.etablissement}
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <div className="font-medium text-orange-900 text-xs">Institution d'affectation:</div>
                      <div className="text-orange-800 font-semibold text-sm">{assignment.institutionAffectation}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Décret: {assignment.numeroDecret}</span>
                    <button
                      onClick={() => handleDownloadDecree(assignment)}
                      className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredAssignments.length > 0 && totalPages > 1 && (
              <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
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
    </div>
  );
}
