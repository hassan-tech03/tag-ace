import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({ title: "Checkout", path: "/checkout", noindex: true });

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading checkout...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
