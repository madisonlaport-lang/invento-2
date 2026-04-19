import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PlanType } from "@/types";
import { trackEvent } from "@/utils/analytics";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const { updatePlan, user } = useAuth();
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const pendingPlan = localStorage.getItem("pending_plan") as PlanType | null;

    if (pendingPlan && (pendingPlan === "pro" || pendingPlan === "pro_plus")) {
      updatePlan(pendingPlan);
      localStorage.removeItem("pending_plan");
      setActivated(true);
    } else if (user) {
      setActivated(true);
    }
  }, [updatePlan, user]);

  useEffect(() => {
    const pendingPlan = localStorage.getItem("pending_plan") as PlanType | null;

    trackEvent("payment_success", {
      plan: pendingPlan || "unknown",
    });
  }, []);

  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 flex items-center justify-center bg-emerald-50 rounded-full mx-auto mb-6">
          <i className="ri-checkbox-circle-fill text-emerald-500 text-5xl"></i>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Paiement réussi !
        </h1>

        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
          Votre abonnement est maintenant actif. Vous pouvez accéder à toutes
          les fonctionnalités de votre plan immédiatement.
        </p>

        {sessionId && (
          <p className="text-xs text-gray-400 mb-6 font-mono">
            Réf : {sessionId.slice(0, 24)}...
          </p>
        )}

        <div className="flex flex-col gap-3 mb-8 text-left">
          {[
            {
              icon: "ri-shield-check-line",
              text: activated
                ? "Abonnement activé avec succès"
                : "Abonnement en cours d'activation...",
            },
            {
              icon: "ri-mail-line",
              text: "Un email de confirmation vous a été envoyé",
            },
            {
              icon: "ri-customer-service-2-line",
              text: "Support disponible 7j/7",
            },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 text-sm text-gray-600"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg flex-shrink-0">
                <i className={`${item.icon} text-emerald-600 text-base`}></i>
              </div>
              {item.text}
            </div>
          ))}
        </div>

        <Link
          to="/dashboard"
          className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3.5 rounded-lg transition-colors duration-200 whitespace-nowrap mb-3"
        >
          Accéder à mon tableau de bord
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
