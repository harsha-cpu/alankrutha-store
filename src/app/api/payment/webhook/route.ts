import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@insforge/sdk';

/**
 * This webhook handler listens for server-to-server events from Razorpay.
 * It's a crucial fallback to ensure payments are recorded even if the client-side
 * verification fails (e.g., user closes browser).
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not defined in environment variables.');
    return NextResponse.json({ message: 'Internal Server Error: Webhook secret not configured.' }, { status: 500 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ success: false, error: 'Missing Razorpay signature' }, { status: 400 });
    }

    // Step 1: Verify the webhook signature
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // Step 2: Process the event
    const event = JSON.parse(body);
    console.log('Received Razorpay Webhook Event:', event.event);

    const insforge = createAdminClient({
      baseUrl: process.env.INSFORGE_URL!,
      apiKey: process.env.INSFORGE_API_KEY!,
    });

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        // Find the order in your DB using the Razorpay order ID
        const { data: order, error: findError } = await insforge.database
          .from('orders')
          .select('id, status')
          .eq('razorpay_order_id', razorpayOrderId)
          .single();

        if (findError) {
          console.error(`Webhook DB find error for order ${razorpayOrderId}:`, findError.message);
          // Still return 200 to Razorpay, as we can't retry this. Log the error for manual check.
          return NextResponse.json({ success: true, message: 'Order not found, but webhook acknowledged.' });
        }

        // If order exists and is still 'pending', update it to 'paid'
        if (order && order.status === 'pending') {
          const { error: updateError } = await insforge.database
            .from('orders')
            .update({ status: 'paid', razorpay_payment_id: payment.id })
            .eq('id', order.id);

          if (updateError) {
            console.error(`Webhook DB update error for order ${order.id}:`, updateError.message);
            // Return 500 so Razorpay might retry.
            return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
          }

          console.log(`Webhook successfully updated order ${order.id} to 'paid'.`);
        } else if (order) {
          console.log(`Webhook received for order ${order.id}, but status was already '${order.status}'. No action taken.`);
        }
        break;
      }

      case 'payment.failed':
        console.log('Payment Failed Event:', event.payload.payment.entity.id);
        // You might want to add logic here to update the order status to 'failed'
        break;

      default:
        console.log('Unhandled Razorpay Event:', event.event);
        break;
    }

    // Acknowledge receipt of the event
    return NextResponse.json({ success: true, message: 'Webhook processed successfully.' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}