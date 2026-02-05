import { GeistSans, GeistMono } from "geist/font";
import "../styles/globals.scss";
import "../styles/no-underlines.css";
import Layout from "../components/layout/Layout";
import { CartProvider } from "../context/CartContext";

export const metadata = {
  title: "TagAce Perfumes - Discover Your Signature Scent",
  description:
    "Premium fragrances and luxury perfumes for men and women. Discover your perfect scent from our exclusive collection.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <CartProvider>
          <Layout>{children}</Layout>
        </CartProvider>
      </body>
    </html>
  );
}
