import { Response } from "express";
import Stripe from "stripe";
import UserModel from "../../../../config/db/models/UserModel";
import { type AuthenticatedRequest } from "../../../middleware/userAuth";
import logger from "../../../../utils/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID!;
const CREDITS_PRICE_ID = process.env.STRIPE_CREDITS_PRICE_ID!;
const CREDITS_PER_PACK = 10;
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

class BillingController {
  /** Ensure a Stripe customer exists for this user and return their ID. */
  private ensureCustomer = async (userId: string): Promise<string> => {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId },
    });
    await UserModel.findByIdAndUpdate(userId, { stripeCustomerId: customer.id });
    return customer.id;
  };

  createCheckout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const customerId = await this.ensureCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      success_url: `${CLIENT_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/pricing`,
      metadata: { userId, type: "subscription" },
    });

    res.json({ url: session.url });
  };

  createCreditsCheckout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const customerId = await this.ensureCustomer(userId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{ price: CREDITS_PRICE_ID, quantity: 1 }],
      success_url: `${CLIENT_URL}/upgrade/success?credits=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/pricing`,
      metadata: { userId, type: "credits" },
    });

    res.json({ url: session.url });
  };

  createPortal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const user = await UserModel.findById(userId);
    if (!user?.stripeCustomerId) {
      res.status(400).json({ error: "No billing account found" });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${CLIENT_URL}/profile`,
    });

    res.json({ url: session.url });
  };

  handleWebhook = async (req: AuthenticatedRequest & { rawBody?: Buffer }, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"] as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody ?? req.body, sig, WEBHOOK_SECRET);
    } catch (err) {
      logger.error({ err }, "[Billing]: Webhook signature verification failed");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    logger.info({ type: event.type }, "[Billing]: Stripe webhook received");

    switch (event.type) {
      // ── One-time credit pack purchase ────────────────────────────────────────
      case "checkout.session.completed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = event.data.object as any;
        if (session.metadata?.type === "credits" && session.metadata?.userId) {
          await UserModel.findByIdAndUpdate(session.metadata.userId, {
            $inc: { credits: CREDITS_PER_PACK },
          });
          logger.info({ userId: session.metadata.userId }, "[Billing]: Credits added");
        }
        break;
      }

      // ── Subscription lifecycle ───────────────────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const isActive = sub.status === "active" || sub.status === "trialing";
        await UserModel.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { plan: isActive ? "pro" : "free", stripeSubscriptionId: sub.id },
        );
        break;
      }
      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await UserModel.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { plan: "free", stripeSubscriptionId: null },
        );
        break;
      }
    }

    res.json({ received: true });
  };
}

export default new BillingController();
