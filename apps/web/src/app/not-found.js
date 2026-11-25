import Link from "next/link";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

// Branded 404 for unknown URLs (header/footer come from the root layout).
export default function NotFound() {
  return (
    <section className="not-found-page">
      <div className="container">
        <p className="not-found-code">404</p>
        <h1>We couldn&apos;t find that page</h1>
        <p className="not-found-text">
          The link may be old or mistyped. Try one of these instead:
        </p>
        <div className="not-found-actions">
          <Link href="/shop" className="blog-btn blog-btn--dark">Shop all perfumes</Link>
          <Link href="/" className="blog-btn blog-btn--light">Go to home</Link>
        </div>
        <ul className="not-found-links">
          <li><Link href="/shop/men">Men&apos;s fragrances</Link></li>
          <li><Link href="/shop/women">Women&apos;s fragrances</Link></li>
          <li><Link href="/blog">Blog</Link></li>
          <li><Link href="/faq">FAQs</Link></li>
          <li><Link href="/contact">Contact us</Link></li>
        </ul>
      </div>
    </section>
  );
}
