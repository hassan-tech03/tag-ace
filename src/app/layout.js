import { GeistSans, GeistMono } from "geist/font";
import { Playfair_Display } from "next/font/google";
import "../styles/globals.scss";
import "../styles/no-underlines.css";
import ConditionalLayout from "../components/layout/ConditionalLayout";
import { CartProvider } from "../context/CartContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
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
