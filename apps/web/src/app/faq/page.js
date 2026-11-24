import Link from "next/link";
import { buildFaqs, faqPageJsonLd } from "@/lib/faqs";
import { getFaqContext } from "@/lib/faqContext";
import { breadcrumbJsonLd, JsonLd, pageMetadata } from "@/lib/seo";
import FaqAnswer from "@/components/storefront/FaqAnswer";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "FAQs: Orders, Delivery & Returns",
  description:
    "Answers about ordering from Mushk Perfumes: Cash on Delivery, card payments, delivery times and charges across Pakistan, returns for damaged items, and fragrance care.",
  path: "/faq",
});

export default async function FaqPage() {
  const ctx = await getFaqContext();
  const groups = buildFaqs(ctx);

  return (
    <div className="faq-page">
      <JsonLd data={faqPageJsonLd(groups)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "FAQs", path: "/faq" },
        ])}
      />

      <section className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>FAQs</span>
          </div>
          <h1>Frequently Asked Questions</h1>
          <p>Everything about ordering, delivery, returns and caring for your fragrance.</p>
        </div>
      </section>

      <div className="container faq-container">
        <nav className="faq-nav" aria-label="FAQ topics">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="faq-chip">
              {g.title}
            </a>
          ))}
        </nav>

        {groups.map((g) => (
          <section key={g.id} id={g.id} className="faq-group">
            <h2>{g.title}</h2>
            <div className="faq-accordion">
              {g.items.map((f, i) => (
                <details key={f.id} id={f.id} className="faq-entry" open={g.id === "orders" && i === 0}>
                  <summary>
                    <span>{f.q}</span>
                    <span className="faq-icon" aria-hidden="true" />
                  </summary>
                  <FaqAnswer text={f.a} className="faq-answer" />
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="faq-help">
          <h3>Still have a question?</h3>
          <p>We're happy to help with orders, delivery or choosing a fragrance.</p>
          <div className="faq-help__buttons">
            <Link href="/contact" className="blog-btn blog-btn--dark">
              Contact us
            </Link>
            {ctx.phone && (
              <a
                href={`https://wa.me/92${ctx.phone.replace(/\D/g, "").replace(/^0/, "")}`}
                className="blog-btn blog-btn--light"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
