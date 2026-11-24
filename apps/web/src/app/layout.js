import { GeistSans, GeistMono } from "geist/font";
import { Playfair_Display } from "next/font/google";
import "../styles/globals.scss";
import "../styles/no-underlines.css";
import "../styles/blog.scss";
import ConditionalLayout from "../components/layout/ConditionalLayout";
import { CartProvider } from "../context/CartContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  // Absolute base for Open Graph image/canonical URLs.
  metadataBase: new URL(process.env.SITE_URL || process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000"),
  title: "Mushk Perfumes - Discover Your Signature Scent",
  description:
    "Premium fragrances and luxury perfumes for men and women. Discover your perfect scent from our exclusive collection.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`}>
        <CartProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  );
}
