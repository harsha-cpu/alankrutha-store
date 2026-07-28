import { createHmac, timingSafeEqual } from 'crypto';

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

export type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};

export type RazorpayPaymentResponse = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
  method: string | null;
  order_id: string | null;
  created_at: number;
};

type RazorpayCredentials = {
  keyId: string;
  keySecret: string;
};

type RazorpayErrorPayload = {
  error?: {
    description?: string;
    reason?: string;
  };
};

export function getRazorpayPublicKeyId() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';

  if (!keyId) {
    throw new Error('Razorpay key ID is not configured.');
  }

  return keyId;
}

export function toRazorpayAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100);
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}) {
  return razorpayRequest<RazorpayOrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    }),
  });
}

export async function fetchRazorpayPayment(paymentId: string) {
  return razorpayRequest<RazorpayPaymentResponse>(`/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
  });
}

export async function captureRazorpayPayment(paymentId: string, amount: number, currency: string) {
  return razorpayRequest<RazorpayPaymentResponse>(`/payments/${encodeURIComponent(paymentId)}/capture`, {
    method: 'POST',
    body: JSON.stringify({ amount, currency }),
  });
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = getRazorpayCredentials();
  const expected = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(signature, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

async function razorpayRequest<T>(path: string, init: RequestInit) {
  const { keyId, keySecret } = getRazorpayCredentials();
  const headers = new Headers(init.headers);

  headers.set('Authorization', `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getRazorpayErrorMessage(payload) || `Razorpay request failed with status ${response.status}.`);
  }

  return payload as T;
}

function getRazorpayCredentials(): RazorpayCredentials {
  const keyId = getRazorpayPublicKeyId();
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  if (!keySecret) {
    throw new Error('Razorpay key secret is not configured.');
  }

  return { keyId, keySecret };
}

function getRazorpayErrorMessage(payload: unknown) {
  const errorPayload = payload && typeof payload === 'object' ? (payload as RazorpayErrorPayload) : {};
  return errorPayload.error?.description || errorPayload.error?.reason || null;
}
