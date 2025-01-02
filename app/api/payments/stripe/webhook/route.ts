import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/modules/stripe";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: any;

  try {
    if (!sig) {
      throw new Error("Missing Stripe signature");
    }
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session: any = event.data.object;
        await prisma.payment.updateMany({
          where: { invoice: session.invoice },
          data: { transactionStatus: "completed" },
        });
        await sendEmail({
          to: session.customer_email,
          template: {
            subject: "Payment Successful",
            html: "<h1>Your payment was successful!</h1>",
            text: "Your payment was successful!",
          },
        });
        break;
      case "payment_intent.succeeded":
        const intent: any = event.data.object;
        await prisma.payment.updateMany({
          where: { invoice: intent.invoice },
          data: { transactionStatus: "succeeded" },
        });
        await sendEmail({
          to: intent.receipt_email,
          template: {
            subject: "Payment Intent Succeeded",
            html: "<h1>Your payment intent succeeded!</h1>",
            text: "Your payment intent succeeded!",
          },
        });
        break;
      case "customer.subscription.created":
        const subscription: any = event.data.object;
        await prisma.payment.updateMany({
          where: { invoice: subscription.latest_invoice },
          data: { subscriptionInfo: subscription },
        });
        await sendEmail({
          to: subscription.customer_email,
          template: {
            subject: "Subscription Created",
            html: "<h1>Your subscription has been created!</h1>",
            text: "Your subscription has been created!",
          },
        });
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Invalid event type" },
          { status: 400 }
        );
    }
    return NextResponse.json({
      success: true,
      message: "Stripe webhook processed successfully",
      data: {},
    });
  } catch (error: any) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", data: error },
      { status: 500 }
    );
  }
}