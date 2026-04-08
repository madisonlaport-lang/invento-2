import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  try {
    const { plan } = req.body;

    const priceId =
      plan === "pro"
        ? process.env.STRIPE_PRO_PRICE_ID
        : null;

    if (!priceId) {
      return res.status(400).json({ error: "Plan invalide" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
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
      message: error.message,
    });
  }
}
