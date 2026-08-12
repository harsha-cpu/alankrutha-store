import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createAdminClient } from '@insforge/sdk';

interface CartItem {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  price: number;
}

export async function POST(request: Request) {
  try {
    // Razorpay credentials are checked only when a payment is actually requested.
    // This allows the application to build/deploy without Razorpay credentials.
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (
      !keyId ||
      !keySecret ||
      keyId === 'YOUR_KEY_ID' ||
      keySecret === 'YOUR_KEY_SECRET'
    ) {
      return NextResponse.json(
        {
          error: 'Razorpay payment is not configured yet.',
        },
        { status: 503 }
      );
    }

    // Initialize Razorpay only when this API is actually called.
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Initialize the database client.
    const insforgeUrl = process.env.INSFORGE_URL;
    const insforgeApiKey = process.env.INSFORGE_API_KEY;

    if (!insforgeUrl || !insforgeApiKey) {
      return NextResponse.json(
        {
          error: 'Database configuration is missing.',
        },
        { status: 500 }
      );
    }

    const insforge = createAdminClient({
      baseUrl: insforgeUrl,
      apiKey: insforgeApiKey,
    });

    // ---------------------------------------------------------
    // Step 1: Parse and validate request
    // ---------------------------------------------------------

    const {
      userId,
      items,
    }: {
      userId: string;
      items: CartItem[];
    } = await request.json();

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error:
            'Invalid request: userId and a non-empty items array are required.',
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Step 2: Get real product prices from the database
    // ---------------------------------------------------------

    const productIds = items.map((item) => item.productId);

    const { data: products, error: dbError } = await insforge.database
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (dbError) {
      console.error('Database error fetching products:', dbError);

      return NextResponse.json(
        {
          error: 'Could not fetch product information.',
        },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid products were found.',
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Step 3: Create price lookup map
    // ---------------------------------------------------------

    const productPriceMap = new Map(
      products.map((product: Product) => [product.id, product.price])
    );

    // ---------------------------------------------------------
    // Step 4: Calculate total on the server
    // ---------------------------------------------------------

    let serverCalculatedAmount = 0;

    for (const item of items) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error: `Invalid quantity for product ID: ${item.productId}`,
          },
          { status: 400 }
        );
      }

      const price = productPriceMap.get(item.productId);

      if (price === undefined) {
        return NextResponse.json(
          {
            error: `Invalid product ID in cart: ${item.productId}`,
          },
          { status: 400 }
        );
      }

      serverCalculatedAmount += price * item.quantity;
    }

    if (serverCalculatedAmount <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid order amount.',
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // Step 5: Create local pending order
    // ---------------------------------------------------------

    const { data: localOrder, error: localOrderError } =
      await insforge.database
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: serverCalculatedAmount,
          status: 'pending',
          items,
          payment_method: 'razorpay',
        })
        .select('id')
        .single();

    if (localOrderError || !localOrder) {
      console.error(
        'Database error creating local order:',
        localOrderError
      );

      return NextResponse.json(
        {
          error: 'Could not create a record of the order.',
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // Step 6: Create Razorpay order
    // ---------------------------------------------------------

    const options = {
      amount: Math.round(serverCalculatedAmount * 100),
      currency: 'INR',
      receipt: `order_${localOrder.id}`,
    };

    const order = await razorpay.orders.create(options);

    // ---------------------------------------------------------
    // Step 7: Save Razorpay order ID
    // ---------------------------------------------------------

    const { error: updateError } = await insforge.database
      .from('orders')
      .update({
        razorpay_order_id: order.id,
      })
      .eq('id', localOrder.id);

    if (updateError) {
      console.error(
        'Failed to update local order with Razorpay order ID:',
        updateError
      );

      return NextResponse.json(
        {
          error: 'Failed to link Razorpay order to local order.',
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // Step 8: Return safe payment information
    // ---------------------------------------------------------

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);

    return NextResponse.json(
      {
        error: 'Could not create payment order.',
      },
      { status: 500 }
    );
  }
}