import { Link } from "react-router-dom";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  cta: string;
  ctaTo: string | null;
  stripePlan: string | null;
  features: string[];
  highlight: boolean;
  badge: string | null;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Gratuit",
    period: "",
    desc: "Pour tester l'outil sans aucun engagement.",
    cta: "Tester gratuitement",
    ctaTo: "/register",
    stripePlan: null,
    features: [
      "1 inventaire (total)",
      "1 logement",
      "PDF basique",
      "Accès web uniquement",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "10€",
    period: "/ mois",
    desc: "La solution complète pour protéger vos logements.",
    cta: "Commencer maintenant",
    ctaTo: null,
    stripePlan: "pro",
    features: [
      "Inventaires illimités",
      "Jusqu'à 5 logements",
      "Photos horodatées",
      "PDF professionnel avec photos",
      "Signature électronique",
      "Tous les modèles",
      "Support rapide",
    ],
    highlight: true,
    badge: "Le plus utilisé",
  },
  {
    id: "proplus",
    name: "Pro+",
    price: "19€",
    period: "/ mois",
    desc: "Pour les propriétaires multi-logements exigeants.",
    cta: "Passer au niveau supérieur",
    ctaTo: null,
    stripePlan: "pro_plus",
    features: [
      "Tout du plan Pro",
      "Logements illimités",
      "Mode hors ligne",
      "Comparaison d'inventaires",
      "Export avancé",
      "Support prioritaire",
    ],
    highlight: false,
    badge: null,
  },
];

function StripeButton({
  plan,
  highlight,
  label,
}: {
  plan: string;
  highlight: boolean;
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    // Stocker le plan en attente pour l'activer après retour Stripe
    localStorage.setItem("pending_plan", plan);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création de la session.");
      }

      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("URL de paiement introuvable.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-8">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full text-center font-semibold text-sm py-3.5 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap block
          ${highlight
            ? "bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60"
            : "border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 disabled:opacity-60"
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <i className="ri-loader-4-line animate-spin text-base"></i>
            Redirection...
          </span>
        ) : (
          label
        )}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="tarifs" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Tarifs
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Protégez vos logements{" "}
            <span className="text-emerald-600">en moins de 10 minutes</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Évitez les litiges et gagnez du temps avec un inventaire professionnel automatisé
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl transition-all duration-300 cursor-default
                ${plan.highlight
                  ? "bg-gray-900 text-white p-9 md:-my-4 md:py-12 z-10 hover:scale-[1.02]"
                  : "bg-white border border-gray-200 p-8 hover:scale-[1.015] hover:border-emerald-200"
                }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name + desc */}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                  {plan.desc}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-end gap-1 mb-8">
                <span className={`text-5xl font-extrabold leading-none ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              {/* CTA — Stripe ou lien simple */}
              {plan.stripePlan ? (
                <StripeButton
                  plan={plan.stripePlan}
                  highlight={plan.highlight}
                  label={plan.cta}
                />
              ) : (
                <Link
                  to={plan.ctaTo as string}
                  className={`w-full text-center font-semibold text-sm py-3.5 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap block mb-8
                    ${plan.highlight
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900"
                    }`}
                >
                  {plan.cta}
                </Link>
              )}

              {/* Divider */}
              <div className={`w-full h-px mb-6 ${plan.highlight ? "bg-white/10" : "bg-gray-100"}`} />

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlight ? "text-gray-300" : "text-gray-600"}`}>
                    <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <i className={`ri-checkbox-circle-fill text-base ${plan.highlight ? "text-emerald-400" : "text-emerald-600"}`}></i>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Guarantee strip */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-shield-check-line text-emerald-600 text-base"></i>
            </span>
            Essai sans carte bancaire
          </span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-lock-line text-emerald-600 text-base"></i>
            </span>
            Paiement 100% sécurisé
          </span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-close-circle-line text-emerald-600 text-base"></i>
            </span>
            Résiliation en 1 clic
          </span>
        </div>
      </div>
    </section>
  );
}
