'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Save,
  X,
  Download
} from 'lucide-react';

interface ImportedData {
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
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function ImportPage() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragOverExcel, setIsDragOverExcel] = useState(false);
  const [isDragOverPdf, setIsDragOverPdf] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [decretInfo, setDecretInfo] = useState({
    id: '',
    numero: '',
    titre: '',
    description: ''
  });

  // Excel file handlers
  const handleDragOverExcel = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverExcel(true);
  }, []);

  const handleDragLeaveExcel = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverExcel(false);
  }, []);

  const handleDropExcel = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverExcel(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files.find(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')
    );
    
    if (file) {
      setExcelFile(file);
    }
  }, []);

  const handleExcelFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setExcelFile(selectedFile);
    }
  };

  // PDF file handlers
  const handleDragOverPdf = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPdf(true);
  }, []);

  const handleDragLeavePdf = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPdf(false);
  }, []);

  const handleDropPdf = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverPdf(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files.find(file => file.name.endsWith('.pdf'));
    
    if (file) {
      setPdfFile(file);
    }
  }, []);

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setPdfFile(selectedFile);
    }
  };

  const processFile = async () => {
    if (!excelFile || !pdfFile) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('excelFile', excelFile);
      formData.append('pdfFile', pdfFile);
      formData.append('numero', decretInfo.numero);
      formData.append('titre', decretInfo.titre);
      formData.append('description', decretInfo.description);

      const response = await fetch('/api/decrets/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Les données sont déjà formatées et triées par le backend
        setImportedData(result.data);
        setValidationErrors(result.errors || []);
        setCurrentStep('preview');
        
        // Stocker l'ID du décret pour la publication
        if (result.decret?.id) {
          setDecretInfo(prev => ({ ...prev, id: result.decret.id }));
        }
      } else {
        setValidationErrors(result.errors || []);
        setImportedData([]);
        setCurrentStep('preview');
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      setValidationErrors([{
        row: 0,
        field: 'general',
        message: 'Erreur lors du traitement du fichier'
      }]);
      setImportedData([]);
      setCurrentStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const publishDecret = async () => {
    if (!decretInfo.id) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/decrets/${decretInfo.id}/publish`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setCurrentStep('success');
      } else {
        console.error('Erreur lors de la publication:', result.error);
        // Afficher une erreur à l'utilisateur
        setValidationErrors([{
          row: 0,
          field: 'publication',
          message: 'Erreur lors de la publication du décret'
        }]);
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      setValidationErrors([{
        row: 0,
        field: 'publication',
        message: 'Erreur lors de la publication du décret'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setExcelFile(null);
    setPdfFile(null);
    setImportedData([]);
    setValidationErrors([]);
    setCurrentStep('upload');
    setDecretInfo({ id: '', numero: '', titre: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Import de Décret</h1>
                <p className="text-sm text-gray-600">Importez un fichier Excel d'affectations et le décret PDF signé</p>
              </div>
            </div>
            <Link 
              href="/ansi-admin"
              className="inline-flex items-center text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'upload' ? 'bg-blue-600 text-white' : 
                currentStep === 'preview' || currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Upload</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'preview' ? 'bg-blue-600 text-white' : 
                currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Prévisualisation</span>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Publication</span>
            </div>
          </div>
        </div>

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            {/* Decree Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du décret</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro du décret *
                  </label>
                  <input
                    type="text"
                    value={decretInfo.numero}
                    onChange={(e) => setDecretInfo({...decretInfo, numero: e.target.value})}
                    placeholder="Ex: Decret_2024_005"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du décret *
                  </label>
                  <input
                    type="text"
                    value={decretInfo.titre}
                    onChange={(e) => setDecretInfo({...decretInfo, titre: e.target.value})}
                    placeholder="Ex: Affectations Service Civique - Mai 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={decretInfo.description}
                  onChange={(e) => setDecretInfo({...decretInfo, description: e.target.value})}
                  placeholder="Description du décret..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Files Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Fichiers du décret</h3>
              
              {/* Excel/CSV File Section */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  1. Fichier des affectations (Excel ou CSV) *
                </h4>
                
                <div
                  onDragOver={handleDragOverExcel}
                  onDragLeave={handleDragLeaveExcel}
                  onDrop={handleDropExcel}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOverExcel 
                      ? 'border-blue-400 bg-blue-50' 
                      : excelFile 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {excelFile ? (
                    <div className="space-y-3">
                      <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
                      <div>
                        <p className="text-md font-medium text-gray-900">{excelFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(excelFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setExcelFile(null)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Supprimer le fichier
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-md font-medium text-gray-900">
                          Glissez-déposez votre fichier Excel ici
                        </p>
                        <p className="text-sm text-gray-600">ou cliquez pour sélectionner</p>
                      </div>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleExcelFileSelect}
                        className="hidden"
                        id="excel-upload"
                      />
                      <label
                        htmlFor="excel-upload"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Sélectionner fichier Excel/CSV
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF File Section */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Download className="h-5 w-5 mr-2 text-red-600" />
                  2. Décret officiel signé (PDF) *
                </h4>
                
                <div
                  onDragOver={handleDragOverPdf}
                  onDragLeave={handleDragLeavePdf}
                  onDrop={handleDropPdf}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOverPdf 
                      ? 'border-red-400 bg-red-50' 
                      : pdfFile 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {pdfFile ? (
                    <div className="space-y-3">
                      <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
                      <div>
                        <p className="text-md font-medium text-gray-900">{pdfFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setPdfFile(null)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Supprimer le fichier
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-md font-medium text-gray-900">
                          Glissez-déposez le décret PDF signé ici
                        </p>
                        <p className="text-sm text-gray-600">ou cliquez pour sélectionner</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfFileSelect}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Sélectionner décret PDF
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Expected Format */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">Format attendu Excel:</h4>
                  <a
                    href="/api/templates/download"
                    download="modele-import-affectations.xlsx"
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Télécharger le modèle
                  </a>
                </div>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Nom | Prénom(s) | Date de naissance | Lieu de naissance</p>
                  <p>• Diplôme | Lieu d'obtention du diplôme | Lieu d'affectation</p>
                  <p>• Numéro de décret</p>
                  <p className="font-medium mt-2">💡 Utilisez le modèle Excel ci-dessus pour un format parfait !</p>
                </div>
              </div>

              {excelFile && pdfFile && decretInfo.numero && decretInfo.titre && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={processFile}
                    disabled={isProcessing}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Prévisualiser
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Prévisualisation des données</h3>
                  <p className="text-sm text-gray-600">
                    {importedData.length} affectations trouvées
                    {validationErrors.length > 0 && (
                      <span className="text-red-600 ml-2">
                        • {validationErrors.length} erreur(s) détectée(s)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={resetImport}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Files Summary */}
              <div className="mb-6 grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium text-blue-900">Fichier Excel</p>
                      <p className="text-sm text-blue-800">{excelFile?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <p className="font-medium text-red-900">Décret PDF</p>
                      <p className="text-sm text-red-800">{pdfFile?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-2">Erreurs de validation:</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>
                            Ligne {error.row}: {error.field} - {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Preview */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom Complet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Naissance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Formation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Affectation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importedData.slice(0, 10).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.prenom} {item.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.dateNaissance).toLocaleDateString('fr-FR')} - {item.lieuNaissance}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.niveauDiplome} {item.specialite}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.institutionAffectation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importedData.length > 10 && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  ... et {importedData.length - 10} autres affectations
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={resetImport}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Recommencer
                </button>
                <button
                  onClick={publishDecret}
                  disabled={isProcessing || validationErrors.length > 0}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publication...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Publier le décret
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <div className="text-center">
            <div className="bg-white rounded-lg shadow p-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Décret publié avec succès!</h3>
              <p className="text-gray-600 mb-6">
                Le décret "{decretInfo.numero}" a été publié et est maintenant consultable par le public.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-green-800">
                  <p><strong>Décret:</strong> {decretInfo.numero}</p>
                  <p><strong>Titre:</strong> {decretInfo.titre}</p>
                  <p><strong>Affectations:</strong> {importedData.length}</p>
                  <p><strong>Fichier Excel:</strong> {excelFile?.name}</p>
                  <p><strong>Décret PDF:</strong> {pdfFile?.name}</p>
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/ansi-admin"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retour au tableau de bord
                </Link>
                <button
                  onClick={resetImport}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Importer un autre décret
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
