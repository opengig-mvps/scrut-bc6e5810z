import { NextResponse } from 'next/server';
import { stripeCheckout } from '@/modules/stripe';
import prisma from '@/lib/prisma';

type PaymentRequestBody = {
  amount: number;
  paymentMethod: string;
  subscriptionInfo: any;
  invoice: string;
};

export async function POST(request: Request) {
  try {
    const body: PaymentRequestBody = await request.json();
    const { amount, paymentMethod, subscriptionInfo, invoice } = body;

    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const session = await stripeCheckout.createOneTimePaymentSession({
      amount: amount * 100,
      successUrl: 'https://your-success-url.com',
      cancelUrl: 'https://your-cancel-url.com',
      metadata: { paymentMethod, subscriptionInfo, invoice },
    });

    await prisma.payment.create({
      data: {
        amount,
        paymentMethod,
        subscriptionInfo,
        invoice,
        transactionStatus: 'pending',
        userId: 1,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Stripe payment session created successfully',
        data: {
          sessionId: session.id,
          sessionUrl: session.url,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}