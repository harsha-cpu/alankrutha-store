import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayPayment } from "@/lib/storefront-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await verifyRazorpayPayment({
      orderNumber: body.orderNumber,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      total: result.total,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}