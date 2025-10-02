'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Shield, 
  ArrowLeft, 
  FileText, 
  Calendar,
  Users,
  Download,
  Printer,
  Eye,
  Loader2
} from 'lucide-react';

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
}

interface Decret {
  id: string;
  numero: string;
  titre: string;
  description: string | null;
  dateCreation: string;
  datePublication: string | null;
  statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
  affectations: Affectation[];
}

export default function DecretDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [decret, setDecret] = useState<Decret | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDecret = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/decrets/${params.id}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du décret');
        }
        
        const data = await response.json();
        setDecret(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        console.error('Erreur lors du chargement du décret:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadDecret();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (decret) {
      const link = document.createElement('a');
      link.href = `/api/decrets/${decret.id}/download`;
      link.download = `${decret.numero}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du décret...</p>
        </div>
      </div>
    );
  }

  if (error || !decret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Décret non trouvé</h3>
          <p className="text-gray-600 mb-4">{error || 'Le décret demandé n\'existe pas.'}</p>
          <button
            onClick={() => router.push('/ansi-admin/decrets')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const datePublication = decret.datePublication 
    ? new Date(decret.datePublication).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Non publié';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - masqué à l'impression */}
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Visualisation du Décret</h1>
                <p className="text-sm text-gray-600">{decret.numero}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </button>
              <button
                onClick={() => router.push('/ansi-admin/decrets')}
                className="inline-flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu du décret */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-8 print:py-4">
        <div className="bg-white rounded-lg shadow-lg print:shadow-none print:rounded-none">
          <div className="p-8 print:p-4">
            {/* En-tête officiel */}
            <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
              <div className="text-lg font-bold mb-2">RÉPUBLIQUE DU NIGER</div>
              <div className="text-lg font-bold mb-2">MINISTÈRE DE LA JEUNESSE ET DES SPORTS</div>
              <div className="text-lg font-bold mb-4">AGENCE NATIONALE DU SERVICE CIVIQUE D'INTÉGRATION (ANSI)</div>
              
              <div className="text-2xl font-bold mt-6 mb-4 uppercase">{decret.titre}</div>
              <div className="text-xl font-bold">{decret.numero}</div>
            </div>

            {/* Informations du décret */}
            <div className="mb-8 print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Statut</p>
                      <p className="text-lg font-bold text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          decret.statut === 'PUBLIE' 
                            ? 'bg-green-100 text-green-800' 
                            : decret.statut === 'BROUILLON'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {decret.statut === 'PUBLIE' ? 'Publié' : 
                           decret.statut === 'BROUILLON' ? 'Brouillon' : 'Archivé'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Affectations</p>
                      <p className="text-lg font-bold text-gray-900">{decret.affectations.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Date de publication</p>
                      <p className="text-lg font-bold text-gray-900">{datePublication}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu officiel du décret */}
            <div className="space-y-6">
              <div className="mb-8">
                <p><strong>Date de publication :</strong> {datePublication}</p>
              </div>

              {decret.description && (
                <div className="mb-6">
                  <h3 className="font-bold mb-2">CONSIDÉRANT :</h3>
                  <p className="text-justify">{decret.description}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold mb-2">ARTICLE 1er :</h3>
                <p className="text-justify">
                  Sont affectés dans le cadre du Service Civique d'Intégration, les jeunes diplômés dont les noms suivent :
                </p>
              </div>

              {/* Tableau des affectations */}
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-800">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-800 px-3 py-2 text-left text-xs font-bold">N°</th>
                      <th className="border border-gray-800 px-3 py-2 text-left text-xs font-bold">Prénom et Nom</th>
                      <th className="border border-gray-800 px-3 py-2 text-left text-xs font-bold">Date de Naissance</th>
                      <th className="border border-gray-800 px-3 py-2 text-left text-xs font-bold">Lieu de Naissance</th>
                      <th className="border border-gray-800 px-3 py-2 text-left text-xs font-bold">Diplôme</th>
                      <th className="border border-gray-800 px-3 py-2 text-left text-xs font-bold">Établissement d'obtention</th>
                      <th className="border border-gray-800 px-3 py-2 text-left text-xs font-bold">Institution d'Affectation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decret.affectations.map((affectation, index) => (
                      <tr key={affectation.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                        <td className="border border-gray-800 px-3 py-2 text-sm">{index + 1}</td>
                        <td className="border border-gray-800 px-3 py-2 text-sm font-medium">
                          {affectation.prenoms} {affectation.nom}
                        </td>
                        <td className="border border-gray-800 px-3 py-2 text-sm">
                          {new Date(affectation.dateNaissance).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="border border-gray-800 px-3 py-2 text-sm">{affectation.lieuNaissance}</td>
                        <td className="border border-gray-800 px-3 py-2 text-sm">{affectation.diplome}</td>
                        <td className="border border-gray-800 px-3 py-2 text-sm">{affectation.lieuObtentionDiplome}</td>
                        <td className="border border-gray-800 px-3 py-2 text-sm">{affectation.lieuAffectation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="font-bold mb-2">ARTICLE 2 :</h3>
                  <p className="text-justify">
                    Les intéressés sont tenus de rejoindre leur poste d'affectation dans un délai de quinze (15) jours à compter de la date de signature du présent décret.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold mb-2">ARTICLE 3 :</h3>
                  <p className="text-justify">
                    Le présent décret sera publié au Journal Officiel de la République du Niger.
                  </p>
                </div>
              </div>

              {/* Signature */}
              <div className="mt-12 text-right">
                <p className="mb-8">Fait à Niamey, le {datePublication}</p>
                <div className="mb-8">
                  <p className="font-bold">Le Directeur Général de l'ANSI</p>
                </div>
                <div className="mt-16">
                  <p>_________________________</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'impression */}
      <style jsx global>{`
        @media print {
          body { 
            margin: 0; 
            font-size: 12px;
          }
          .print\\:hidden { 
            display: none !important; 
          }
          .print\\:shadow-none { 
            box-shadow: none !important; 
          }
          .print\\:rounded-none { 
            border-radius: 0 !important; 
          }
          .print\\:px-8 { 
            padding-left: 2rem !important; 
            padding-right: 2rem !important; 
          }
          .print\\:py-4 { 
            padding-top: 1rem !important; 
            padding-bottom: 1rem !important; 
          }
          .print\\:p-4 { 
            padding: 1rem !important; 
          }
          .print\\:hover\\:bg-transparent:hover { 
            background-color: transparent !important; 
          }
        }
      `}</style>
    </div>
  );
}
