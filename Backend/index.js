import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.use(express.json());
app.use(cors());
app.post("/payment", async (req, res) => {
  try {
    const { product } = req.body;
    if (!product.name || !product.amount) {
      return res.status(400).json({ error: "Name and amount are required" });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: product.amount * 100, // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = process.env.PORT || 8282;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
