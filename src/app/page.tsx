import Link from 'next/link';
import Image from 'next/image';
import { Search, Users, FileText, Shield, ArrowRight, CheckCircle, Clock, Award, Heart, Globe, BookOpen, Target } from 'lucide-react';

export default function Home() {
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
                width={102} 
                height={102} 
                className="mr-3"
              />
              <h1 className="text-2xl font-bold text-gray-900">Service Civique National</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/consultation" className="text-gray-700 hover:text-orange-600 transition-colors">
                Consulter les affectations
              </Link>
              <Link href="/login" className="flex items-center text-gray-700 hover:text-orange-600 transition-colors">
                <Shield className="h-4 w-4 mr-1" />
                Administration
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Plateforme d'Information
              <span className="block text-orange-600">Service Civique National</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Consultez facilement vos affectations officielles au service civique national. 
              Une plateforme moderne et sécurisée pour tous les appelés.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/consultation"
                className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                Consulter mes affectations
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="#info"
                className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border border-orange-200"
              >
                <FileText className="mr-2 h-5 w-5" />
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="info" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ça fonctionne ?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un processus simple et transparent pour consulter vos affectations officielles
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Publication des décrets
              </h4>
              <p className="text-gray-600">
                Les ministères publient officiellement les listes d'affectation via des décrets validés
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Recherche personnalisée
              </h4>
              <p className="text-gray-600">
                Recherchez votre nom dans les listes publiées pour connaître votre affectation
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Information officielle
              </h4>
              <p className="text-gray-600">
                Accédez à vos informations d'affectation officielles et vérifiées
              </p>
            </div>
          </div>
        </div>
      </section>

    
      {/* Objectives Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">
              Objectifs du Service Civique National
            </h3>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Le Service Civique National vise à renforcer la cohésion nationale et à offrir aux jeunes 
              une expérience d'engagement citoyen enrichissante.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Target className="h-12 w-12 text-white mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">
                Renforcer la cohésion nationale
              </h4>
              <p className="text-orange-100">
                Favoriser le brassage social et culturel entre jeunes de différents horizons
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Users className="h-12 w-12 text-white mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">
                Développer la citoyenneté
              </h4>
              <p className="text-orange-100">
                Sensibiliser les jeunes aux enjeux de société et développer leur esprit civique
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Award className="h-12 w-12 text-white mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">
                Favoriser l'insertion professionnelle
              </h4>
              <p className="text-orange-100">
                Offrir une première expérience professionnelle valorisante et formatrice
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Les avantages du Service Civique
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une expérience enrichissante qui vous apporte bien plus qu'une simple mission
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="bg-green-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Expérience professionnelle
              </h4>
              <p className="text-gray-600">
                Acquérez des compétences professionnelles valorisables sur le marché du travail
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="bg-green-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Réseau professionnel
              </h4>
              <p className="text-gray-600">
                Développez votre réseau et créez des liens durables avec des professionnels
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="bg-purple-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Formation continue
              </h4>
              <p className="text-gray-600">
                Bénéficiez de formations complémentaires et de développement personnel
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <div className="bg-orange-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Engagement citoyen
              </h4>
              <p className="text-gray-600">
                Participez activement au développement de votre communauté et de votre pays
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
              <div className="bg-red-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Flexibilité
              </h4>
              <p className="text-gray-600">
                Horaires adaptés permettant de concilier mission et projets personnels
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
              <div className="bg-indigo-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Protection sociale
              </h4>
              <p className="text-gray-600">
                Couverture sociale complète pendant toute la durée de votre mission
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Conditions d'éligibilité
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Pour participer au Service Civique National, vous devez remplir certaines conditions.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Âge et nationalité</h5>
                    <p className="text-gray-600">Être âgé de 18 à 25 ans et de nationalité nigérienne</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Niveau d'études</h5>
                    <p className="text-gray-600">Être titulaire au minimum d'un diplôme de licence (Bac+3)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Motivation</h5>
                    <p className="text-gray-600">Démontrer une réelle motivation pour servir l'intérêt général</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Disponibilité</h5>
                    <p className="text-gray-600">Être disponible pour un engagement de 6 à 12 mois</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">
                Domaines d'intervention
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Sécurité</span>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Santé</span>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Éducation</span>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Globe className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Environnement</span>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Users className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Social</span>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Target className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-900">Développement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Processus d'affectation
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les étapes du processus d'affectation au Service Civique National
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Candidature
              </h4>
              <p className="text-gray-600">
                Soumission du dossier de candidature avec pièces justificatives
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Évaluation
              </h4>
              <p className="text-gray-600">
                Examen des dossiers et évaluation des profils par les commissions
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Affectation
              </h4>
              <p className="text-gray-600">
                Attribution des postes selon les compétences et les besoins des institutions
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Publication
              </h4>
              <p className="text-gray-600">
                Publication officielle des affectations par décret ministériel
              </p>
            </div>
          </div>
        </div>
      </section>

      
      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Prêt à consulter vos affectations ?
          </h3>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Accédez rapidement à vos informations d'affectation officielles
          </p>
          <Link 
            href="/consultation"
            className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Search className="mr-2 h-5 w-5" />
            Commencer la recherche
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                  <Image 
                    src="/uploads/images/armoirieblanc.png" 
                    alt="République du Niger" 
                    width={78} 
                    height={78} 
                    className="mx-auto mb-4"
                  />
              </div>
              <p className="text-gray-400">
                Plateforme officielle d'information pour les appelés au service civique national.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/consultation" className="hover:text-white transition-colors">Consultation</Link></li>
                <li><Link href="#info" className="hover:text-white transition-colors">Information</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
