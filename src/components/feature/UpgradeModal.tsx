import { useState } from "react";
import { PlanType } from "@/types";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  upgradeTarget?: PlanType;
}

const PLAN_LABELS: Record<PlanType, string> = {
  starter: "Starter",
  pro: "Pro — 10€/mois",
  pro_plus: "Pro+ — 19€/mois",
};

const PLAN_STRIPE: Record<PlanType, string> = {
  starter: "",
  pro: "pro",
  pro_plus: "pro_plus",
};

const PLAN_PERKS: Record<PlanType, string[]> = {
  starter: [],
  pro: [
    "Inventaires illimités",
    "Jusqu'à 5 logements",
    "Photos horodatées",
    "PDF professionnel avec photos",
    "Signature électronique",
  ],
  pro_plus: [
    "Tout du plan Pro",
    "Logements illimités",
    "Export avancé",
    "Mode hors ligne",
    "Support prioritaire",
  ],
};

export default function UpgradeModal({ isOpen, onClose, reason, upgradeTarget = "pro" }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: PLAN_STRIPE[upgradeTarget] }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la redirection.");
      }
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full z-10 animate-[fadeInUp_0.2s_ease]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Icon */}
        <div className="w-14 h-14 flex items-center justify-center bg-emerald-50 rounded-xl mb-5">
          <i className="ri-vip-crown-line text-emerald-600 text-2xl"></i>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Passez au plan {PLAN_LABELS[upgradeTarget]}
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{reason}</p>

        {/* Perks */}
        <ul className="flex flex-col gap-2.5 mb-7">
          {PLAN_PERKS[upgradeTarget].map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <i className="ri-checkbox-circle-fill text-emerald-500 text-base"></i>
              </div>
              {perk}
            </li>
          ))}
        </ul>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs mb-4 text-center">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 mb-3"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin text-base"></i>
              Redirection vers Stripe...
            </>
          ) : (
            <>
              <i className="ri-arrow-right-up-line text-base"></i>
              Passer au {PLAN_LABELS[upgradeTarget]}
            </>
          )}
        </button>

        <button
          onClick={onClose}
          className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 cursor-pointer transition-colors whitespace-nowrap"
        >
          Pas maintenant
        </button>
      </div>
    </div>
  );
}
