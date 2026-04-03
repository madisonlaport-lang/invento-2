import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-05-28.basil",
});

const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID as string,
  pro_plus: process.env.STRIPE_PRO_PLUS_PRICE_ID as string,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { plan } = req.body as { plan: string };

  if (!plan || !PRICE_IDS[plan]) {
    return res.status(400).json({ error: "Plan invalide. Utilisez 'pro' ou 'pro_plus'." });
  }

  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    return res.status(500).json({ error: "Price ID manquant dans les variables d'environnement." });
  }

  try {
    const baseUrl = req.headers.origin || "https://tonsite.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return res.status(500).json({ error: message });
  }
}
