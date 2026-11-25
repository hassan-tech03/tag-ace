import Link from "next/link";
import EmailLink from "@/components/storefront/EmailLink";
import { getFaqContext } from "@/lib/faqContext";
import { CARD_PAYMENTS_ENABLED } from "@/lib/paymentConfig";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Keep this accurate: every statement below describes what the site actually
// does (checkout, contact form, newsletter, browser storage, providers). If a
// feature or provider changes, update the text and LAST_UPDATED.
const LAST_UPDATED = "25 November 2026";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Mushk Perfumes collects, uses and protects your personal information when you shop, contact us or sign up for our newsletter.",
  path: "/privacy-policy",
});

export default async function PrivacyPolicyPage() {
  const { email, phone } = await getFaqContext();
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
    ) : (
      <>
        use our <Link href="/contact">contact page</Link>
      </>
    );

  return (
    <div className="faq-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ])}
      />
      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Privacy Policy</span>
          </div>
          <h1>Privacy Policy</h1>
          <p>What information we collect, why we need it, and the choices you have.</p>
        </div>
      </section>

      <div className="container">
        <article className="blog-article policy-article">
          <div className="blog-prose">
            <p>
              <em>Last updated: {LAST_UPDATED}</em>
            </p>
            <p>
              This policy explains how Mushk Perfumes (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles your personal information when you use
              mushkscents.com, place an order, contact us or sign up for our newsletter. We are an online perfume store based in Pakistan and
              we only collect what we need to sell and deliver your perfumes and look after you as a customer.
            </p>

            <h2>Information we collect</h2>
            <h3>When you place an order</h3>
            <ul>
              <li>Your name, email address and phone number.</li>
              <li>Your delivery address (street, apartment, city, province and postal code) and, if you enter one, a company name.</li>
              <li>Any delivery notes you add.</li>
              <li>What you ordered, the amounts, and how you chose to pay.</li>
              <li>Whether you ticked &ldquo;Email me with news and offers&rdquo;.</li>
            </ul>
            {CARD_PAYMENTS_ENABLED ? (
              <p>
                If you pay by card, your card details are entered on Stripe&rsquo;s secure payment page and processed by Stripe. We never see
                or store your full card number.
              </p>
            ) : (
              <p>We currently accept Cash on Delivery only, so we never ask for or store card details.</p>
            )}

            <h3>When you contact us</h3>
            <p>
              If you use our contact form, email us, call us or message us on WhatsApp, we receive your name, contact details and whatever
              you choose to tell us, so we can reply.
            </p>

            <h3>When you sign up for our newsletter</h3>
            <p>Your email address, so we can send you new launches and offers.</p>

            <h3>Automatically, when you visit the site</h3>
            <p>
              Like most websites, our servers and our security provider keep technical logs, such as your IP address, browser type and
              the pages requested. We use these only to keep the site secure, prevent abuse and fix problems. We do not use advertising
              trackers or analytics tools that follow you around the web.
            </p>

            <h2>How we use your information</h2>
            <ul>
              <li>To process, confirm and deliver your order. For Cash on Delivery orders our team may call or WhatsApp you to confirm before dispatch.</li>
              <li>To email you about your order, for example your order confirmation and delivery updates.</li>
              <li>To answer your questions and handle any problem with an order, such as a damaged item.</li>
              <li>To send you news and offers, but only if you asked for them. You can unsubscribe at any time.</li>
              <li>To protect our customers and our store from fraud and misuse.</li>
              <li>To keep the business records we are required to keep, for example for accounting and tax.</li>
            </ul>
            <p>
              <strong>We do not sell or rent your personal information</strong>, and we don&rsquo;t share it with other companies for their
              own marketing.
            </p>

            <h2>Who we share it with</h2>
            <p>We only share what each service needs to do its job for us:</p>
            <ul>
              <li>
                <strong>Delivery partners</strong> receive your name, phone number, delivery address and, for Cash on Delivery, the amount to
                collect.
              </li>
              <li>
                <strong>Our email provider</strong> sends order emails and replies on our behalf.
              </li>
              {CARD_PAYMENTS_ENABLED && (
                <li>
                  <strong>Stripe</strong> processes card payments.
                </li>
              )}
              <li>
                <strong>Our hosting and security providers</strong> run the website and protect it from attacks.
              </li>
            </ul>
            <p>We may also disclose information if the law requires it, for example in response to a valid request from the authorities.</p>

            <h2>Cookies and storage on your device</h2>
            <p>We keep this to what the shop needs to work:</p>
            <ul>
              <li>
                <strong>Your cart</strong> is saved in your browser&rsquo;s local storage so it&rsquo;s still there when you come back.
              </li>
              <li>
                <strong>&ldquo;Save this information for next time&rdquo;</strong>: if you tick this at checkout, your name, email, phone and
                delivery address are saved in your browser on this device only, to fill in the form next time. Payment details are never
                saved. To remove them, untick the box on your next order or clear your browser&rsquo;s site data.
              </li>
              <li>
                <strong>Your last order</strong> is kept briefly in your browser so the order confirmation page can show it.
              </li>
              <li>
                Our security provider (Cloudflare) may set a strictly necessary cookie to tell real visitors apart from bots.
              </li>
            </ul>
            <p>We don&rsquo;t use advertising or tracking cookies.</p>

            <h2>How long we keep it</h2>
            <ul>
              <li>
                <strong>Orders:</strong> as long as we need them to deliver your order, handle any problem with it, and meet our accounting
                and legal obligations.
              </li>
              <li>
                <strong>Messages:</strong> as long as needed to help you, and then for a reasonable period in case you follow up.
              </li>
              <li>
                <strong>Newsletter:</strong> until you unsubscribe.
              </li>
              <li>
                <strong>Technical logs:</strong> for a short period, unless needed to investigate a security problem.
              </li>
            </ul>

            <h2>How we protect it</h2>
            <p>
              The whole site uses an encrypted (HTTPS) connection, and only authorised Mushk staff can access customer and order
              information. No method of storing or sending information online is completely secure, but we work hard to protect yours.
            </p>

            <h2>Your choices and rights</h2>
            <p>You can ask us to:</p>
            <ul>
              <li>tell you what personal information we hold about you and give you a copy,</li>
              <li>correct anything that&rsquo;s wrong,</li>
              <li>delete your information, unless we need to keep it to meet a legal obligation, such as accounting records for an order,</li>
              <li>stop sending you news and offers.</li>
            </ul>
            <p>To make any of these requests, {contact}. We&rsquo;ll respond as soon as we can.</p>

            <h2>Children</h2>
            <p>
              Our shop is meant for adults. If you are under 18, please ask a parent or guardian to place your order. We don&rsquo;t knowingly
              collect information from children.
            </p>

            <h2>Links to other websites</h2>
            <p>
              Our site links to services such as WhatsApp and social media. Those services have their own privacy policies, and we&rsquo;re
              not responsible for how they handle your information.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              If we change how we handle your information, we&rsquo;ll update this page and the &ldquo;Last updated&rdquo; date at the top.
            </p>

            <h2>Contact us</h2>
            <p>
              Questions about this policy or your information? Please {contact}. You can also read our{" "}
              <Link href="/shipping-returns">Shipping &amp; Returns policy</Link> and <Link href="/faq">FAQs</Link>.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
