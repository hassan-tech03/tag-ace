import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    const { items, customerInfo, total } = await request.json();

    // Create line items for Stripe Checkout
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: 'AROME • 100ML',
          images: [`${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/1_08ff09db-b9b0-4781-8774-8c5872176160_360x.webp`],
        },
        unit_amount: Math.round(parseFloat(item.price.toString().match(/[\d.]+/)?.[0] || 0) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.price.toString().match(/[\d.]+/)?.[0] || 0);
      return sum + (price * item.quantity);
    }, 0);

    const shipping = subtotal > 50 ? 0 : 9.99;
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: 'Standard shipping',
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item
    const tax = subtotal * 0.08;
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
            description: 'Sales tax (8%)',
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/checkout?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000'}/checkout?payment_cancelled=true`,
      customer_email: customerInfo.email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerPhone: customerInfo.phone,
        orderType: 'perfume_order',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}