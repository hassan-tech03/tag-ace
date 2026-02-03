import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.scss";
import Layout from "../components/layout/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TagAce Perfumes - Discover Your Signature Scent",
  description: "Premium fragrances and luxury perfumes for men and women. Discover your perfect scent from our exclusive collection.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
