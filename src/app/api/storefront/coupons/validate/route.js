import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Coupon from "@/lib/models/Coupon";

// Public endpoint: validates a coupon code against a cart subtotal.
// Returns the computed discount amount (does not persist usage; counts
// should be incremented when the order is actually placed).
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const codeRaw = String(body?.code || "").trim().toUpperCase();
    const subtotal = Number(body?.subtotal || 0);

    if (!codeRaw) {
      return NextResponse.json({ valid: false, error: "Enter a coupon code." }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ code: codeRaw }).lean();
    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Coupon not found." }, { status: 404 });
    }
    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "This coupon is disabled." }, { status: 400 });
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json(
        { valid: false, error: "This coupon isn't active yet." },
        { status: 400 }
      );
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json({ valid: false, error: "This coupon has expired." }, { status: 400 });
    }
    if (coupon.usageLimit != null && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return NextResponse.json(
        { valid: false, error: "This coupon has reached its usage limit." },
        { status: 400 }
      );
    }
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          valid: false,
          error: `Spend at least $${coupon.minPurchase.toFixed(2)} to use this coupon.`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "percent") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.type === "fixed") {
      discount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === "free_shipping") {
      // Caller is expected to inspect `freeShipping` and zero its shipping
      // line.
      discount = 0;
    }
    discount = Math.max(0, Math.round(discount * 100) / 100);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      freeShipping: coupon.type === "free_shipping",
      description: coupon.description || "",
    });
  } catch (err) {
    console.error("[coupon validate]", err);
    return NextResponse.json(
      { valid: false, error: "Could not validate coupon." },
      { status: 500 }
    );
  }
}
