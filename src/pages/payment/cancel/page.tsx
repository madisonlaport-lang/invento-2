import { Link } from "react-router-dom";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center border border-gray-100">
        {/* Icône annulation */}
        <div className="w-20 h-20 flex items-center justify-center bg-orange-50 rounded-full mx-auto mb-6">
          <i className="ri-close-circle-fill text-orange-400 text-5xl"></i>
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Paiement annulé
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Votre paiement n'a pas été finalisé. Aucun montant n'a été débité.
          Vous pouvez réessayer à tout moment.
        </p>

        {/* Info */}
        <div className="bg-orange-50 rounded-xl p-4 mb-8 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <i className="ri-information-line text-orange-500 text-lg"></i>
            </div>
            <p className="text-sm text-orange-700 leading-relaxed">
              Si vous avez rencontré un problème lors du paiement, notre support
              est disponible pour vous aider.
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/#tarifs"
          className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3.5 rounded-lg transition-colors duration-200 whitespace-nowrap mb-3"
        >
          Voir les offres
        </Link>
        <Link
          to="/"
          className="block w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors duration-200 whitespace-nowrap"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
