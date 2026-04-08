import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req, res) {
  // sécurité : seulement POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { plan } = req.body || {};

    if (!plan) {
      return res.status(400).json({ error: "Plan manquant" });
    }

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_PRO_PLUS_PRICE_ID;

    if (!priceId) {
      return res.status(500).json({ error: "Price ID manquant" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "https://kenwa-conciergerie.com/success",
      cancel_url: "https://kenwa-conciergerie.com/cancel",
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("🔥 ERREUR STRIPE COMPLETE :", error);
    
    return res.status(500).json({
      error: "Erreur Stripe",
      details: error.message,
      type: error.type,
    });
  }
}
