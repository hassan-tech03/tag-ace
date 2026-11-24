import { GeistSans, GeistMono } from "geist/font";
import { Playfair_Display } from "next/font/google";
import "../styles/globals.scss";
import "../styles/no-underlines.css";
import "../styles/blog.scss";
import "../styles/faq.scss";
import ConditionalLayout from "../components/layout/ConditionalLayout";
import { CartProvider } from "../context/CartContext";
import { JsonLd, organizationJsonLd, pageMetadata, SITE_NAME, siteOrigin, websiteJsonLd } from "../lib/seo";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  // Absolute base for Open Graph image/canonical URLs.
  metadataBase: new URL(siteOrigin()),
  ...pageMetadata({ path: "/" }),
  title: {
    default: "Mushk Perfumes · Premium Fragrances for Men & Women in Pakistan",
    template: `%s · ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  keywords: [
    "perfume Pakistan",
    "buy perfume online Pakistan",
    "men perfume",
    "women perfume",
    "oud perfume",
    "attar",
    "long lasting perfume",
    "Mushk Perfumes",
  ],
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-PK">
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`}>
        <JsonLd data={organizationJsonLd({ email: "mushk.scents1@gmail.com", phone: "+92 306 9167328" })} />
        <JsonLd data={websiteJsonLd()} />
        <CartProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  );
}
