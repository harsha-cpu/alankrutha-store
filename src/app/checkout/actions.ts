'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createRazorpayCheckoutOrder,
  markRazorpayPaymentFailed,
  placeCodOrder,
  verifyRazorpayPayment,
  type PlaceOrderInput,
  type RazorpayCheckoutOrder,
  type RazorpayPaymentVerificationInput,
  type ShippingAddressInput,
} from "@/lib/storefront-data";

export type CheckoutActionState = {
  error: string | null;
  razorpay?: RazorpayCheckoutOrder | null;
};

export type RazorpayVerificationActionResult = {
  success: boolean;
  orderNumber?: string;
  error?: string | null;
};

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildPlaceOrderInput(formData: FormData): PlaceOrderInput {
  const addressMode = getFormString(formData, "addressMode");
  const savedAddressId = getFormString(formData, "savedAddressId");
  const notes = getFormString(formData, "notes");

  const input: PlaceOrderInput = {
    notes,
  };

  if (addressMode === "saved" && savedAddressId) {
    input.addressId = savedAddressId;
  } else {
    const address: ShippingAddressInput = {
      label: getFormString(formData, "label") || "Shipping",
      fullName: getFormString(formData, "fullName"),
      phone: getFormString(formData, "phone"),
      addressLine1: getFormString(formData, "addressLine1"),
      addressLine2: getFormString(formData, "addressLine2"),
      city: getFormString(formData, "city"),
      state: getFormString(formData, "state"),
      postalCode: getFormString(formData, "postalCode"),
      country: getFormString(formData, "country") || "India",
      isDefault: formData.get("isDefault") === "on",
    };

    input.address = address;
  }

  return input;
}

export async function placeOrderAction(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const input = buildPlaceOrderInput(formData);
  const paymentMode = getFormString(formData, "paymentMode");

  if (paymentMode === "razorpay") {
    const result = await createRazorpayCheckoutOrder(input);

    if (!result.success || !result.checkout || !result.orderNumber) {
      return { error: result.error || "Unable to start Razorpay payment. Please review your details and try again.", razorpay: null };
    }

    revalidatePath("/checkout");
    revalidatePath("/orders");
    revalidatePath("/checkout/success/" + result.orderNumber);

    return { error: null, razorpay: result.checkout };
  }

  const result = await placeCodOrder(input);

  if (!result.success || !result.orderNumber) {
    return { error: result.error || "Unable to place the order. Please review your details and try again.", razorpay: null };
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/orders");
  revalidatePath("/checkout/success/" + result.orderNumber);
  redirect("/checkout/success/" + encodeURIComponent(result.orderNumber));
}

export async function verifyRazorpayPaymentAction(
  input: RazorpayPaymentVerificationInput,
): Promise<RazorpayVerificationActionResult> {
  const result = await verifyRazorpayPayment(input);

  if (!result.success || !result.orderNumber) {
    return { success: false, error: result.error || "Unable to verify Razorpay payment." };
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/orders");
  revalidatePath("/checkout/success/" + result.orderNumber);

  return { success: true, orderNumber: result.orderNumber, error: null };
}

export async function markRazorpayPaymentFailedAction(orderNumber: string, razorpayOrderId: string) {
  const result = await markRazorpayPaymentFailed(orderNumber, razorpayOrderId);

  if (result.success) {
    revalidatePath("/orders");
    revalidatePath("/checkout/success/" + orderNumber);
  }

  return result;
}
