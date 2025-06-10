import { stripe } from "../config/stripe";
import { AuthRequest } from "../middleware/verifyAuth";
import { CartItem } from "./CheckoutController";
import { createInvoice } from "./InvoiceController";
import { updateMyPlan } from "./ProfileController";
import { cloneTemplate } from "./TemplateController";
import { Response } from "express";

// controllers/paymentController.ts
export async function verifyPayment(
  req: AuthRequest,
  res: Response
) {
  const { session_id } = req.query;
  const userId = req.user!.id;

  try {
    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id as string);

    if (!session || session.payment_status !== 'paid') {
      return res.status(402).json({ error: "Payment not completed" });
    }

    // Get items from metadata
    if (!session.metadata || !session.metadata.items) {
      return res.status(400).json({ error: "No items found in session metadata" });
    }
    const items = JSON.parse(session.metadata.items);

    // Process items (plans/templates)
    await Promise.all(
      items.map(async (item: CartItem) => {
        if (item.id.startsWith("plan-")) {
          // Handle plan upgrade
          const key = item.id.slice("plan-".length);
          const planName = (key.charAt(0).toUpperCase() + key.slice(1)) as "Free" | "Pro" | "Enterprise";
          // Create a mock req/res for updateMyPlan
          const planReq = {
            ...req,
            body: { plan: planName }
          } as AuthRequest<{ plan: "Free" | "Pro" | "Enterprise" }>;
          await updateMyPlan(planReq, res);
        } else {
          // Handle template cloning
          const cloneReq = {
            ...req,
            params: { libraryId: item.id }
          } as AuthRequest<any>;
          await cloneTemplate(cloneReq, res);
        }
      })
    );

    // Create invoice
    if (session.amount_total == null || session.currency == null) {
      return res.status(400).json({ error: "Missing amount or currency in session" });
    }
    // Create a mock req/res for createInvoice
    const invoiceReq = {
      ...req,
      body: {
        items: items,
        amount: session.amount_total / 100,
        currency: session.currency,
        stripeSessionId: session.id
      }
    } as AuthRequest;
    await createInvoice(invoiceReq, res);
    // createInvoice will handle the response
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}