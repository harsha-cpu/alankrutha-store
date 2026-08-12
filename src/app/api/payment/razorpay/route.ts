// SECTION: Import necessary modules
// NextResponse is used to send responses from Next.js API routes.
// Razorpay is the official Node.js SDK for interacting with the Razorpay API.
// crypto is a built-in Node.js module for generating secure random values.
// createAdminClient is your database client for secure server-side operations.
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { randomBytes } from 'crypto';
import { createAdminClient } from '@insforge/sdk';

// SECTION: Define interfaces for type safety
// This ensures the data we receive and process has a predictable structure.

// Represents a single item in the incoming cart from the client.
interface CartItem {
  productId: string;
  quantity: number;
}

// Represents the structure of a product fetched from our database.
interface Product {
  id: string;
  price: number;
}

// SECTION: Initialize SDKs and clients
// These clients are configured once and reused across requests.

// Initialize the Razorpay client with secret keys from environment variables.
// Using '!' (non-null assertion) assumes these variables are always set in your deployment environment.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Initialize your database admin client for secure data fetching.
const insforge = createAdminClient({
  baseUrl: process.env.INSFORGE_URL!,
  apiKey: process.env.INSFORGE_API_KEY!,
});

// SECTION: Define the API route handler (POST method)
export async function POST(request: Request) {
  try {
    // Step 1: Parse and validate the incoming request body.
    const { userId, items }: { userId: string; items: CartItem[] } = await request.json();

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: userId and a non-empty items array are required.' },
        { status: 400 }
      );
    }

    // Step 2: Recalculate the total amount on the server to prevent client-side price manipulation.
    // This is a critical security measure. NEVER trust the amount sent from the client.

    // Extract all product IDs from the cart to fetch their prices in a single query.
    const productIds = items.map((item) => item.productId);

    // Fetch the actual product details from your database.
    const { data: products, error: dbError } = await insforge.database
      .from('products') // Assuming you have a 'products' table
      .select('id, price')
      .in('id', productIds);

    if (dbError) {
      console.error('Database error fetching products:', dbError);
      throw new Error('Could not fetch product information.');
    }

    // Create a map for quick price lookups.
    const productPriceMap = new Map(products.map((p: Product) => [p.id, p.price]));

    // Calculate the total amount based on server-side prices.
    let serverCalculatedAmount = 0;
    for (const item of items) {
      // Validate that the quantity is a positive number.
      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for product ID: ${item.productId}` },
          { status: 400 }
        );
      }
      const price = productPriceMap.get(item.productId);
      if (price === undefined) {
        // If a product ID from the cart doesn't exist in the database, reject the order.
        return NextResponse.json(
          { error: `Invalid product ID in cart: ${item.productId}` },
          { status: 400 }
        );
      }
      serverCalculatedAmount += price * item.quantity;
    }

    // Step 3: Create a 'pending' order in your local database before creating the Razorpay order.
    // This provides a record of the transaction attempt.
    const { data: localOrder, error: localOrderError } = await insforge.database
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: serverCalculatedAmount,
        status: 'pending',
        items: items, // Storing cart items for reconciliation
        payment_method: 'razorpay',
      })
      .select('id')
      .single();

    if (localOrderError || !localOrder) {
      console.error('Database error creating local order:', localOrderError);
      throw new Error('Could not create a record of the order.');
    }

    // Step 4: Create the order with Razorpay using the server-calculated amount.
    // The local database order ID is used as the 'receipt' to link the two systems.
    const options = {
      amount: serverCalculatedAmount * 100, // Amount in the smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: `order_${localOrder.id}`,
    };

    const order = await razorpay.orders.create(options);

    // Step 5: Update the local order with the Razorpay order ID for future reference.
    const { error: updateError } = await insforge.database
      .from('orders')
      .update({ razorpay_order_id: order.id })
      .eq('id', localOrder.id);

    if (updateError) {
      console.error('Failed to update local order with Razorpay order ID:', updateError);
      throw new Error('Failed to link Razorpay order to local order.');
    }

    // Step 6: Return only the necessary, non-sensitive details to the client.
    // Do not send the entire order object, as it may contain sensitive information.
    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    // Generic error handler for any unexpected issues.
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { error: 'Could not create payment order.' },
      { status: 500 }
    );
  }
}