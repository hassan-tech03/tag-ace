import Link from "next/link";
import EmailLink from "@/components/storefront/EmailLink";
import { DELIVERY_TIME, RETURN_REPORT_WINDOW } from "@/lib/faqs";
import { getFaqContext } from "@/lib/faqContext";
import { formatPrice } from "@/lib/money";
import { CARD_PAYMENTS_ENABLED } from "@/lib/paymentConfig";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Shipping & Returns Policy",
  description:
    "Mushk Perfumes delivery times and charges across Pakistan, Cash on Delivery, and our policy for damaged, leaking or incorrect items.",
  path: "/shipping-returns",
});

export default async function ShippingReturnsPage() {
  const { rates = { freeShippingThreshold: 5000, flatRate: 250 }, email, phone } = await getFaqContext();
  // Email rendered client-side (Cloudflare email obfuscation breaks hydration).
  const contact =
    email || phone ? (
      <>
        {email && (
          <>
            email <EmailLink email={email} />
          </>
        )}
        {email && phone && " or "}
        {phone && `call or WhatsApp ${phone}`}
      </>
    ) : null;

  return (
    <div className="faq-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shipping & Returns", path: "/shipping-returns" },
        ])}
      />
      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Shipping &amp; Returns</span>
          </div>
          <h1>Shipping &amp; Returns</h1>
          <p>How delivery works, what it costs, and what happens if something's wrong with your order.</p>
        </div>
      </section>

      <div className="container">
        <article className="blog-article policy-article">
          <div className="blog-prose">
            <h2>Delivery</h2>
            <ul>
              <li>We deliver to cities and towns across Pakistan. We don't ship internationally yet.</li>
              <li>
                <strong>Major cities</strong> ({DELIVERY_TIME.majorCityNames}): usually {DELIVERY_TIME.majorCities}.
              </li>
              <li>
                <strong>Other cities and towns:</strong> usually {DELIVERY_TIME.otherCities}.
              </li>
              <li>Delivery times start once your order is confirmed and may be longer during sales, public holidays or bad weather.</li>
            </ul>

            <h2>Delivery charges</h2>
            <ul>
              {rates.flatRate > 0 ? (
                <>
                  {rates.freeShippingThreshold > 0 && (
                    <li>
                      <strong>Free delivery</strong> on orders of {formatPrice(rates.freeShippingThreshold)} or more.
                    </li>
                  )}
                  <li>
                    {rates.freeShippingThreshold > 0 ? "Orders below that: " : "All orders: "}a flat {formatPrice(rates.flatRate)} anywhere in Pakistan.
                  </li>
                </>
              ) : (
                <li>Delivery is free on every order.</li>
              )}
              <li>The delivery charge is shown at checkout before you place your order.</li>
            </ul>

            <h2>Payment</h2>
            <ul>
              <li>
                <strong>Cash on Delivery</strong> is available everywhere we deliver. Our team will call or WhatsApp you to confirm the order before dispatch.
              </li>
              {CARD_PAYMENTS_ENABLED && (
                <li>
                  <strong>Debit or credit card</strong> (Visa, Mastercard) payments are processed securely by Stripe.
                </li>
              )}
            </ul>

            <h2>Returns &amp; exchanges</h2>
            <p>
              Perfume is a personal-care product. For hygiene reasons we can't accept returns of opened or used fragrances, or returns because a
              scent wasn't to your taste.
            </p>
            <p>We will replace your item or give you a refund if your order:</p>
            <ul>
              <li>arrives damaged or broken,</li>
              <li>arrives leaking, or</li>
              <li>is not the item you ordered.</li>
            </ul>

            <h3>How to report a problem</h3>
            <ol>
              <li>
                Contact us within <strong>{RETURN_REPORT_WINDOW} of delivery</strong>
                {contact ? <>: {contact}.</> : <> through our <Link href="/contact">contact page</Link>.</>}
              </li>
              <li>Share your order number, clear photos of the item and packaging, and an unboxing video recorded in one take from the sealed parcel.</li>
              <li>Once we've checked it, we'll send a replacement or arrange your refund.</li>
            </ol>

            <h3>Refunds</h3>
            <ul>
              {CARD_PAYMENTS_ENABLED && (
                <li>Card payments are refunded to the same card. Your bank may take 5–10 working days to show it.</li>
              )}
              <li>Cash on Delivery orders are refunded to your bank account or mobile wallet.</li>
            </ul>

            <h2>Changing or cancelling an order</h2>
            <p>
              You can change or cancel your order until it's dispatched.{" "}
              {contact ? <>Please {contact} with your order number as soon as possible.</> : <>Please <Link href="/contact">contact us</Link> with your order number as soon as possible.</>}
            </p>

            <p>
              More questions? See our <Link href="/faq">FAQs</Link>.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
